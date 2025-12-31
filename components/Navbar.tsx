
import React from 'react';
import { GithubUser } from '../types';

interface NavbarProps {
  user: GithubUser | null;
  onLogout: () => void;
  onGoHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onGoHome }) => {
  return (
    <nav className="sticky top-4 z-50 px-4 mb-4">
      <div className="container mx-auto max-w-7xl glass rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
        <div 
          onClick={onGoHome}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Secret<span className="text-indigo-500">Sentry</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/5 pl-1.5 pr-4 py-1.5 rounded-full border border-white/10">
                <img src={user.avatar_url} alt={user.login} className="w-7 h-7 rounded-full ring-2 ring-indigo-500/20" />
                <span className="text-sm font-semibold text-slate-200">{user.login}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors px-2"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-500">Scanning Active</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
