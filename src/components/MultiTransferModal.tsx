
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Shield, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-cyan-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl text-cyan-300">
            <Shield className="w-6 h-6 mr-2" />
            Privacy-Enhanced Multi-Token Transfer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Privacy Notice */}
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-purple-300 font-medium">Privacy Protection Active</span>
            </div>
            <p className="text-sm text-purple-200">
              All transfers will be converted to privacy tokens (e.g., eAVAX, eETH) to ensure anonymity while maintaining AML compliance.
            </p>
          </div>

          {/* Recipients */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-cyan-300">Recipients</h3>
              <Button
                onClick={addRecipient}
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 border border-cyan-500/50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Recipient
              </Button>
            </div>

            <div className="space-y-4">
              {recipients.map((recipient, index) => (
                <div key={recipient.id} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-300">Recipient #{index + 1}</span>
                    <div className="flex items-center space-x-2">
                      {recipient.amlStatus === 'verified' && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      {recipient.amlStatus === 'flagged' && (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      {recipients.length > 1 && (
                        <Button
                          onClick={() => removeRecipient(recipient.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Wallet Address</label>
                      <Input
                        value={recipient.address}
                        onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                        placeholder="0x..."
                        className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Amount</label>
                        <Input
                          value={recipient.amount}
                          onChange={(e) => updateRecipient(recipient.id, 'amount', e.target.value)}
                          placeholder="0.0"
                          type="number"
                          step="0.000001"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Token</label>
                        <Select
                          value={recipient.token}
                          onValueChange={(value) => updateRecipient(recipient.id, 'token', value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {supportedTokens.map(token => (
                              <SelectItem key={token} value={token} className="text-white">
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
                        <span className="text-green-400 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          AML Verified - Safe to transfer
                        </span>
                      )}
                      {recipient.amlStatus === 'flagged' && (
                        <span className="text-red-400 flex items-center">
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
            <div className="bg-slate-800 rounded-lg p-4 border border-cyan-500/30">
              <h4 className="text-cyan-300 font-medium mb-3 flex items-center">
                <ArrowRight className="w-4 h-4 mr-2" />
                Privacy Token Conversion
              </h4>
              <div className="space-y-2 text-sm">
                {recipients.map((recipient, index) => (
                  <div key={recipient.id} className="flex justify-between items-center py-1">
                    <span className="text-gray-300">
                      {recipient.amount} {recipient.token}
                    </span>
                    <span className="text-purple-300">
                      → {recipient.amount} e{recipient.token}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!isVerified ? (
              <Button
                onClick={verifyTransfers}
                disabled={!hasValidData || isVerifying}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
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
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600"
              >
                {allVerified ? (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
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
