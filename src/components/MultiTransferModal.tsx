
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0A0F1E] border-[#00D68F]/30 text-white rounded-xl shadow-[0_0_50px_rgba(0,214,143,0.15)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_60px_rgba(0,214,143,0.25)]">
        <DialogHeader className="pb-3 border-b border-[#1E293B]">
          <DialogTitle className="flex items-center text-xl font-bold text-gradient bg-gradient-to-r from-[#00D68F] to-[#00CFFF] bg-clip-text text-transparent">
            <Shield className="w-6 h-6 mr-2 text-[#00D68F]" />
            Privacy-Enhanced Multi-Token Transfer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-3">
          {/* Privacy Notice */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#131C31] border border-[#00D68F]/20 rounded-xl p-5 shadow-inner transition-all duration-300 hover:border-[#00D68F]/40 hover:shadow-[0_0_15px_rgba(0,214,143,0.15)]">
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 text-[#00D68F] mr-2" />
              <span className="text-[#00D68F] font-medium">Privacy Protection Active</span>
            </div>
            <p className="text-sm text-[#94A3B8] group-hover:text-white transition-colors">
              All transfers will be converted to privacy tokens (e.g., eAVAX, eETH) to ensure anonymity while maintaining AML compliance.
            </p>
          </div>

          {/* Recipients */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#00CFFF]">Recipients</h3>
              <Button
                onClick={addRecipient}
                size="sm"
                className="bg-[#1A1F2E] hover:bg-[#242B3D] border border-[#00CFFF]/30 text-[#00CFFF] transition-all duration-300 hover:shadow-[0_0_10px_rgba(0,207,255,0.2)] hover:border-[#00CFFF]/60"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Recipient
              </Button>
            </div>

            <div className="space-y-4">
              {recipients.map((recipient, index) => (
                <div key={recipient.id} 
                  className="bg-[#0F172A] rounded-xl p-5 border border-[#1E293B] transition-all duration-300 hover:border-[#00CFFF]/30 hover:shadow-[0_0_15px_rgba(0,207,255,0.1)] group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#94A3B8] group-hover:text-white transition-colors">Recipient #{index + 1}</span>
                    <div className="flex items-center space-x-2">
                      {recipient.amlStatus === 'verified' && (
                        <CheckCircle className="w-4 h-4 text-[#00D68F]" />
                      )}
                      {recipient.amlStatus === 'flagged' && (
                        <AlertTriangle className="w-4 h-4 text-[#FF3D71]" />
                      )}
                      {recipients.length > 1 && (
                        <Button
                          onClick={() => removeRecipient(recipient.id)}
                          size="sm"
                          variant="ghost"
                          className="text-[#94A3B8] hover:text-[#FF3D71] hover:bg-[#FF3D71]/10 rounded-full h-7 w-7 p-0 transition-all duration-300"
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
                        className="bg-[#131C31] border-[#1E293B] text-white font-mono text-sm focus:border-[#00CFFF] focus:ring-[#00CFFF]/20 transition-all duration-300"
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
                          className="bg-[#131C31] border-[#1E293B] text-white focus:border-[#00CFFF] focus:ring-[#00CFFF]/20 transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-[#94A3B8] mb-1 group-hover:text-[#CBD5E1] transition-colors">Token</label>
                        <Select
                          value={recipient.token}
                          onValueChange={(value) => updateRecipient(recipient.id, 'token', value)}
                        >
                          <SelectTrigger className="bg-[#131C31] border-[#1E293B] text-white focus:ring-[#00CFFF]/20 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0A0F1E] border-[#1E293B] text-white">
                            {supportedTokens.map(token => (
                              <SelectItem 
                                key={token} 
                                value={token} 
                                className="text-white hover:bg-[#1A1F2E] focus:bg-[#1A1F2E]"
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
                        <span className="text-[#00D68F] flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          AML Verified - Safe to transfer
                        </span>
                      )}
                      {recipient.amlStatus === 'flagged' && (
                        <span className="text-[#FF3D71] flex items-center">
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
            <div className="bg-[#0F172A] rounded-xl p-5 border border-[#00D68F]/20 shadow-inner transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,214,143,0.15)]">
              <h4 className="text-[#00D68F] font-medium mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Privacy Token Conversion
              </h4>
              <div className="space-y-2 text-sm">
                {recipients.map((recipient, index) => (
                  <div key={recipient.id} className="flex justify-between items-center py-2 border-b border-[#1E293B] last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#3366FF] to-[#00CFFF] mr-2 flex items-center justify-center text-xs font-bold">
                        {recipient.token.charAt(0)}
                      </div>
                      <span className="text-[#94A3B8]">
                        {recipient.amount} {recipient.token}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ArrowRight className="w-4 h-4 mx-2 text-[#64748B]" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00D68F] to-[#00CFFF] mr-2 flex items-center justify-center text-xs font-bold">
                        e{recipient.token.charAt(0)}
                      </div>
                      <span className="text-[#00D68F]">
                        {recipient.amount} e{recipient.token}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-3 border-t border-[#1E293B]">
            {!isVerified ? (
              <Button
                onClick={verifyTransfers}
                disabled={!hasValidData || isVerifying}
                className="flex-1 bg-gradient-to-r from-[#FF9900] to-[#F76700] hover:from-[#FFB800] hover:to-[#FF8500] disabled:from-[#64748B] disabled:to-[#475569] text-white font-medium transition-all duration-300 shadow-[0_0_15px_rgba(255,153,0,0.3)] hover:shadow-[0_0_25px_rgba(255,153,0,0.5)]"
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
                className="flex-1 bg-gradient-to-r from-[#00D68F] to-[#00CFFF] hover:from-[#00F49F] hover:to-[#00E0FF] disabled:from-[#64748B] disabled:to-[#475569] text-white font-medium transition-all duration-300 shadow-[0_0_15px_rgba(0,214,143,0.3)] hover:shadow-[0_0_25px_rgba(0,214,143,0.5)]"
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
