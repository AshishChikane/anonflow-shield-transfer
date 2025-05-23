
import React, { useState, useEffect } from 'react';
import { Wallet, Shield, Zap, ExternalLink, ChevronDown, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const connectWallet = async (type: string) => {
    // Simulate wallet connection
    setIsWalletConnected(true);
    setWalletAddress('0x742d...35Cb');
    setWalletType(type);
    // Close mobile menu after connection
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-slate-950/90' : 'bg-transparent'
    } backdrop-blur-xl border-b border-red-500/20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 hover:scale-105">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PrivateFlow</h1>
              <p className="text-xs text-red-400">Multi-Token Transfer Platform</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={onPromptClick}
              variant="outline"
              className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 shadow-sm shadow-amber-500/10 transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Prompt
            </Button>
            
            <Button
              onClick={onTransferClick}
              className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:scale-105"
            >
              Multi-Transfer
            </Button>
            
            {!isWalletConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="bg-slate-800 border border-red-500/50 text-red-300 hover:bg-red-500/10 hover:border-red-400 shadow-md shadow-slate-900/60 transition-all duration-300 hover:scale-105"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-slate-900 border border-red-500/30 text-white shadow-xl shadow-red-500/10 animate-in fade-in-80 w-48"
                >
                  <DropdownMenuItem 
                    onClick={() => connectWallet('MetaMask')}
                    className="hover:bg-slate-800 cursor-pointer flex items-center hover:text-red-300 transition-colors"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5 mr-2" />
                    MetaMask
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => connectWallet('Core')}
                    className="hover:bg-slate-800 cursor-pointer flex items-center hover:text-red-300 transition-colors"
                  >
                    <Shield className="w-5 h-5 mr-2 text-blue-400" />
                    Core Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => connectWallet('Trust')}
                    className="hover:bg-slate-800 cursor-pointer flex items-center hover:text-red-300 transition-colors"
                  >
                    <Shield className="w-5 h-5 mr-2 text-green-400" />
                    Trust Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => connectWallet('Other')}
                    className="hover:bg-slate-800 cursor-pointer flex items-center hover:text-red-300 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 mr-2 text-gray-400" />
                    Other Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-900/30 border border-green-500/50 rounded-lg shadow-inner shadow-green-500/10 transition-all duration-300 hover:border-green-500/70">
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
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="text-white hover:bg-slate-800/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-red-500/20 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <Button
              onClick={() => {
                onPromptClick();
                setIsMobileMenuOpen(false);
              }}
              variant="outline"
              className="w-full border-amber-500/50 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 justify-start"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Prompt
            </Button>
            
            <Button
              onClick={() => {
                onTransferClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white justify-start"
            >
              Multi-Transfer
            </Button>
            
            {!isWalletConnected ? (
              <div className="space-y-2 pt-2 border-t border-slate-700/50">
                <p className="text-sm text-gray-400 px-1">Connect wallet:</p>
                <Button
                  onClick={() => connectWallet('MetaMask')}
                  variant="outline"
                  className="w-full justify-start hover:bg-slate-800 text-white hover:text-red-300"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5 mr-2" />
                  MetaMask
                </Button>
                
                <Button
                  onClick={() => connectWallet('Core')}
                  variant="outline"
                  className="w-full justify-start hover:bg-slate-800 text-white hover:text-red-300"
                >
                  <Shield className="w-5 h-5 mr-2 text-blue-400" />
                  Core Wallet
                </Button>
                
                <Button
                  onClick={() => connectWallet('Trust')}
                  variant="outline"
                  className="w-full justify-start hover:bg-slate-800 text-white hover:text-red-300"
                >
                  <Shield className="w-5 h-5 mr-2 text-green-400" />
                  Trust Wallet
                </Button>
                
                <Button
                  onClick={() => connectWallet('Other')}
                  variant="outline"
                  className="w-full justify-start hover:bg-slate-800 text-white hover:text-red-300"
                >
                  <ExternalLink className="w-5 h-5 mr-2 text-gray-400" />
                  Other Wallet
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-3 bg-green-900/30 border border-green-500/50 rounded-lg">
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
      )}
    </nav>
  );
};

export default Navbar;
