"use client";

import { useEffect, useRef, useState } from "react";
import { parseEther, formatEther } from "viem";
import { useEERCContext } from "../context/EERCContext";
import { getExplorerUrl, formatBalance } from "../lib/utils";
import { erc20ABI, useAccount, useBalance, useContractWrite } from "wagmi";
import { TokenBatcher } from "../lib/batchReadCalls";
import { standardWatchOptions } from "../lib/wagmiConfig";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, AlertTriangle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type OperationType = "deposit" | "withdraw";

export default function TokenOperations() {
  const {
    isConnected,
    chain,
    tokenAddress,
    eerc,
    encryptedBalance,
    contractAddress,
    publicClient,
  } = useEERCContext();
  const { address } = useAccount();

  const [operationType, setOperationType] = useState<OperationType>("deposit");
  const [amount, setAmount] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<bigint>(0n);
  const [isApproving, setIsApproving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: tokenBalanceData } = useBalance({
    address,
    token: tokenAddress as `0x${string}`,
    ...standardWatchOptions,
    enabled: !!address && !!tokenAddress,
  });

  const isMainnet = chain?.id === 43113;

  const { writeAsync: approveTokens } = useContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
  });

  const batcherRef = useRef<TokenBatcher | null>(null);

  useEffect(() => {
    if (!publicClient || !tokenAddress || !contractAddress || !address) {
      batcherRef.current = null;
      return;
    }
    if (!batcherRef.current) {
      batcherRef.current = new TokenBatcher(
        publicClient,
        tokenAddress as `0x${string}`,
        contractAddress,
        address as `0x${string}`
      );
    } else {
      batcherRef.current.setUserAddress(address as `0x${string}`);
    }
  }, [publicClient, tokenAddress, contractAddress, address]);

  useEffect(() => {
    const fetchAllowance = async () => {
      if (!batcherRef.current) return;
      try {
        const allowance = await batcherRef.current.getAllowance();
        setApprovedAmount(allowance);
      } catch (e) {
        console.error("Error fetching allowance:", e);
      }
    };
    fetchAllowance();
    setAmount('');
    const interval = setInterval(fetchAllowance, 15000);
    return () => clearInterval(interval);
  }, [address, tokenAddress, contractAddress, publicClient, txHash]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(val);
  };

  const handleMaxClick = () => {
    if (operationType === "deposit" && tokenBalanceData) {
      setAmount(tokenBalanceData.formatted);
    } else if (operationType === "withdraw" && encryptedBalance) {
      setAmount(formatBalance(encryptedBalance.decryptedBalance));
    }
  };

  const handleApprove = async () => {
    if (!tokenAddress || !contractAddress || !amount) return;
    setIsApproving(true);
    setError(null);

    try {
      const amountWei = parseEther(amount);
      const result = await approveTokens({
        args: [contractAddress, amountWei],
      });
      setTxHash(result.hash);
      toast.success("Approval transaction sent!");

      setTimeout(async () => {
        if (!batcherRef.current) return;
        batcherRef.current.invalidateCache();
        const allowance = await batcherRef.current.getAllowance(true);
        setApprovedAmount(allowance);
        toast.success("Approval confirmed!");
        setAmount('');
      }, 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Approval failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsApproving(false);
    }
  };

  const handleOperation = async () => {
    if (!encryptedBalance || !amount || isNaN(Number(amount))) return;
    setIsProcessing(true);
    setError(null);
    setTxHash(null);

    try {
      const amountWei = parseEther(amount);

      if (operationType === "deposit") {
        let allowance = approvedAmount;
        if (batcherRef.current) {
          allowance = await batcherRef.current.getAllowance(true);
          setApprovedAmount(allowance);
        }
        if (allowance < amountWei) {
          const msg = "Insufficient approval. Please approve tokens first.";
          setError(msg);
          toast.error(msg);
          setIsProcessing(false);
          return;
        }
      }
      console.log({operationType})
      const result =
        operationType === "deposit"
          ? await encryptedBalance.deposit(amountWei)
          : await encryptedBalance.withdraw(amountWei);

      setTxHash(result.transactionHash);
      toast.success(
        `${operationType === "deposit" ? "Deposit" : "Withdraw"} transaction sent!`
      );

      setTimeout(() => {
        encryptedBalance.refetchBalance();
        if (batcherRef.current) {
          batcherRef.current.invalidateCache();
          batcherRef.current.getAllowance(true).then(setApprovedAmount);
        }
        toast.success(
          `${operationType === "deposit" ? "Deposit" : "Withdraw"} confirmed!`
        );
        setAmount('');
      }, 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 text-white shadow-xl shadow-[#8A2BE2]/20 backdrop-blur-xl max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center text-white">
          Token Operations
        </h2>
        <p className="text-sm text-slate-400 text-center">
          Please connect your wallet to proceed.
        </p>
      </div>
    );
  }

  if (eerc && !eerc.isRegistered) {
    return (
      <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 text-white shadow-xl shadow-[#8A2BE2]/20 backdrop-blur-xl max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center text-white">
          Token Operations
        </h2>
        <p className="text-sm text-slate-400 text-center">
          You need to register before performing token operations.
        </p>
      </div>
    );
  }

  if (!eerc?.isInitialized || !encryptedBalance) {
    return (
      <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 text-white shadow-xl shadow-[#8A2BE2]/20 backdrop-blur-xl max-w-lg mx-auto animate-pulse">
        <h2 className="text-2xl font-bold mb-2 text-center text-white">
          Loading Token Operations...
        </h2>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" />

      {(isProcessing || isApproving) && (
         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
             <div className="animate-spin h-16 w-16 border-t-8 border-b-8 border-white rounded-full border-t-[#8a2be2]" />
        </div>
      )}

      <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-12 text-white shadow-xl shadow-[#8A2BE2]/20 backdrop-blur-xl max-w-lg mx-auto animate-fade-in-up animation-delay-800">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 via-[#8A2BE2] to-purple-500 bg-clip-text text-transparent bg-[length:300%_100%] animate-shine">
          Bridge
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-6 text-center">
          <div>
            <p className="text-slate-400 text-sm">Holdings</p>
            <p className="text-white font-semibold text-lg">
              {tokenBalanceData
                ? `${tokenBalanceData.formatted} ${tokenBalanceData.symbol}`
                : "0 Tokens"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Confidential Balance</p>
            <p className="text-white font-semibold text-lg">
              {formatBalance(encryptedBalance.decryptedBalance)} EAVAX
            </p>
          </div>
        </div>

        <div
            className="relative flex rounded-full border border-secondary-700 bg-slate-800 mb-6 overflow-hidden select-none"
            role="tablist"
            >
            <div
                className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-cyan-400 via-[#8A2BE2] to-purple-500 rounded-full shadow-lg transition-transform duration-1000 ease-in-out"
                style={{
                transform: operationType === "withdraw" ? "translateX(100%)" : "translateX(0%)",
                }}
            />

            {["deposit", "withdraw"].map((type) => (
                <button
                key={type}
                onClick={() => setOperationType(type as OperationType)}
                className={`relative flex-1 rounded-full px-4 py-2 text-center font-semibold transition-colors duration-300 ${
                    operationType === type ? "text-white" : "text-slate-400 hover:text-white"
                }`}
                role="tab"
                aria-selected={operationType === type}
                type="button"
                >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
            ))}
            </div>



        <div className="mb-6 relative">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Amount"
            className="block w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:ring-offset-2"
            value={amount}
            onChange={handleAmountChange}
          />
          <button
            onClick={handleMaxClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#8A2BE2] px-3 py-1 text-xs font-semibold text-white hover:bg-[#6f41c8]"
            type="button"
          >
            Max
          </button>
        </div>

        {operationType === "deposit" && (
          <div className="my-6">
            <p className="text-sm text-white">
              Approved: {formatBalance(approvedAmount)} Assets
            </p>
            <Button
              disabled={isApproving || isProcessing || !amount || Number(amount) <= 0}
              onClick={handleApprove}
              className="w-full mt-4 first-letter:w-full px-3 py-6 text-lg font-semibold border-2 border-[#8A2BE2]/60 text-purple-300 bg-transparent hover:bg-[#8A2BE2]/10 hover:border-purple-400 hover:text-white rounded-full transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-md shadow-[#8A2BE2]/10 hover:shadow-[#8A2BE2]/20"
            >
              {isApproving ? "Approving..." : "Approve"}
            </Button>
          </div>
        )}

        <Button
          onClick={handleOperation}
          disabled={
            isProcessing ||
            isApproving ||
            !amount ||
            Number(amount) <= 0 ||
            (operationType === "deposit" && approvedAmount < parseEther(amount))
          }
          className="w-full px-3 py-6 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-[#8A2BE2] hover:from-cyan-600 hover:to-purple-600 text-white rounded-full shadow-xl shadow-[#8A2BE2]/25 hover:shadow-[#8A2BE2]/40 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 border border-[#8A2BE2]"
        >
          {isProcessing
            ? operationType === "deposit"
              ? "Depositing..."
              : "Withdrawing..."
            : operationType === "deposit"
            ? "Deposit"
            : "Withdraw"}
        </Button>

        {txHash && (
          <p className="mt-4 text-sm text-green-400">
            Transaction Hash:{" "}
            <a
              href={getExplorerUrl(txHash,43113)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {txHash.slice(0, 8)}...{txHash.slice(-6)}
            </a>
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500 flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </p>
        )}

        {isMainnet && (
          <p className="mt-4 text-xs text-slate-400 text-center">
            This contract is running on the testnet.
          </p>
        )}
      </div>
    </>
  );
}
