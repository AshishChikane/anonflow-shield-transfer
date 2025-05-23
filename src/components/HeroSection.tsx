
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Users, Eye, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onTransferClick: () => void;
  onPromptClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onTransferClick, onPromptClick }) => {
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-400 bg-clip-text text-transparent mb-6 leading-tight transition-all duration-300">
            Private Multi-Token
            <br />
            Transfers
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Send multiple tokens to multiple recipients with complete privacy and AML compliance. 
            Powered by AI for seamless natural language interactions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 sm:mb-16">
          <Button
            onClick={onTransferClick}
            size="lg"
            className="px-6 py-6 text-lg bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-600 hover:to-fuchsia-700 text-white shadow-lg shadow-fuchsia-700/25 hover:shadow-fuchsia-700/40 transition-all duration-300 hover:scale-105"
          >
            <Users className="w-5 h-5 mr-2" />
            Start Multi-Transfer
            <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
          </Button>
          
          <Button
            onClick={onPromptClick}
            size="lg"
            variant="outline"
            className="px-6 py-6 text-lg border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-500/10 hover:border-fuchsia-400 transition-all duration-300 hover:scale-105"
          >
            <Zap className="w-5 h-5 mr-2" />
            Try AI Assistant
            <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 group transform hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20">
            <Shield className="w-12 h-12 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors group-hover:scale-110 transform transition-all" />
            <h3 className="text-xl font-semibold text-white mb-2">AML Compliance</h3>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
              Every wallet is verified against global AML databases before any transfer is executed.
            </p>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-fuchsia-500/20 hover:border-fuchsia-500/50 transition-all duration-300 group transform hover:-translate-y-1 hover:shadow-lg hover:shadow-fuchsia-500/20">
            <Eye className="w-12 h-12 text-fuchsia-400 mb-4 group-hover:text-fuchsia-300 transition-colors group-hover:scale-110 transform transition-all" />
            <h3 className="text-xl font-semibold text-white mb-2">Privacy First</h3>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
              Tokens are converted to privacy equivalents (eAVAX, eETH) to ensure complete anonymity.
            </p>
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1 bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300 group transform hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20">
            <Zap className="w-12 h-12 text-pink-400 mb-4 group-hover:text-pink-300 transition-colors group-hover:scale-110 transform transition-all" />
            <h3 className="text-xl font-semibold text-white mb-2">AI Powered</h3>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
              Simply describe your transfer in plain English and our AI will handle the complex setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
