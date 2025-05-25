import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Users, Eye, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onTransferClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onTransferClick }) => {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 bg-slate-900/40 backdrop-blur-lg text-white overflow-hidden relative rounded-xl">
      <div className="relative z-10 text-center max-w-5xl mx-auto animate-fade-in-up animation-delay-800">
        <div className="mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            <span
              className="
                bg-gradient-to-r from-cyan-400 via-[#8c60b5] to-purple-900
                bg-clip-text text-transparent
                bg-[length:300%_100%]
                animate-shine"
            >
              Private & Compliant Token Transfers
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Send tokens through a privacy layer like <strong>eAVAX</strong> with built-in <strong>AML compliance</strong>.
            Fast. Anonymous. Secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left animate-fade-in-up animation-delay-900">
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-8 border border-cyan-600/30 hover:border-cyan-500/60 transition-all duration-300 group transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20">
            <Shield className="w-14 h-14 text-cyan-400 mb-5 group-hover:text-cyan-300 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-bold text-white mb-3">Regulatory Compliance</h3>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
              All wallets are checked against AML databases before transactions for complete compliance.
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-8 border border-[#8A2BE2]/30 hover:border-[#8A2BE2]/60 transition-all duration-300 group transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#8A2BE2]/20">
            <Eye className="w-14 h-14 text-purple-400 mb-5 group-hover:text-purple-300 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-bold text-white mb-3">Privacy Tokens</h3>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
              Your assets are converted into private equivalents (e.g., eAVAX) to protect identity and balances.
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-8 border border-purple-600/30 hover:border-purple-500/60 transition-all duration-300 group transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20">
            <Zap className="w-14 h-14 text-purple-400 mb-5 group-hover:text-purple-300 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-bold text-white mb-3">Frictionless UX</h3>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
              Seamlessly assign wallets, register once, and start bridging or transferring with a few clicks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
