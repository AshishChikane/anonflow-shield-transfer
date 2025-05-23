
import React, { useState } from 'react';
import { Wallet, Shield, Zap, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const Navbar = ({ onTransferClick, onPromptClick }: { onTransferClick: () => void, onPromptClick: () => void }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletType, setWalletType] = useState('');

  const connectWallet = async (type: string) => {
    // Simulate wallet connection
    setIsWalletConnected(true);
    setWalletAddress('0x742d...35Cb');
    setWalletType(type);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
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
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 shadow-sm shadow-purple-500/10"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Prompt
            </Button>
            
            <Button
              onClick={onTransferClick}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
            >
              Multi-Transfer
            </Button>
            
            {!isWalletConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="bg-slate-800 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 shadow-md shadow-slate-900/60"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-slate-800 border border-cyan-500/30 text-white shadow-xl shadow-cyan-500/10 animate-in fade-in-80 w-48"
                >
                  <DropdownMenuItem 
                    onClick={() => connectWallet('MetaMask')}
                    className="hover:bg-slate-700 cursor-pointer flex items-center"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5 mr-2" />
                    MetaMask
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => connectWallet('Core')}
                    className="hover:bg-slate-700 cursor-pointer flex items-center"
                  >
                    <Shield className="w-5 h-5 mr-2 text-blue-400" />
                    Core Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => connectWallet('Trust')}
                    className="hover:bg-slate-700 cursor-pointer flex items-center"
                  >
                    <Shield className="w-5 h-5 mr-2 text-green-400" />
                    Trust Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => connectWallet('Other')}
                    className="hover:bg-slate-700 cursor-pointer flex items-center"
                  >
                    <ExternalLink className="w-5 h-5 mr-2 text-gray-400" />
                    Other Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-900/30 border border-green-500/50 rounded-lg shadow-inner shadow-green-500/10">
                {walletType === 'MetaMask' && 
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-4 h-4" />
                }
                {walletType !== 'MetaMask' && 
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                }
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
