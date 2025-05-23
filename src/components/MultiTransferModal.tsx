
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Shield, CheckCircle, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

interface Recipient {
  id: string;
  address: string;
  amount: string;
  token: string;
  amlStatus?: 'pending' | 'verified' | 'flagged';
}

interface MultiTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MultiTransferModal: React.FC<MultiTransferModalProps> = ({ isOpen, onClose }) => {
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', address: '', amount: '', token: 'AVAX' }
  ]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const supportedTokens = ['AVAX', 'ETH', 'USDC', 'USDT', 'BTC'];

  const addRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      address: '',
      amount: '',
      token: 'AVAX'
    };
    setRecipients([...recipients, newRecipient]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter(r => r.id !== id));
    }
  };

  const updateRecipient = (id: string, field: keyof Recipient, value: string) => {
    setRecipients(recipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const verifyTransfers = async () => {
    setIsVerifying(true);
    
    // Simulate AML verification process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock verification results
    const updatedRecipients = recipients.map(r => ({
      ...r,
      amlStatus: Math.random() > 0.1 ? 'verified' as const : 'flagged' as const
    }));
    
    setRecipients(updatedRecipients);
    setIsVerified(true);
    setIsVerifying(false);
  };

  const allVerified = recipients.every(r => r.amlStatus === 'verified');
  const hasValidData = recipients.every(r => r.address && r.amount && r.token);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0E0B15] border-[#FF0D3D]/30 text-white rounded-xl shadow-[0_0_50px_rgba(255,13,61,0.15)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_60px_rgba(255,13,61,0.25)] animate-in zoom-in-95 slide-in-from-bottom-5">
        <DialogHeader className="pb-3 border-b border-[#2E1E23]">
          <DialogTitle className="flex items-center text-xl font-bold text-gradient bg-gradient-to-r from-[#FF0D3D] to-[#FFD700] bg-clip-text text-transparent">
            <Shield className="w-6 h-6 mr-2 text-[#FF0D3D]" />
            Privacy-Enhanced Multi-Token Transfer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-3">
          {/* Privacy Notice */}
          <div className="bg-gradient-to-r from-[#15070E] to-[#1A0913] border border-[#FF0D3D]/20 rounded-xl p-5 shadow-inner transition-all duration-300 hover:border-[#FF0D3D]/40 hover:shadow-[0_0_15px_rgba(255,13,61,0.15)] transform hover:scale-102">
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 text-[#FF0D3D] mr-2" />
              <span className="text-[#FF0D3D] font-medium">Privacy Protection Active</span>
            </div>
            <p className="text-sm text-[#94A3B8] group-hover:text-white transition-colors">
              All transfers will be converted to privacy tokens (e.g., eAVAX, eETH) to ensure anonymity while maintaining AML compliance.
            </p>
          </div>

          {/* Recipients */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#FF6B00]">Recipients</h3>
              <Button
                onClick={addRecipient}
                size="sm"
                className="bg-[#1A0913] hover:bg-[#2E1E23] border border-[#FF6B00]/30 text-[#FF6B00] transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,107,0,0.2)] hover:border-[#FF6B00]/60 hover:translate-y-[-2px]"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Recipient
              </Button>
            </div>

            <div className="space-y-4">
              {recipients.map((recipient, index) => (
                <div key={recipient.id} 
                  className="bg-[#15070E] rounded-xl p-5 border border-[#2E1E23] transition-all duration-300 hover:border-[#FF6B00]/30 hover:shadow-[0_0_15px_rgba(255,107,0,0.1)] group hover:translate-y-[-2px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#94A3B8] group-hover:text-white transition-colors">Recipient #{index + 1}</span>
                    <div className="flex items-center space-x-2">
                      {recipient.amlStatus === 'verified' && (
                        <CheckCircle className="w-4 h-4 text-[#FF6B00]" />
                      )}
                      {recipient.amlStatus === 'flagged' && (
                        <AlertTriangle className="w-4 h-4 text-[#FF0D3D]" />
                      )}
                      {recipients.length > 1 && (
                        <Button
                          onClick={() => removeRecipient(recipient.id)}
                          size="sm"
                          variant="ghost"
                          className="text-[#94A3B8] hover:text-[#FF0D3D] hover:bg-[#FF0D3D]/10 rounded-full h-7 w-7 p-0 transition-all duration-300 hover:rotate-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-[#94A3B8] mb-1 group-hover:text-[#CBD5E1] transition-colors">Wallet Address</label>
                      <Input
                        value={recipient.address}
                        onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                        placeholder="0x..."
                        className="bg-[#1A0913] border-[#2E1E23] text-white font-mono text-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]/20 transition-all duration-300 hover:border-[#FF6B00]/40"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-[#94A3B8] mb-1 group-hover:text-[#CBD5E1] transition-colors">Amount</label>
                        <Input
                          value={recipient.amount}
                          onChange={(e) => updateRecipient(recipient.id, 'amount', e.target.value)}
                          placeholder="0.0"
                          type="number"
                          step="0.000001"
                          className="bg-[#1A0913] border-[#2E1E23] text-white focus:border-[#FF6B00] focus:ring-[#FF6B00]/20 transition-all duration-300 hover:border-[#FF6B00]/40"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-[#94A3B8] mb-1 group-hover:text-[#CBD5E1] transition-colors">Token</label>
                        <Select
                          value={recipient.token}
                          onValueChange={(value) => updateRecipient(recipient.id, 'token', value)}
                        >
                          <SelectTrigger className="bg-[#1A0913] border-[#2E1E23] text-white focus:ring-[#FF6B00]/20 transition-all duration-300 hover:border-[#FF6B00]/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0E0B15] border-[#2E1E23] text-white">
                            {supportedTokens.map(token => (
                              <SelectItem 
                                key={token} 
                                value={token} 
                                className="text-white hover:bg-[#1A0913] focus:bg-[#1A0913]"
                              >
                                {token}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {recipient.amlStatus && (
                    <div className="mt-3 flex items-center text-sm">
                      {recipient.amlStatus === 'verified' && (
                        <span className="text-[#FF6B00] flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          AML Verified - Safe to transfer
                        </span>
                      )}
                      {recipient.amlStatus === 'flagged' && (
                        <span className="text-[#FF0D3D] flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          AML Risk Detected - Transfer blocked
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Conversion Info */}
          {isVerified && allVerified && (
            <div className="bg-[#15070E] rounded-xl p-5 border border-[#FF0D3D]/20 shadow-inner transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,13,61,0.15)] hover:scale-[1.01]">
              <h4 className="text-[#FF0D3D] font-medium mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Privacy Token Conversion
              </h4>
              <div className="space-y-2 text-sm">
                {recipients.map((recipient, index) => (
                  <div key={recipient.id} className="flex justify-between items-center py-2 border-b border-[#2E1E23] last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF0D3D] to-[#FF6B00] mr-2 flex items-center justify-center text-xs font-bold">
                        {recipient.token.charAt(0)}
                      </div>
                      <span className="text-[#94A3B8]">
                        {recipient.amount} {recipient.token}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ArrowRight className="w-4 h-4 mx-2 text-[#64748B]" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF0D3D] to-[#FFD700] mr-2 flex items-center justify-center text-xs font-bold">
                        e{recipient.token.charAt(0)}
                      </div>
                      <span className="text-[#FF0D3D]">
                        {recipient.amount} e{recipient.token}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-3 border-t border-[#2E1E23]">
            {!isVerified ? (
              <Button
                onClick={verifyTransfers}
                disabled={!hasValidData || isVerifying}
                className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FFD700] hover:from-[#FF9040] hover:to-[#FFEC80] disabled:from-[#64748B] disabled:to-[#475569] text-white font-medium transition-all duration-300 shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:shadow-[0_0_25px_rgba(255,107,0,0.5)] hover:scale-[1.02]"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying AML Status...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify All Recipients
                  </>
                )}
              </Button>
            ) : (
              <Button
                disabled={!allVerified}
                className="flex-1 bg-gradient-to-r from-[#FF0D3D] to-[#FF6B00] hover:from-[#FF3D71] hover:to-[#FF9040] disabled:from-[#64748B] disabled:to-[#475569] text-white font-medium transition-all duration-300 shadow-[0_0_15px_rgba(255,13,61,0.3)] hover:shadow-[0_0_25px_rgba(255,13,61,0.5)] hover:scale-[1.02]"
              >
                {allVerified ? (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Execute Privacy Transfer
                  </>
                ) : (
                  'AML Verification Failed'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiTransferModal;
