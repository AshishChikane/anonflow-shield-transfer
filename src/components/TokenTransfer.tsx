import { useState, useEffect, useCallback } from 'react';
import { parseEther, isAddress } from 'viem';
import { useEERCContext } from '../context/EERCContext';
import { formatBalance, getExplorerUrl } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'react-hot-toast';
import { AlertTriangle, X } from 'lucide-react';

export default function TokenTransfer() {
  const { isConnected, chain, eerc, encryptedBalance } = useEERCContext();
  const [amount, setAmount] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [newRecipientAddress, setNewRecipientAddress] = useState('');
  const [isEqual, setIsEqual] = useState(true);
  const [distribution, setDistribution] = useState<number[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTestnet = chain?.id === 43113;

  useEffect(() => {
    if (selectedRecipients.length === 0) {
      setDistribution([]);
      return;
    }

    if (isEqual) {
      const totalRecipients = selectedRecipients.length;
      const evenShare = Math.floor(100 / totalRecipients);
      let remainder = 100 - (evenShare * totalRecipients);

      const newDistribution = Array(totalRecipients).fill(evenShare);

      for (let i = 0; i < remainder; i++) {
        newDistribution[i]++;
      }
      setDistribution(newDistribution);
    } else {
      if (distribution.length !== selectedRecipients.length) {
        const initialDistribution = Array(selectedRecipients.length).fill(0);
        if (selectedRecipients.length > 0) {
          initialDistribution[0] = 100;
        }
        setDistribution(initialDistribution);
      }
    }
  }, [selectedRecipients, isEqual]); 

  const totalDistributionPercent = useCallback(() => {
    return distribution.reduce((acc, val) => acc + val, 0);
  }, [distribution]);

  const handleSliderChange = useCallback((index: number, value: number) => {
    setDistribution(prevDistribution => {
      const newDistribution = [...prevDistribution];
      newDistribution[index] = value; 

      let remainingPercentage = 100 - value;
      let otherIndices = Array.from({ length: newDistribution.length }, (_, i) => i).filter(i => i !== index);

      if (otherIndices.length > 0) {
        const currentSumOfOthers = otherIndices.reduce((sum, i) => sum + (prevDistribution[i] || 0), 0);

        if (currentSumOfOthers > 0) {
          otherIndices.forEach(i => {
            const proportionalShare = ((prevDistribution[i] || 0) / currentSumOfOthers) * remainingPercentage;
            newDistribution[i] = Math.max(0, Math.round(proportionalShare));
          });
        } else { 
          const equalShare = Math.floor(remainingPercentage / otherIndices.length);
          otherIndices.forEach(i => {
            newDistribution[i] = equalShare;
          });
          let equalRemainder = remainingPercentage - (equalShare * otherIndices.length);
          for (let i = 0; i < equalRemainder; i++) {
            newDistribution[otherIndices[i]]++;
          }
        }
      }
      const currentTotal = newDistribution.reduce((a, b) => a + b, 0);
      const adjustment = 100 - currentTotal;
      if (adjustment !== 0 && newDistribution.length > 0) {
        let adjustIndex = 0;
        if (newDistribution.length > 1) {
          adjustIndex = (index === 0) ? 1 : 0;
        }
        newDistribution[adjustIndex] = Math.max(0, newDistribution[adjustIndex] + adjustment);
      }

      return newDistribution;
    });
  }, []);


  const transferAmountIndividually = async (recipient: string, amount: BigInt) => {
    if (!encryptedBalance) {
      throw new Error('EERC balance context not available for transfer.');
    }
    if (amount <= 0n) {
      console.warn(`Skipping transfer of zero or negative amount to ${recipient}`);
      return null;
    }

    try {
    console.log({recipient,amount})
      const result = await encryptedBalance.privateTransfer(recipient, amount);
      console.log({result})


      return result.transactionHash;
    } catch (err) {
      console.error(`Error during individual transfer to ${recipient}:`, err);
    }
  };


  const handleTransfer = async () => {
    if (!isConnected) {
      toast.error('Wallet not connected.');
      return;
    }
    if (!eerc || !encryptedBalance) {
      toast.error('EERC context not fully loaded. Please refresh or connect wallet.');
      return;
    }
    if (selectedRecipients.length === 0) {
      toast.error('Please add at least one recipient.');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount greater than zero.');
      return;
    }

    const amountInWei = parseEther(amount); 

    if (amountInWei > (encryptedBalance?.decryptedBalance || 0n)) {
      toast.error('Insufficient balance for this transfer.');
      return;
    }

    const currentTotalDistribution = totalDistributionPercent();
    if (currentTotalDistribution !== 100 || distribution.some(p => p < 0)) {
      toast.error(`Distribution percentages must sum to 100%. Current: ${currentTotalDistribution}%`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTxHash(null);
    const overallToastId = toast.loading('Initiating transfers...');

    const successfulHashes: string[] = [];
    const failedTransfersDetails: { recipient: string; error: string }[] = [];

    try {
      const transfersToExecute = selectedRecipients
        .map((recipient, idx) => ({
          recipient,
          amountInWeiForRecipient: (amountInWei * BigInt(distribution[idx])) / 100n
        }))
        .filter(item => item.amountInWeiForRecipient > 0n);

      if (transfersToExecute.length === 0) {
        toast.error("No recipients would receive tokens (all calculated amounts are zero). Adjust amount or distribution.", { id: overallToastId });
        return;
      }

      for (let i = 0; i < transfersToExecute.length; i++) {
        const { recipient, amountInWeiForRecipient } = transfersToExecute[i];
        try {
          const recipientToastId = toast.loading(`Transferring to ${recipient.slice(0, 6)}...${recipient.slice(-4)}...`);

          const hash = await transferAmountIndividually(recipient, amountInWeiForRecipient);
          await new Promise(resolve => setTimeout(resolve, 15000)); 

          if (hash) {
            successfulHashes.push(hash);
            toast.success(`Transferred to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`, {
              id: recipientToastId,
              duration: 5000,
              action: {
                  label: 'View Tx',
                  onClick: () => window.open(getExplorerUrl(chain?.id, hash), '_blank')
              }
            });
          } else {
            failedTransfersDetails.push({ recipient, error: 'Transfer returned no hash.' });
             toast.error(`Transfer to ${recipient.slice(0, 6)}...${recipient.slice(-4)} failed.`, {
                id: recipientToastId,
                duration: 5000,
                description: 'No transaction hash received.'
            });
          }

        } catch (innerError) {
          const errMsg = innerError instanceof Error ? innerError.message : 'Unknown error';
          failedTransfersDetails.push({ recipient, error: errMsg });
          toast.error(`Transfer to ${recipient.slice(0, 6)}...${recipient.slice(-4)} failed.`, {
            id: `transfer-${recipient}`, 
            duration: 7000,
            description: errMsg
          });
        }

        if (i < transfersToExecute.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (successfulHashes.length > 0) {
        setTxHash(successfulHashes[0]);
        toast.success(`Completed ${successfulHashes.length} out of ${transfersToExecute.length} transfers.`, {
          id: overallToastId,
          duration: 15000,
          action: successfulHashes.length === 1 ? {
              label: 'View Tx',
              onClick: () => window.open(getExplorerUrl(chain?.id, successfulHashes[0]), '_blank')
          } : undefined,
          description: (
              <>
                {successfulHashes.length > 1 && (
                    <p className="text-sm">Multiple transactions completed. See console for details.</p>
                )}
                {failedTransfersDetails.length > 0 && (
                    <p className="text-red-400 mt-2 text-sm">
                        {failedTransfersDetails.length} transfers failed. Check individual messages.
                    </p>
                )}
              </>
          )
        });
      } else {
        toast.error(`No transfers were successful.`, {
          id: overallToastId,
          duration: 7000,
          description: failedTransfersDetails.length > 0 ? `All ${transfersToExecute.length} transfers failed. Check individual messages.` : 'No valid transfers to execute.'
        });
      }

      setTimeout(() => encryptedBalance.refetchBalance(), 5000);
      setAmount('');
      setSelectedRecipients([]);
      setIsEqual(true);

    } catch (outerError) {
      const msg = outerError instanceof Error ? outerError.message : 'Unknown error occurred during setup.';
      setError(msg);
      toast.error('Overall transfer process encountered an unexpected error!', {
        id: overallToastId,
        duration: 7000,
        description: msg
      });
      console.error('Overall transfer error:', outerError);
    } finally {
      setIsProcessing(false);
    }
  };

  const addRecipient = () => {
    const trimmedAddress = newRecipientAddress.trim();
    if (!trimmedAddress) {
      toast.error('Recipient address cannot be empty.');
      return;
    }
    if (!isAddress(trimmedAddress)) {
      toast.error('Invalid Ethereum address format.');
      return;
    }
    if (selectedRecipients.includes(trimmedAddress)) {
      toast.error('Recipient address already added.');
      return;
    }

    setSelectedRecipients((prev) => [...prev, trimmedAddress]);
    setNewRecipientAddress('');
    toast.success('Recipient added!');
  };

  const removeRecipient = (addressToRemove: string) => {
    setSelectedRecipients((prev) => prev.filter((addr) => addr !== addressToRemove));
    toast.success('Recipient removed.');
  };

  const handleNewRecipientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecipient();
    }
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />

      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-20 w-20 border-t-8 border-b-8 border-gray-200 border-t-[#8a2be2]" />
        </div>
      )}

      <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-12 text-white shadow-xl shadow-[#8A2BE2]/20 backdrop-blur-xl max-w-lg mx-auto animate-fade-in-up animation-delay-600">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 via-[#8A2BE2] to-purple-500 bg-clip-text text-transparent bg-[length:300%_100%] animate-shine">
          Multi Transfer
        </h2>

        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-1">Available Confidential Balance:</p>
          <p className="text-white font-semibold">
            {encryptedBalance ? `${formatBalance(encryptedBalance.decryptedBalance)} Tokens` : '0 Tokens'}
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="new-recipient" className="block text-slate-400 mb-2">Add Recipients:</label>
          <div className="flex gap-2 mb-2">
            <input
              id="new-recipient"
              type="text"
              placeholder="Enter ERC20 address (0x...)"
              className="flex-grow rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:ring-offset-2"
              value={newRecipientAddress}
              onChange={(e) => setNewRecipientAddress(e.target.value)}
              onKeyDown={handleNewRecipientKeyDown}
            />
            <Button
              onClick={addRecipient}
              className="shrink-0 px-5 py-5 mt-1 text-sm font-semibold bg-[#8A2BE2] hover:bg-[#6f41c8] text-white rounded-full transition-all duration-200"
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3 p-2 border border-slate-700 rounded-xl bg-slate-800 min-h-[50px]">
            {selectedRecipients.length === 0 && (
                <p className="text-slate-500 text-sm italic">No recipients added yet.</p>
            )}
            {selectedRecipients.map((addr) => (
              <span
                key={addr}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#8A2BE2] text-white whitespace-nowrap"
                title={addr}
              >
                {`${addr.slice(0, 6)}...${addr.slice(-4)}`}
                <button
                  onClick={() => removeRecipient(addr)}
                  className="ml-2 -mr-1 p-1 rounded-full hover:bg-[#6f41c8] focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6 relative">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Amount"
            className="block w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:ring-offset-2"
            value={amount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '')
              setAmount(value)
            }}
          />
          <button
            onClick={() => {
              if (encryptedBalance) {
                setAmount(formatBalance(encryptedBalance.decryptedBalance));
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#8A2BE2] px-3 py-1 text-xs font-semibold text-white hover:bg-[#6f41c8]"
            type="button"
          >
            Max
          </button>
        </div>

        {selectedRecipients.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm text-slate-400">Distribution Mode:</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEqual}
                  onChange={() => setIsEqual(!isEqual)}
                  className="form-checkbox text-[#8A2BE2] h-4 w-4"
                />
                <span className="text-sm text-slate-300">Equal Distribution</span>
              </label>
            </div>

            {!isEqual && distribution.length === selectedRecipients.length && distribution.map((percent, index) => (
              <div key={selectedRecipients[index]} className="mb-4">
                <label className="block text-sm text-slate-300 mb-1">
                  <span title={selectedRecipients[index]}>
                    {`${selectedRecipients[index].slice(0, 6)}...${selectedRecipients[index].slice(-4)}`}
                  </span>{' '}
                  - {percent}% ({((Number(amount) || 0) * percent / 100).toFixed(6)} tokens)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percent}
                  onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
                  className="w-full accent-[#8A2BE2]"
                  disabled={selectedRecipients.length === 1}
                />
              </div>
            ))}

            {isEqual && selectedRecipients.length > 0 && distribution.length > 0 && selectedRecipients.map((addr, i) => (
              <p key={addr} className="text-sm text-slate-400">
                <span title={addr}>{`${addr.slice(0, 6)}...${addr.slice(-4)}`}</span>{' '}
                will receive {distribution[i]}% (~{((Number(amount) || 0) * distribution[i] / 100).toFixed(6)} tokens)
              </p>
            ))}
          </div>
        )}

        <Button
          onClick={handleTransfer}
          disabled={isProcessing || !amount || Number(amount) <= 0 || selectedRecipients.length === 0 || totalDistributionPercent() !== 100}
          className="w-full px-3 py-6 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-[#8A2BE2] hover:from-cyan-600 hover:to-purple-600 text-white rounded-full shadow-xl shadow-[#8A2BE2]/25 hover:shadow-[#8A2BE2]/40 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 border border-[#8A2BE2]"
        >
          {isProcessing ? 'Processing...' : 'Transfer'}
        </Button>

        {txHash && (
            <p className="mt-4 text-sm text-green-400 text-center">
                Last Tx Hash: <a href={getExplorerUrl(chain?.id, txHash)} target="_blank" rel="noopener noreferrer" className="underline">{txHash.slice(0, 8)}...{txHash.slice(-6)}</a>
            </p>
        )}

        {error && (
            <p className="mt-4 text-sm text-red-500 flex items-center gap-2 text-center">
                <AlertTriangle size={16} /> {error}
            </p>
        )}

        {isTestnet && (
          <p className="mt-4 text-xs text-slate-400 text-center">
            You are connected to the testnet.
          </p>
        )}
      </div>
    </>
  );
}