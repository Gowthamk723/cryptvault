import { Link } from 'react-router-dom';
import { Shield, Lock, Database, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto w-full p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          CryptVault
        </h1>
        <div className="flex gap-4">
          <Link to="/login" className="text-slate-300 hover:text-white px-4 py-2 transition-colors">Login</Link>
          <Link to="/register" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="bg-blue-500/10 p-4 rounded-full mb-8 animate-pulse">
          <Shield className="h-16 w-16 text-blue-400" />
        </div>
        
        <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          True <span className="text-blue-500">Zero-Knowledge</span><br />
          Cloud Storage.
        </h2>
        
        <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Your files are encrypted in your browser <strong>before</strong> they ever touch our servers. 
          We couldn't read your data even if we wanted to.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <Link 
            to="/register" 
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
          >
            Create Free Vault <ArrowRight size={20} />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full text-left">
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <Lock className="h-10 w-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">End-to-End Encryption</h3>
            <p className="text-slate-400">AES-256 encryption happens on your device. Your password never leaves your browser.</p>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <Shield className="h-10 w-10 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Zero-Knowledge</h3>
            <p className="text-slate-400">We store your data, but we don't hold the keys. You are the only one who can unlock it.</p>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <Database className="h-10 w-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure Infrastructure</h3>
            <p className="text-slate-400">Built on MinIO and PostgreSQL with military-grade security standards.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm">
        © 2026 CryptVault. Secure by Design.
      </footer>
    </div>
  );
};

export default Landing;