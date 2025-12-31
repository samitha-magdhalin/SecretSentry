
import React, { useState } from 'react';
import { GithubRepo, SecretFinding, Severity } from '../types';

interface DashboardProps {
  repos: GithubRepo[];
  onScan: (repo: GithubRepo) => void;
  onAdHocScan: (code: string) => Promise<SecretFinding[]>;
}

const Dashboard: React.FC<DashboardProps> = ({ repos, onScan, onAdHocScan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [adHocCode, setAdHocCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [adhocResults, setAdhocResults] = useState<SecretFinding[]>([]);
  const [hasScanned, setHasScanned] = useState(false);

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickScan = async () => {
    if (!adHocCode.trim()) return;
    setIsAnalyzing(true);
    setHasScanned(false);
    try {
      const results = await onAdHocScan(adHocCode);
      setAdhocResults(results);
      setHasScanned(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-16 animate-slide-up">
      {/* Quick Sandbox Section */}
      <section className="glass rounded-[2.5rem] p-12 border border-white/5 shadow-3xl">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black">Snippet Sandbox</h2>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              Test a specific block of code without running a full repository scan. Immediate AI feedback.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-xs font-bold text-slate-500 bg-white/5 px-4 py-2 rounded-xl">
                <svg className="w-4 h-4 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Real-time threat assessment
              </div>
            </div>
          </div>
          <div className="lg:w-2/3 flex flex-col space-y-6">
            <div className="relative group">
              <textarea 
                value={adHocCode}
                onChange={(e) => setAdHocCode(e.target.value)}
                placeholder="Paste code snippet here..."
                className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-sm text-indigo-300 placeholder-slate-700 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner"
              />
              {adHocCode && (
                <button 
                  onClick={() => {setAdHocCode(''); setHasScanned(false);}}
                  className="absolute top-4 right-4 p-2 text-slate-600 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleQuickScan}
                disabled={isAnalyzing || !adHocCode.trim()}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-2xl transition-all flex items-center shadow-2xl shadow-indigo-600/20 active:scale-95"
              >
                {isAnalyzing ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isAnalyzing ? 'Analyzing...' : 'Scan Snippet'}
              </button>
            </div>
          </div>
        </div>

        {hasScanned && (
          <div className="mt-12 pt-12 border-t border-white/5 animate-slide-up">
            {adhocResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adhocResults.map((finding) => (
                  <QuickResultCard key={finding.id} finding={finding} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-emerald-400 font-bold text-sm tracking-tight">Snippet Secure: No hardcoded secrets detected.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Repositories Section */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-4xl font-black mb-2 text-white">Project Repositories</h2>
            <p className="text-slate-400 font-medium">Select a project to initiate a deep-history AI audit.</p>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <input 
              type="text"
              placeholder="Filter repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative w-full sm:w-96 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all placeholder-slate-700"
            />
            <svg className="w-5 h-5 absolute left-4 top-4.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRepos.length > 0 ? (
            filteredRepos.map(repo => (
              <RepoCard key={repo.id} repo={repo} onScan={() => onScan(repo)} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center glass rounded-[3rem] border-dashed border-white/10">
              <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-slate-500 font-black text-xl tracking-tight">No matching repositories found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const QuickResultCard: React.FC<{ finding: SecretFinding }> = ({ finding }) => {
  const colors = {
    [Severity.CRITICAL]: 'border-red-500/30 text-red-400 bg-red-500/10',
    [Severity.HIGH]: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
    [Severity.MEDIUM]: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
    [Severity.LOW]: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  };

  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase tracking-widest ${colors[finding.severity]}`}>
          {finding.severity}
        </span>
        <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">{finding.type}</span>
      </div>
      <div className="font-mono text-[11px] text-pink-500/80 bg-black/50 p-2.5 rounded-xl border border-white/5 mb-4 truncate">
         {finding.redactedSecret}
      </div>
      <p className="text-slate-400 text-xs leading-relaxed font-medium line-clamp-2 italic">
        "{finding.explanation}"
      </p>
    </div>
  );
};

const RepoCard: React.FC<{ repo: GithubRepo, onScan: () => void }> = ({ repo, onScan }) => (
  <div className="glass-card rounded-[2.5rem] p-8 group flex flex-col justify-between h-full">
    <div>
      <div className="flex items-center justify-between mb-8">
        {repo.private ? (
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 rounded-xl border border-white/5">Private</span>
        ) : (
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">Public</span>
        )}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold">
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
          <span>{repo.stargazers_count}</span>
        </div>
      </div>
      <h3 className="text-2xl font-black mb-3 text-white truncate group-hover:text-indigo-400 transition-colors">{repo.name}</h3>
      <p className="text-sm text-slate-500 line-clamp-2 mb-8 h-10 leading-relaxed font-medium">
        {repo.description || "Project repository awaiting deep-scan analysis."}
      </p>
      <div className="flex flex-wrap gap-4 mb-10">
        <div className="flex items-center text-[11px] font-black uppercase tracking-widest text-slate-500">
          <span className={`w-2 h-2 rounded-full mr-2 shadow-[0_0_8px_rgba(99,102,241,0.5)] ${repo.language ? 'bg-indigo-500' : 'bg-slate-700'}`}></span>
          {repo.language || 'Generic'}
        </div>
        <div className="flex items-center text-[11px] font-black uppercase tracking-widest text-slate-500">
            <svg className="w-4 h-4 mr-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {new Date(repo.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
    <button 
      onClick={onScan}
      className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-2"
    >
      <span>Initialize Audit</span>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </div>
);

export default Dashboard;
