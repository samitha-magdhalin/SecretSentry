import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GitHubService } from './services/github';
import { GeminiService } from './services/gemini';
import { GithubRepo, GithubUser, ScanResult, SecretFinding, Severity } from './types';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('gh_token'));
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'landing' | 'dashboard' | 'scan'>('landing');
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanProgress, setScanProgress] = useState<{current: number, total: number}>({current: 0, total: 0});

  const githubService = useMemo(() => (token ? new GitHubService(token) : null), [token]);
  const geminiService = useMemo(() => new GeminiService(), []);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('gh_token', newToken);
    setToken(newToken);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('gh_token');
    setToken(null);
    setUser(null);
    setRepos([]);
    setActiveView('landing');
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!githubService) return;
    setLoading(true);
    setError(null);
    try {
      const [userData, reposData] = await Promise.all([
        githubService.getUser(),
        githubService.getRepos()
      ]);
      setUser(userData);
      setRepos(reposData);
      setActiveView('dashboard');
    } catch (err: any) {
      if (err.message.includes('GITHUB_INVALID_TOKEN')) {
        setError("Your GitHub token is invalid. Please sign in with a valid token.");
        handleLogout();
      } else if (err.message.includes('GITHUB_RATE_LIMIT')) {
        setError("GitHub rate limit exceeded. Please wait a few minutes before trying again.");
        setActiveView('landing');
      } else {
        setError("Failed to connect to GitHub: " + err.message);
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [githubService, handleLogout]);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token, fetchUserData]);

  const startScan = async (repo: GithubRepo) => {
    if (!githubService) return;
    setSelectedRepo(repo);
    setActiveView('scan');
    setScanResult(null);
    setError(null);
    setScanProgress({current: 0, total: 0});

    const startTime = performance.now();
    let peakMemory = 0;

    try {
      const files = await githubService.getAllFiles(repo.full_name);
      setScanProgress({current: 0, total: files.length});

      let allFindings: SecretFinding[] = [];
      const BATCH_SIZE = 5; 
      
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        
        const batchFindings = await Promise.all(
          batch.map(async (file) => {
            try {
              const content = await githubService.getFileContent(repo.full_name, file.path);
              const results = await geminiService.analyzeCodeForSecrets(content, file.path);
              
              if (results.length > 0) {
                const commitInfo = await githubService.getCommitInfo(repo.full_name, file.path);
                if (commitInfo) {
                    const commitDate = new Date(commitInfo.date);
                    const now = new Date();
                    const diffDays = Math.floor((now.getTime() - commitDate.getTime()) / (1000 * 3600 * 24));
                    
                    return results.map(r => ({
                        ...r,
                        commitHash: commitInfo.hash,
                        authorName: commitInfo.author,
                        commitDate: commitInfo.date,
                        daysExposed: diffDays,
                        isHistoryOnly: false 
                    }));
                }
              }
              return results;
            } catch (fileErr: any) {
              if (fileErr.message.includes('GITHUB_RATE_LIMIT')) {
                throw fileErr; // Bubble up rate limit errors to stop the scan
              }
              console.error(`Failed to process ${file.path}:`, fileErr);
              return [];
            } finally {
              // Capture memory if available
              if ((performance as any).memory) {
                peakMemory = Math.max(peakMemory, (performance as any).memory.usedJSHeapSize);
              }
              setScanProgress(prev => ({...prev, current: prev.current + 1}));
            }
          })
        );

        allFindings = [...allFindings, ...batchFindings.flat()];
      }

      const endTime = performance.now();
      const durationMs = endTime - startTime;

      setScanResult({
        repoName: repo.full_name,
        findings: allFindings,
        timestamp: new Date().toISOString(),
        scannedFilesCount: files.length,
        durationMs: durationMs,
        avgTimePerFile: durationMs / (files.length || 1),
        peakMemoryMB: peakMemory ? Math.round(peakMemory / 1024 / 1024) : undefined
      });
    } catch (err: any) {
      let errorMessage = "Scan failed: " + err.message;
      if (err.message.includes('GITHUB_RATE_LIMIT')) {
        errorMessage = "Scan interrupted: GitHub rate limit exceeded. The scan could not be completed.";
      } else if (err.message.includes('GITHUB_INVALID_TOKEN')) {
        errorMessage = "Scan failed: Your GitHub session has expired. Please log in again.";
        handleLogout();
      }
      setError(errorMessage);
      setActiveView('dashboard');
    }
  };

  const handleAdHocScan = async (code: string): Promise<SecretFinding[]> => {
    return await geminiService.analyzeCodeForSecrets(code, "Ad-hoc Snippet");
  };

  const createIssue = async (finding: SecretFinding) => {
    if (!githubService || !selectedRepo) return;
    const title = `🚨 Security Alert: Potential Secret Leak in ${finding.file}`;
    const body = `
### SecretSentry AI Detection
**Type:** ${finding.type}
**Severity:** ${finding.severity}
**File:** ${finding.file} (Line ${finding.line})
**Commit:** ${finding.commitHash?.substring(0, 7) || 'N/A'}
**Exposed For:** ${finding.daysExposed} days

**Risk Assessment:**
${finding.explanation}

**Remediation Steps:**
${finding.suggestion}

*Detected automatically by SecretSentry.*
    `;
    try {
      await githubService.createIssue(selectedRepo.full_name, title, body);
      alert("Successfully created GitHub issue!");
    } catch (err: any) {
      if (err.message.includes('GITHUB_RATE_LIMIT')) {
        alert("Failed to create issue: GitHub rate limit exceeded. Please try again later.");
      } else {
        alert("Failed to create issue: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onGoHome={() => setActiveView(token ? 'dashboard' : 'landing')} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeView === 'landing' && !loading && (
          <LandingPage onLogin={handleLogin} onAdHocScan={handleAdHocScan} />
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-slate-400">Communicating with GitHub...</p>
          </div>
        )}

        {error && (
          <div className="animate-slide-up bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-2xl mb-8 flex justify-between items-center shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {activeView === 'dashboard' && !loading && (
          <Dashboard 
            repos={repos} 
            onScan={startScan} 
            onAdHocScan={handleAdHocScan}
          />
        )}

        {activeView === 'scan' && selectedRepo && (
          <Scanner 
            repo={selectedRepo} 
            result={scanResult} 
            progress={scanProgress}
            onCreateIssue={createIssue}
            onBack={() => setActiveView('dashboard')}
          />
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} SecretSentry. Protecting developers from the dark web.
      </footer>
    </div>
  );
};

export default App;