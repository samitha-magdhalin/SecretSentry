
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onLogin(token.trim());
    }
  };

  const handleSandboxScan = async () => {
    if (!sandboxCode.trim()) return;
    setIsAnalyzing(true);
    setHasScanned(false);
    try {
      const findings = await onAdHocScan(sandboxCode);
      setResults(findings);
      setHasScanned(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadExample = () => {
    setSandboxCode(`// App configuration\nconst config = {\n  apiKey: "AIzaSyB-8L1mX9z2WvQ4u7T3rE5yI0oP1sA",\n  db_password: "super_secret_password_123",\n  aws_key: "AKIAIOSFODNN7EXAMPLE"\n};`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 space-y-32">
      {/* Hero Section */}
      <section className="text-center pt-20 animate-slide-up">
        <div className="flex justify-center mb-8">
          <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            Intelligence-Driven Security
          </span>
        </div>
        <h1 className="text-6xl sm:text-8xl font-black mb-8 tracking-tight text-white">
          Secure your code <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">in seconds.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Elite AI detection for exposed credentials. Don't wait for the breach—find secrets in your repositories and history before they're exploited.
        </p>

        <div className="flex flex-col items-center justify-center">
          {!showTokenInput ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-md">
              <button 
                onClick={() => setShowTokenInput(true)}
                className="w-full px-8 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95"
              >
                Connect GitHub
              </button>
              <a href="#sandbox" className="w-full px-8 py-5 glass border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/5 transition-all flex items-center justify-center">
                Try Sandbox
              </a>
            </div>
          ) : (
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-slide-up">
              {/* Form Card */}
              <form onSubmit={handleSubmit} className="glass p-8 rounded-[2rem] border border-white/10 shadow-3xl h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Authorize GitHub</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    Enter your GitHub Personal Access Token below to scan your private and public repositories.
                  </p>
                  <input 
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 mb-6 focus:border-indigo-500 outline-none font-mono text-center text-white placeholder-slate-700 transition-all shadow-inner"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowTokenInput(false)}
                    className="px-4 py-4 glass border-white/5 rounded-2xl transition-all font-bold text-slate-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Secure Repos
                  </button>
                </div>
              </form>

              {/* Instructions Card */}
              <div className="glass p-8 rounded-[2rem] border border-indigo-500/20 bg-indigo-500/5 text-left h-full flex flex-col justify-center">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-white">How to get a Token?</h4>
                </div>
                <ul className="space-y-4 text-xs font-medium text-slate-400 leading-relaxed">
                  <li className="flex items-start">
                    <span className="bg-indigo-500/20 text-indigo-300 w-5 h-5 rounded-md flex items-center justify-center mr-3 shrink-0">1</span>
                    Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Settings &gt; Developer Settings</a>.
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-500/20 text-indigo-300 w-5 h-5 rounded-md flex items-center justify-center mr-3 shrink-0">2</span>
                    Select <b>Tokens (classic)</b> &gt; <b>Generate new token</b>.
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-500/20 text-indigo-300 w-5 h-5 rounded-md flex items-center justify-center mr-3 shrink-0">3</span>
                    Check the <code className="text-indigo-400 bg-white/5 px-1.5 py-0.5 rounded">repo</code> scope checkbox.
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-500/20 text-indigo-300 w-5 h-5 rounded-md flex items-center justify-center mr-3 shrink-0">4</span>
                    Click <b>Generate</b>, copy it, and paste it here.
                  </li>
                </ul>
                <div className="mt-8 p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Privacy Note</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">We never store your token on any server. It exists only for this active browser session.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modern Sandbox */}
      <section id="sandbox" className="relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
        <div className="glass rounded-[3rem] border border-white/10 overflow-hidden relative">
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">
            <div className="lg:w-1/3 p-12 lg:p-16 space-y-8">
              <div>
                <h2 className="text-4xl font-black mb-4">Secret Sandbox</h2>
                <p className="text-slate-400 leading-relaxed font-medium">
                  Experience our detection engine. Paste code or configuration data to see Gemini AI identify potential threats in real-time.
                </p>
              </div>
              
              <div className="space-y-6">
                <button 
                  onClick={loadExample}
                  className="w-full px-6 py-4 glass border-indigo-500/20 text-indigo-400 text-sm font-bold rounded-2xl flex items-center justify-center hover:bg-indigo-500/10 transition-all"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Inject Sample Code
                </button>
                <div className="grid grid-cols-2 gap-3">
                  {['AWS', 'OpenAI', 'Slack', 'Stripe'].map(tag => (
                    <div key={tag} className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">
                      {tag} Support
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 p-12 lg:p-16 flex flex-col space-y-8 bg-black/20">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                <textarea 
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  placeholder="// Paste your code here..."
                  className="relative w-full h-[320px] bg-slate-950/80 border border-white/10 rounded-3xl p-8 font-mono text-sm text-indigo-300 placeholder-slate-700 focus:border-indigo-500 outline-none transition-all resize-none shadow-2xl"
                />
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleSandboxScan}
                  disabled={isAnalyzing || !sandboxCode.trim()}
                  className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black rounded-2xl shadow-2xl transition-all flex items-center active:scale-95"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Run AI Scan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* New Results Display */}
          {hasScanned && (
            <div className="p-12 lg:p-16 bg-black/40 border-t border-white/5 animate-slide-up">
              {results.length > 0 ? (
                <div className="space-y-12">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-500 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-black text-white">Vulnerabilities Detected</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {results.map((finding) => (
                      <SandboxFindingCard key={finding.id} finding={finding} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-emerald-500/10 p-6 rounded-full mb-6 border border-emerald-500/20">
                    <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-3xl font-black text-emerald-400 mb-2">Zero Threats Found</h4>
                  <p className="text-slate-500 text-lg max-w-md">Gemini AI confirmed this code snippet is currently clean and secure.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Feature Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <FeatureCard 
          icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v1m0 16v1m0-1a10.003 10.003 0 01-9.358-6.429l-.054.09m12.852-6.429A10.003 10.003 0 0112 21v-1m0-16c3.517 0 6.799 1.009 9.571 2.753l-.09.054a10.003 10.003 0 01-6.429 9.358l.09-.054A10.003 10.003 0 0012 3v1" /></svg>}
          title="History Excavator"
          description="We deep-scan your entire Git history, finding secrets that developers 'deleted' but are still accessible to attackers."
        />
        <FeatureCard 
          icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          title="Context Intelligence"
          description="Powered by Gemini 3 Flash, our system understands code context, reducing false alerts for dummy keys or test variables."
        />
        <FeatureCard 
          icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title="Instant Response"
          description="Automatically create GitHub issues for findings, alerting your team before secrets can be harvested by malicious bots."
        />
      </section>

      <style>{`
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

const SandboxFindingCard: React.FC<{ finding: SecretFinding }> = ({ finding }) => {
  const styles = {
    [Severity.CRITICAL]: 'border-red-500/30 bg-red-500/5 text-red-400',
    [Severity.HIGH]: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
    [Severity.MEDIUM]: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
    [Severity.LOW]: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
  };

  return (
    <div className={`glass-card p-10 rounded-[2rem] border-l-4 ${finding.severity === Severity.CRITICAL ? 'border-l-red-500' : 'border-l-indigo-500'}`}>
      <div className="flex items-center justify-between mb-8">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${styles[finding.severity]}`}>
          {finding.severity}
        </span>
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{finding.type}</span>
      </div>
      <div className="bg-black/40 p-4 rounded-xl font-mono text-sm text-pink-500 border border-white/5 mb-8 overflow-hidden">
         <span className="opacity-50 text-xs mr-2 select-none">LEAKED:</span>
         {finding.redactedSecret}
      </div>
      <div className="space-y-4">
        <p className="text-slate-200 font-bold text-sm leading-relaxed">
          {finding.explanation}
        </p>
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Remediation</p>
          <p className="text-slate-400 text-xs leading-relaxed">{finding.suggestion}</p>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="glass-card p-12 rounded-[2.5rem] group">
    <div className="mb-8 w-16 h-16 glass flex items-center justify-center rounded-2xl text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4 text-white">{title}</h3>
    <p className="text-slate-400 font-medium leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
