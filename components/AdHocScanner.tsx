
import React, { useState } from 'react';
import { SecretFinding, Severity } from '../types';

interface AdHocScannerProps {
  onScan: (code: string) => Promise<SecretFinding[]>;
  onBack: () => void;
}

const AdHocScanner: React.FC<AdHocScannerProps> = ({ onScan, onBack }) => {
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [findings, setFindings] = useState<SecretFinding[]>([]);
  const [hasScanned, setHasScanned] = useState(false);

  const handleScan = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setHasScanned(false);
    try {
      const results = await onScan(code);
      setFindings(results);
      setHasScanned(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-sm text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-600/20">
                <svg className="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Ad-hoc Snippet Scan</h1>
              <p className="text-slate-400">Paste raw code below to check for vulnerabilities and hardcoded secrets.</p>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here... (e.g. const API_KEY = 'sk-12345...')"
              className="w-full h-64 bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-sm text-indigo-100 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none shadow-inner"
            ></textarea>
            {code && (
                <button 
                    onClick={() => setCode('')}
                    className="absolute top-4 right-4 p-2 text-slate-600 hover:text-slate-300 transition-colors"
                    title="Clear Code"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleScan}
              disabled={isAnalyzing || !code.trim()}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center space-x-3 active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Gemini is Analyzing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Check for Secrets</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {hasScanned && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-bold flex items-center">
              Scan Results
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${findings.length > 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                {findings.length} findings
              </span>
            </h2>
          </div>

          {findings.length > 0 ? (
            <div className="grid grid-cols-1 gap-12">
              {findings.map(finding => (
                <SnippetFindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center shadow-xl">
              <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Code snippet is secure!</h3>
              <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">Gemini analyzed your code and found no recognizable secrets or high-risk credentials. Always remember to use environment variables for sensitive data.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const SnippetFindingCard: React.FC<{ finding: SecretFinding }> = ({ finding }) => {
  const severityStyles = {
    [Severity.CRITICAL]: {
      border: 'hover:border-red-500/50',
      badge: 'bg-red-500/10 text-red-500 border-red-500/30',
      accent: 'bg-red-500',
      glow: 'shadow-red-500/10',
      bg: 'from-red-500/5 to-transparent'
    },
    [Severity.HIGH]: {
      border: 'hover:border-orange-500/50',
      badge: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
      accent: 'bg-orange-500',
      glow: 'shadow-orange-500/10',
      bg: 'from-orange-500/5 to-transparent'
    },
    [Severity.MEDIUM]: {
      border: 'hover:border-yellow-500/50',
      badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      accent: 'bg-yellow-500',
      glow: 'shadow-yellow-500/10',
      bg: 'from-yellow-500/5 to-transparent'
    },
    [Severity.LOW]: {
      border: 'hover:border-blue-500/50',
      badge: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      accent: 'bg-blue-500',
      glow: 'shadow-blue-500/10',
      bg: 'from-blue-500/5 to-transparent'
    },
  };

  const style = severityStyles[finding.severity];

  return (
    <div className={`relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden transition-all shadow-2xl group ${style.border} ${style.glow}`}>
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${style.accent}`}></div>

      <div className={`p-8 bg-gradient-to-b ${style.bg}`}>
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${style.badge}`}>
                {finding.severity}
              </span>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                Source: Code Snippet
              </span>
            </div>
            <h3 className="text-2xl font-bold group-hover:text-white transition-colors">{finding.type}</h3>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase text-slate-500 font-bold tracking-widest flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Detected Secret
                </p>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">Redacted</span>
            </div>
            <div className="space-y-2">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-sm group-hover:border-slate-700 transition-colors shadow-inner">
                    <p className="text-pink-500 mb-3 select-none flex items-center">
                        <span className="mr-3">LEAK:</span> 
                        <span className="bg-pink-500/10 px-3 py-1 rounded-lg border border-pink-500/20 tracking-wider">
                            {finding.redactedSecret}
                        </span>
                    </p>
                    <div className="text-xs text-slate-400 whitespace-pre overflow-x-auto pb-2 italic">
                        Snippet: "{finding.snippet}"
                    </div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-indigo-500/5 rounded-3xl border border-indigo-500/10 p-8 shadow-inner">
              <p className="text-xs uppercase text-indigo-400 font-bold tracking-widest mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Risk Assessment
              </p>
              <div className="text-slate-300 text-sm leading-relaxed">
                <p className="font-semibold text-slate-200 mb-3">Potential Impact:</p>
                <p className="italic bg-indigo-500/5 border-l-2 border-indigo-500/30 pl-5 py-3 rounded-r-2xl">
                  "{finding.explanation}"
                </p>
              </div>
            </div>

            <div className="bg-green-500/5 rounded-3xl border border-green-500/10 p-8 shadow-inner">
              <p className="text-xs uppercase text-green-400 font-bold tracking-widest mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Remediation
              </p>
              <div className="text-slate-300 text-sm leading-relaxed space-y-6">
                <div>
                  <p className="font-bold text-green-200 mb-2 flex items-center">
                    AI Recommendation:
                  </p>
                  <p className="text-green-300/80 bg-green-500/5 p-4 rounded-2xl border border-green-500/10 leading-relaxed">
                    {finding.suggestion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdHocScanner;
