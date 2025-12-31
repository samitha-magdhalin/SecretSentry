import React, { useState } from 'react';
import { SecretFinding, Severity } from '../types';

interface LandingPageProps {
  onLogin: (token: string) => void;
  onAdHocScan: (code: string) => Promise<SecretFinding[]>;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onAdHocScan }) => {
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [sandboxCode, setSandboxCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SecretFinding[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onLogin(token.trim());
    }
  };

  const steps = [
    "Checking Logic Context...",
    "Filtering UI Hashes...",
    "Calculating String Entropy...",
    "Validating Variable Bindings...",
    "Security Report Finalizing..."
  ];

  const handleSandboxScan = async () => {
    if (!sandboxCode.trim()) return;
    setIsAnalyzing(true);
    setHasScanned(false);
    setScanError(null);
    setResults([]);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const findings = await onAdHocScan(sandboxCode);
      setResults(findings);
      setHasScanned(true);
    } catch (err: any) {
      setScanError(err.message || "Precision audit failed.");
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
    }
  };

  const loadExample = () => {
    setSandboxCode(`// App Styles (AI should IGNORE these)
const styles = "bg-[length:200%_auto] text-[#6366f1] h-[32px]";
const svg = "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6";

// App Secrets (AI should FLAG these)
const DB_PASS = "super_secret_pword_123";
const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 space-y-32">
      {/* Hero Section */}
      <section className="text-center pt-20 animate-slide-up">
        <div className="flex justify-center mb-8">
          <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Precision Security Audit
          </span>
        </div>
        <h1 className="text-6xl sm:text-8xl font-black mb-8 tracking-tight text-white leading-tight">
          Secure your code <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">without noise.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          The only scanner that understands the difference between a Tailwind hash and a production API key.
        </p>

        <div className="flex flex-col items-center justify-center">
          {!showTokenInput ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-md">
              <button 
                onClick={() => setShowTokenInput(true)}
                className="w-full px-8 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all shadow-xl"
              >
                Scan Repositories
              </button>
              <a href="#sandbox" className="w-full px-8 py-5 glass border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/5 transition-all flex items-center justify-center">
                Try Sandbox
              </a>
            </div>
          ) : (
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-slide-up">
              <form onSubmit={handleSubmit} className="glass p-8 rounded-[2rem] border border-white/10 shadow-3xl h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-white">GitHub Access</h3>
                  <input 
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 mb-6 focus:border-indigo-500 outline-none font-mono text-center text-white placeholder-slate-700"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setShowTokenInput(false)} className="px-4 py-4 glass border-white/5 rounded-2xl font-bold text-slate-400">Back</button>
                  <button type="submit" className="px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-indigo-600/20">Authorize</button>
                </div>
              </form>
              <div className="glass p-8 rounded-[2rem] border border-indigo-500/20 bg-indigo-500/5 text-left h-full">
                <h4 className="text-lg font-bold text-white mb-4">Noise Reduction</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our Gemini Pro engine filters CSS hashes, SVG paths, and UI identifiers automatically to prevent false positives in your scan reports.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sandbox */}
      <section id="sandbox" className="relative">
        <div className="glass rounded-[3rem] border border-white/10 overflow-hidden">
          <div className="flex flex-col lg:flex-row divide-white/5">
            <div className="lg:w-1/3 p-12 lg:p-16 space-y-8">
              <h2 className="text-4xl font-black text-white">Noise Test</h2>
              <p className="text-slate-400 font-medium">
                Paste code containing CSS hashes or SVG paths to see the precision engine in action.
              </p>
              <button onClick={loadExample} className="w-full px-6 py-4 glass border-indigo-500/20 text-indigo-400 text-sm font-bold rounded-2xl hover:bg-indigo-500/10 transition-all">
                Load Noise + Secrets
              </button>
            </div>
            <div className="lg:w-2/3 p-12 lg:p-16 flex flex-col space-y-8 bg-black/20">
              <textarea 
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                placeholder="// Paste code with CSS hashes and actual secrets..."
                className="w-full h-[320px] bg-slate-950/80 border border-white/10 rounded-3xl p-8 font-mono text-sm text-indigo-300 outline-none"
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleSandboxScan}
                  disabled={isAnalyzing || !sandboxCode.trim()}
                  className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-2xl active:scale-95"
                >
                  {isAnalyzing ? "Precision Check..." : "Run Precision Audit"}
                </button>
              </div>
            </div>
          </div>

          {(hasScanned || scanError || isAnalyzing) && (
            <div className="p-12 lg:p-16 bg-black/40 border-t border-white/5 animate-slide-up">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mb-8"></div>
                  <h4 className="text-2xl font-black text-white">{steps[scanStep]}</h4>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-12">
                  <h3 className="text-3xl font-black text-white">Confirmed Leaks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {results.map((f) => (
                      <div key={f.id} className="glass-card p-10 rounded-[2.5rem] border-l-8 border-l-red-500">
                        <div className="flex justify-between mb-6">
                           <span className="text-[10px] font-black uppercase text-red-400">{f.severity}</span>
                           <span className="text-[10px] font-black uppercase text-slate-500">{f.type}</span>
                        </div>
                        <div className="bg-black/60 p-4 rounded-xl font-mono text-pink-400 text-sm mb-6 truncate">{f.redactedSecret}</div>
                        <p className="text-slate-300 text-sm mb-4">"{f.explanation}"</p>
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                           <p className="text-[9px] font-black uppercase text-emerald-400 mb-2">Remediation</p>
                           <p className="text-xs text-slate-400">{f.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h4 className="text-3xl font-black text-emerald-400">Noise Filtered. System Clear.</h4>
                  <p className="text-slate-500 max-w-md mx-auto mt-4">No real secrets detected. All identified high-entropy strings were classified as non-sensitive UI data.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;