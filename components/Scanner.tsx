
import React from 'react';
import { GithubRepo, ScanResult, SecretFinding, Severity } from '../types';

interface ScannerProps {
  repo: GithubRepo;
  result: ScanResult | null;
  progress: { current: number, total: number };
  onCreateIssue: (finding: SecretFinding) => void;
  onBack: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ repo, result, progress, onCreateIssue, onBack }) => {
  const isScanning = !result;
  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-slide-up pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="group flex items-center text-sm font-bold dark:text-slate-400 text-slate-600 hover:text-indigo-500 transition-colors"
        >
          <div className="p-2 glass rounded-xl mr-3 group-hover:bg-indigo-500/10 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Exit Audit Mode
        </button>
        {result && (
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 bg-slate-500/5 px-4 py-2 rounded-xl border border-slate-500/10">
                Audit Completed • {new Date(result.timestamp).toLocaleTimeString()}
            </div>
        )}
      </div>

      {/* Main Stats Header */}
      <div className="glass rounded-[3rem] p-12 border border-slate-500/10 shadow-3xl overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
          <div className="flex items-center space-x-6">
            <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] shadow-[0_0_30px_rgba(99,102,241,0.2)] text-white">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black dark:text-white text-slate-900">{repo.name}</h1>
              <p className="dark:text-slate-500 text-slate-400 font-bold tracking-tight">{repo.full_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            <StatBox label="Status">
              {isScanning ? (
                <span className="text-indigo-500 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse mr-2"></span>
                    Scanning...
                </span>
              ) : result.findings.length > 0 ? (
                <span className="text-red-500">Vulnerable</span>
              ) : (
                <span className="text-emerald-500">Secured</span>
              )}
            </StatBox>
            <StatBox label="Leaks">
              <span className={`font-mono ${result?.findings.length ? 'text-red-500' : 'dark:text-slate-400 text-slate-600'}`}>
                {result ? result.findings.length : '--'}
              </span>
            </StatBox>
            <StatBox label="Total Nodes">
              <span className="font-mono dark:text-slate-400 text-slate-600">
                {result ? result.scannedFilesCount : (progress.current || '--')}
              </span>
            </StatBox>
            <StatBox label="Duration">
              <span className="font-mono dark:text-slate-400 text-slate-600">
                {result ? `${(result.durationMs / 1000).toFixed(1)}s` : '--'}
              </span>
            </StatBox>
            <StatBox label="Avg/Node">
              <span className="font-mono text-indigo-500 text-sm">
                {result?.avgTimePerFile ? `${result.avgTimePerFile.toFixed(0)}ms` : '--'}
              </span>
            </StatBox>
            <StatBox label="Peak Heap">
              <span className="font-mono text-purple-500 text-sm">
                {result?.peakMemoryMB ? `${result.peakMemoryMB}MB` : 'N/A'}
              </span>
            </StatBox>
          </div>
        </div>

        {isScanning && (
          <div className="mt-16 space-y-8 animate-slide-up">
            <div className="relative h-3 w-full bg-slate-500/10 rounded-full overflow-hidden border border-slate-500/5">
                <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 h-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="p-2 glass rounded-lg">
                        <svg className="animate-spin h-4 w-4 text-indigo-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-sm font-bold dark:text-slate-400 text-slate-500">
                        {progress.total === 0 ? 'Maping repository nodes...' : `Analyzing Node ${progress.current} of ${progress.total}`}
                    </p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/50">Gemini 3 Flash • Parallel Context</div>
            </div>
          </div>
        )}
      </div>

      {!isScanning && (
        <div className="space-y-12">
          <div className="flex items-center justify-between border-b dark:border-white/5 border-slate-200 pb-8">
            <h2 className="text-3xl font-black dark:text-white text-slate-900 flex items-center">
              Security Log
              <span className="ml-4 px-3 py-1 bg-slate-500/10 text-slate-500 text-xs font-black uppercase tracking-widest rounded-xl">
                {result.findings.length} findings
              </span>
            </h2>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active File</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Git History</span>
              </div>
            </div>
          </div>

          {result.findings.length > 0 ? (
            <div className="grid grid-cols-1 gap-12">
              {result.findings.map(finding => (
                <AuditFindingCard 
                  key={finding.id} 
                  finding={finding} 
                  onAction={() => onCreateIssue(finding)} 
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-[3rem] p-24 text-center border-emerald-500/10 bg-emerald-500/5">
              <div className="bg-emerald-500/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-4xl font-black text-emerald-500 mb-4">No Secrets Leaked</h3>
              <p className="dark:text-slate-500 text-slate-400 text-lg font-medium max-w-lg mx-auto leading-relaxed">
                Gemini AI completed a deep scan of {result.scannedFilesCount} files. No recognized secrets or exposed credentials were found.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatBox: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
  <div className="text-center sm:text-left">
    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</div>
    <div className="text-xl font-black tracking-tight dark:text-white text-slate-800">{children}</div>
  </div>
);

const AuditFindingCard: React.FC<{ finding: SecretFinding, onAction: () => void }> = ({ finding, onAction }) => {
  const styles = {
    [Severity.CRITICAL]: 'border-red-500 text-red-500 bg-red-500/5',
    [Severity.HIGH]: 'border-orange-500 text-orange-500 bg-orange-500/5',
    [Severity.MEDIUM]: 'border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-500/5',
    [Severity.LOW]: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5',
  };

  const isHistory = finding.isHistoryOnly;

  return (
    <div className={`glass-card rounded-[3rem] overflow-hidden group border-l-[10px] ${isHistory ? 'border-l-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-l-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}`}>
      <div className="p-10 lg:p-14 space-y-12">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[finding.severity]}`}>
                {finding.severity}
              </span>
              {isHistory ? (
                <span className="px-4 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center">
                    <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Git Vault (Commit History)
                </span>
              ) : (
                <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center">
                    <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Active Registry (Current)
                </span>
              )}
            </div>
            <h3 className="text-4xl font-black dark:text-white text-slate-900 group-hover:text-indigo-500 transition-colors leading-tight">
              {finding.type}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center glass px-6 py-4 rounded-2xl border-indigo-500/5 space-x-6">
                <div className="text-center pr-6 border-r border-slate-500/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Exposure</p>
                    <p className={`text-xl font-black ${finding.daysExposed && finding.daysExposed > 30 ? 'text-red-500' : 'dark:text-white text-slate-900'}`}>
                        {finding.daysExposed ?? '??'}d
                    </p>
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Author</p>
                    <p className="text-sm font-black dark:text-white text-slate-900 truncate max-w-[120px]">{finding.authorName || 'Unknown'}</p>
                </div>
            </div>
            <button 
                onClick={onAction}
                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 flex items-center"
            >
                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Raise Issue
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resource Registry Path</p>
                <div className="font-mono text-xs bg-slate-500/5 dark:bg-black/40 p-5 rounded-2xl border border-slate-500/10 text-indigo-500 break-all leading-loose">
                    {finding.file} <span className="bg-indigo-500/10 dark:text-white text-indigo-700 px-2 py-1 rounded ml-2">L:{finding.line}</span>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Detection Evidence</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Context: {finding.snippet.length} chars</span>
                </div>
                <div className="bg-slate-950 p-8 rounded-3xl border border-slate-500/10 font-mono text-sm shadow-inner overflow-hidden text-slate-300">
                    <p className="text-pink-500 font-bold mb-6 flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500 mr-4 animate-pulse"></span>
                        LEAK DETECTED: <span className="ml-3 bg-pink-500/10 px-4 py-1.5 rounded-xl border border-pink-500/20 tracking-wider font-extrabold">{finding.redactedSecret}</span>
                    </p>
                    <div className="text-slate-500 text-xs whitespace-pre-wrap leading-relaxed italic opacity-80 border-l-2 border-slate-800 pl-6 py-2">
                        "{finding.snippet}"
                    </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="p-10 glass rounded-[2.5rem] h-full space-y-8">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4">AI Audit Logic</p>
                    <p className="dark:text-slate-300 text-slate-600 text-sm font-medium leading-relaxed italic">
                        "{finding.explanation}"
                    </p>
                </div>
                <div className="pt-8 border-t dark:border-white/5 border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4">Remediation Guide</p>
                    <p className="dark:text-slate-400 text-slate-500 text-xs leading-relaxed font-bold bg-slate-500/5 p-5 rounded-2xl border border-slate-500/5">
                        {finding.suggestion}
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
