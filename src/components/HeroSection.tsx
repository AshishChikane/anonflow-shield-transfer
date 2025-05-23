
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Users, Eye } from 'lucide-react';

interface HeroSectionProps {
  onTransferClick: () => void;
  onPromptClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onTransferClick, onPromptClick }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-cyan-900/20"></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 leading-tight">
            Private Multi-Token
            <br />
            Transfers
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Send multiple tokens to multiple recipients with complete privacy and AML compliance. 
            Powered by AI for seamless natural language interactions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            onClick={onTransferClick}
            size="lg"
            className="px-8 py-4 text-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
          >
            <Users className="w-5 h-5 mr-2" />
            Start Multi-Transfer
          </Button>
          
          <Button
            onClick={onPromptClick}
            size="lg"
            variant="outline"
            className="px-8 py-4 text-lg border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300"
          >
            <Zap className="w-5 h-5 mr-2" />
            Try AI Assistant
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group">
            <Shield className="w-12 h-12 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors" />
            <h3 className="text-xl font-semibold text-white mb-2">AML Compliance</h3>
            <p className="text-gray-400">
              Every wallet is verified against global AML databases before any transfer is executed.
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
            <Eye className="w-12 h-12 text-purple-400 mb-4 group-hover:text-purple-300 transition-colors" />
            <h3 className="text-xl font-semibold text-white mb-2">Privacy First</h3>
            <p className="text-gray-400">
              Tokens are converted to privacy equivalents (eAVAX, eETH) to ensure complete anonymity.
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group">
            <Zap className="w-12 h-12 text-pink-400 mb-4 group-hover:text-pink-300 transition-colors" />
            <h3 className="text-xl font-semibold text-white mb-2">AI Powered</h3>
            <p className="text-gray-400">
              Simply describe your transfer in plain English and our AI will handle the complex setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
