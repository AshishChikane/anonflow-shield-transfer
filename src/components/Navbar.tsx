
import React, { useState } from 'react';
import { Wallet, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = ({ onTransferClick, onPromptClick }: { onTransferClick: () => void, onPromptClick: () => void }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    // Simulate wallet connection
    setIsWalletConnected(true);
    setWalletAddress('0x742d...35Cb');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PrivateFlow</h1>
              <p className="text-xs text-cyan-400">Multi-Token Transfer Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={onPromptClick}
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Prompt
            </Button>
            
            <Button
              onClick={onTransferClick}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
            >
              Multi-Transfer
            </Button>
            
            {!isWalletConnected ? (
              <Button
                onClick={connectWallet}
                className="bg-slate-800 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-900/30 border border-green-500/50 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-mono">{walletAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
