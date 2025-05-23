
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Send, CheckCircle, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIPromptModal: React.FC<AIPromptModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const examplePrompts = [
    "Send 5 AVAX to 0x742d35Cc6d586171832C6E1b035e7E3d35Cb and 3 ETH to 0x8ba1f109551bD432803012645Hac136c5C78",
    "Transfer 100 USDC to Alice at 0x123... and 50 USDT to Bob at 0x456...",
    "Distribute 10 ETH equally among these 3 wallets: 0xabc..., 0xdef..., 0x789..."
  ];

  const processPrompt = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock parsed data
    setParsedData({
      recipients: [
        { address: '0x742d35Cc6d586171832C6E1b035e7E3d35Cb', amount: '5', token: 'AVAX' },
        { address: '0x8ba1f109551bD432803012645Hac136c5C78', amount: '3', token: 'ETH' }
      ],
      totalValue: '$2,847.50',
      amlStatus: 'verified'
    });
    
    setIsProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0E0B15] border-[#FF6B00]/30 text-white rounded-xl shadow-[0_0_50px_rgba(255,13,61,0.15)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_60px_rgba(255,13,61,0.25)] animate-in zoom-in-95 slide-in-from-bottom-5">
        <DialogHeader className="pb-4 border-b border-[#2E1E23]">
          <DialogTitle className="flex items-center text-xl font-bold text-gradient bg-gradient-to-r from-[#FF0D3D] to-[#FFD700] bg-clip-text text-transparent">
            <Sparkles className="w-6 h-6 mr-2 text-[#FF6B00]" />
            AI-Powered Transfer Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-3">
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2 group-hover:text-white transition-colors">
              Describe your transfer in natural language
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Send 5 AVAX to Alice and 3 ETH to Bob..."
              className="min-h-[100px] bg-[#15070E] border-[#2E1E23] text-white placeholder-[#64748B] focus:border-[#FF0D3D] focus:ring-[#FF0D3D]/20 transition-all duration-300 hover:border-[#FF6B00]/50"
            />
          </div>

          <div>
            <p className="text-sm text-[#94A3B8] mb-2">Try these examples:</p>
            <div className="space-y-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="block w-full text-left p-3 bg-[#15070E] hover:bg-[#1A0913] rounded-lg border border-[#2E1E23] hover:border-[#FF0D3D]/50 text-sm text-[#CBD5E1] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,13,61,0.15)] hover:translate-x-1"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {parsedData && (
            <div className="bg-[#1A0913] rounded-xl p-5 border border-[#FF0D3D]/20 shadow-inner transition-all duration-300 hover:border-[#FF0D3D]/40 hover:shadow-[0_0_15px_rgba(255,13,61,0.15)]">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-5 h-5 text-[#FF6B00] mr-2" />
                <span className="text-[#FF6B00] font-medium">Prompt Parsed Successfully</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-[#FFD700] font-medium mb-3">Recipients ({parsedData.recipients.length})</h4>
                  {parsedData.recipients.map((recipient: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-[#2E1E23] last:border-b-0">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#15070E] to-[#1A0913] flex items-center justify-center text-[#94A3B8] font-mono text-xs border border-[#2E1E23] mr-3">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono text-sm text-[#94A3B8]">{recipient.address.slice(0, 10)}...</span>
                          <div className="flex items-center mt-1">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#FF0D3D] to-[#FF6B00] mr-1 flex items-center justify-center text-[6px] font-bold">
                              {recipient.token.charAt(0)}
                            </div>
                            <span className="text-white font-medium">{recipient.amount} {recipient.token}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#15070E] px-3 py-1 rounded-lg border border-[#2E1E23]">
                        <span className="text-[#FF6B00] font-medium flex items-center text-sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-[#15070E] rounded-lg p-3 border border-[#2E1E23]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Total Value:</span>
                    <span className="text-white font-bold">{parsedData.totalValue}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#2E1E23]">
                    <span className="text-[#94A3B8]">AML Status:</span>
                    <span className="text-[#FF6B00] font-medium flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[#2E1E23]">
            <Button
              onClick={processPrompt}
              disabled={!prompt.trim() || isProcessing}
              className="flex-1 bg-gradient-to-r from-[#FF0D3D] to-[#FF6B00] hover:from-[#FF3D71] hover:to-[#FF9040] disabled:from-[#64748B] disabled:to-[#475569] text-white font-medium transition-all duration-300 shadow-[0_0_15px_rgba(255,13,61,0.3)] hover:shadow-[0_0_25px_rgba(255,13,61,0.5)] hover:scale-105"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Parse Transfer
                </>
              )}
            </Button>
            
            {parsedData && (
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FFD700] hover:from-[#FF9040] hover:to-[#FFEC80] text-white font-medium transition-all duration-300 shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:shadow-[0_0_25px_rgba(255,107,0,0.5)] hover:scale-105"
              >
                <Zap className="w-4 h-4 mr-2" />
                Execute Transfer
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIPromptModal;
