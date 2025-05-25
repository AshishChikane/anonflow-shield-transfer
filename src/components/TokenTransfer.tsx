import { useState, useEffect, useCallback } from 'react';
import { parseEther, isAddress } from 'viem';
import { useEERCContext } from '../context/EERCContext';
import { formatBalance, getExplorerUrl } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'react-hot-toast';
import { AlertTriangle, X } from 'lucide-react';
import { CheckCircle  } from "lucide-react";

export default function TokenTransfer() {
    const { isConnected, chain, eerc, encryptedBalance } = useEERCContext();
    const [amount, setAmount] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [newRecipientAddress, setNewRecipientAddress] = useState('');
    const [isEqual, setIsEqual] = useState(true);
    const [distribution, setDistribution] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
    const [transactionModalVisible, setTransactionModalVisible] = useState(false);
    const [transfersQueue, setTransfersQueue] = useState<{ recipient: string; amount: bigint }[]>([]);
    const [currentTransferIndex, setCurrentTransferIndex] = useState<number>(0);
  
    const isTestnet = chain?.id === 43113;
  
    useEffect(() => {
      if (selectedRecipients.length === 0) {
        setDistribution([]);
        return;
      }
  
      if (isEqual) {
        const totalRecipients = selectedRecipients.length;
        const evenShare = Math.floor(100 / totalRecipients);
        let remainder = 100 - evenShare * totalRecipients;
        const newDistribution = Array(totalRecipients).fill(evenShare);
        for (let i = 0; i < remainder; i++) newDistribution[i]++;
        setDistribution(newDistribution);
      } else {
        if (distribution.length !== selectedRecipients.length) {
          const initialDistribution = Array(selectedRecipients.length).fill(0);
          if (selectedRecipients.length > 0) initialDistribution[0] = 100;
          setDistribution(initialDistribution);
        }
      }
    }, [selectedRecipients, isEqual]);
  
    const totalDistributionPercent = useCallback(
      () => distribution.reduce((acc, val) => acc + val, 0),
      [distribution]
    );
  
    const handleSliderChange = useCallback((index: number, value: number) => {
      setDistribution(prev => {
        const newDistribution = [...prev];
        newDistribution[index] = value;
        let remaining = 100 - value;
        const otherIndices = prev.map((_, i) => i).filter(i => i !== index);
        const currentSum = otherIndices.reduce((sum, i) => sum + (prev[i] || 0), 0);
  
        if (currentSum > 0) {
          otherIndices.forEach(i => {
            const proportion = (prev[i] || 0) / currentSum;
            newDistribution[i] = Math.max(0, Math.round(proportion * remaining));
          });
        } else {
          const equal = Math.floor(remaining / otherIndices.length);
          otherIndices.forEach(i => (newDistribution[i] = equal));
          for (let i = 0; i < remaining - equal * otherIndices.length; i++) {
            newDistribution[otherIndices[i]]++;
          }
        }
  
        const currentTotal = newDistribution.reduce((a, b) => a + b, 0);
        const adjust = 100 - currentTotal;
        if (adjust !== 0) {
          const adjustIndex = index === 0 && newDistribution.length > 1 ? 1 : 0;
          newDistribution[adjustIndex] = Math.max(0, newDistribution[adjustIndex] + adjust);
        }
  
        return newDistribution;
      });
    }, []);
  
    const transferAmount = async (recipient: string, amount: bigint): Promise<string> => {
      const result = await encryptedBalance.privateTransfer(recipient, amount);
      return result.transactionHash;
    };
  
    const handleTransfer = async () => {
      if (!isConnected) return toast.error('Wallet not connected.');
      if (!eerc || !encryptedBalance) return toast.error('EERC context not fully loaded.');
      if (selectedRecipients.length === 0) return toast.error('Add at least one recipient.');
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toast.error('Invalid amount.');
  
      const amountInWei = parseEther(amount);
      if (amountInWei > (encryptedBalance?.decryptedBalance || 0n)) {
        return toast.error('Insufficient balance.');
      }
  
      const currentTotalDistribution = totalDistributionPercent();
      if (currentTotalDistribution !== 100 || distribution.some(p => p < 0)) {
        return toast.error(`Distribution must sum to 100%. Current: ${currentTotalDistribution}%`);
      }
  
      const transfers = selectedRecipients.map((recipient, idx) => ({
        recipient,
        amount: (amountInWei * BigInt(distribution[idx])) / 100n
      })).filter(tx => tx.amount > 0n);
  
      if (transfers.length === 0) return toast.error("All calculated amounts are zero.");
  
      setIsProcessing(true);
      setError(null);
      setTransfersQueue(transfers);
      setCurrentTransferIndex(0);
  
      await executeTransfer(transfers[0]);
    };
  
    const executeTransfer = async (transfer: { recipient: string; amount: bigint }) => {
      try {
        const txHash = await transferAmount(transfer.recipient, transfer.amount);
        console.log({txHash})
        setCurrentTxHash(txHash);
        await new Promise(resolve => setTimeout(resolve, 10000));
        setTransactionModalVisible(true);
        // setIsProcessing(false);
      } catch (err) {
        // console.error("Transfer failed:", err);
        // toast.error(`Transfer to ${transfer.recipient.slice(0, 6)}... failed.`);
        setIsProcessing(false);
        // proceedToNextTransfer(); // Skip on error
      }
    };
  
    const proceedToNextTransfer = async () => {
        setTransactionModalVisible(false);
        const nextIndex = currentTransferIndex + 1;
      
        if (nextIndex < transfersQueue.length) {
          setCurrentTransferIndex(nextIndex);
          
          // Wait for 15 seconds before executing the transfer
          await new Promise(resolve => setTimeout(resolve, 15000));
          
          await executeTransfer(transfersQueue[nextIndex]);
        } else {
          toast.success('All transfers completed.');
          setIsProcessing(false);
          setAmount('');
          setSelectedRecipients([]);
          setIsEqual(true);
          encryptedBalance.refetchBalance();
          setTransfersQueue([]);
        }
    };
  
    const addRecipient = () => {
      const addr = newRecipientAddress.trim();
      if (!addr) return toast.error('Empty address.');
      if (!isAddress(addr)) return toast.error('Invalid address.');
      if (selectedRecipients.includes(addr)) return toast.error('Already added.');
  
      setSelectedRecipients(prev => [...prev, addr]);
      setNewRecipientAddress('');
      toast.success('Recipient added!');
    };
  
    const removeRecipient = (address: string) => {
      setSelectedRecipients(prev => prev.filter(a => a !== address));
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
    <Toaster position="bottom-right" />
    {isProcessing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="animate-spin h-16 w-16 border-t-8 border-b-8 border-white rounded-full border-t-[#8a2be2]" />
        </div>
      )}

      {transactionModalVisible && currentTxHash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-10 text-white shadow-xl shadow-[#8A2BE2]/20 max-w-md w-full animate-fade-in-up relative">
          
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-purple-500 p-4 rounded-full shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="mt-8 text-2xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 via-[#8A2BE2] to-purple-500 bg-clip-text text-transparent bg-[length:300%_100%] animate-shine">
            Transaction Complete
          </h2>
      
          <p className="text-sm text-slate-300 text-center mb-6">
            Verify your Transaction :{' '}
            <a
              className="underline text-cyan-400 hover:text-cyan-300 break-all"
              href={getExplorerUrl(currentTxHash, chain?.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {currentTxHash.slice(0, 10)}...
            </a>
          </p>
      
          <Button
            onClick={proceedToNextTransfer}
            className="w-full px-4 py-5 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-[#8A2BE2] hover:from-cyan-600 hover:to-purple-600 text-white rounded-full shadow-xl shadow-[#8A2BE2]/25 hover:shadow-[#8A2BE2]/40 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 border border-[#8A2BE2]"
          >
            Confirm
          </Button>
        </div>
      </div>
      
      )}

      <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-12 text-white shadow-xl shadow-[#8A2BE2]/20 backdrop-blur-xl max-w-lg mx-auto animate-fade-in-up animation-delay-800">
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

        {/* {txHash && (
            <p className="mt-4 text-sm text-green-400 text-center">
                Last Tx Hash: <a href={getExplorerUrl(chain?.id, txHash)} target="_blank" rel="noopener noreferrer" className="underline">{txHash.slice(0, 8)}...{txHash.slice(-6)}</a>
            </p>
        )} */}

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