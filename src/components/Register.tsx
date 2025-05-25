'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useEERCContext } from '../context/EERCContext'
import { getExplorerUrl } from '../lib/utils'
import { Button } from '@/components/ui/button'
import { CheckCircle, Zap, AlertTriangle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function RegisterCard({ decryptionKey, setDecryptionKey, contractAddress,amlScore,setAmlScore }) {
  const { isConnected, chain, eerc } = useEERCContext()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)
  const [isCheckingAML, setIsCheckingAML] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)

  const isMainnet = chain?.id === 43113
  const LOCAL_STORAGE_KEY_KEY = localStorage.getItem('decryptionKey')

  useEffect(() => {
    if (LOCAL_STORAGE_KEY_KEY) {
      setDecryptionKey(LOCAL_STORAGE_KEY_KEY)
      setGeneratedKey(LOCAL_STORAGE_KEY_KEY)
    }
  }, [decryptionKey])

  const handleRegister = async () => {
    if (!eerc) return
    setIsRegistering(true)
    setError(null)
    try {
      const result = await eerc.register()
      setTxHash(result.transactionHash)
      toast.success('Registration transaction sent!')

      setTimeout(() => {
        eerc.refetchEercUser()
        toast.success('Registration confirmed!')
      }, 5000)
    } catch (err) {
      console.error('Registration error:', err)
      const msg = err instanceof Error ? err.message : 'An error occurred during registration'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleGenerateKey = async () => {
    if (!eerc) return
    setIsGeneratingKey(true)
    setError(null)
    setAmlScore(null)
    try {
      const key = await eerc.generateDecryptionKey()
      setGeneratedKey(key)
      setDecryptionKey(key)
      localStorage.setItem('decryptionKey', key)
      toast.success('Unique key generated successfully!')

      setIsCheckingAML(true)

      const apiKey = 'efc1cb15054de76ff8d2c8b68e7e834419c8da618436f14b209f4b90a9792385'
      let body =  {
        address: contractAddress,       
        chain_id: 43114,
       interaction_risk : true
      };

      const response = await axios.post(
        'https://aml.blocksec.com/address-compliance/api/v3/risk-score',
        body,
        {
          headers: {
            'API-KEY': apiKey,
            'Content-Type': 'application/json',
          }
        }
      )
      const score = response.data?.data?.risk_score ?? null

      setAmlScore(score)
      toast.success('AML score fetched successfully!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error occurred during key generation or AML check.'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsGeneratingKey(false)
      setIsCheckingAML(false)
    }
  }

  if (!isConnected) {
    return (
      <>
        <Toaster position="bottom-right" />
        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 text-white shadow-xl shadow-[#8A2BE2]/20 backdrop-blur-xl max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center text-white">Registration</h2>
          <p className="text-sm text-slate-400 text-center">Please connect your wallet to proceed.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Toaster position="bottom-right" />

      {(isRegistering || isGeneratingKey || isCheckingAML) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="animate-spin h-16 w-16 border-t-8 border-b-8 border-white rounded-full border-t-[#8a2be2]" />
        </div>
      )}

      <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-12 py-14 text-white shadow-xl shadow-[#8A2BE2]/20 backdrop-blur-xl max-w-lg mx-auto animate-fade-in-up animation-delay-800">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 via-[#8A2BE2] to-purple-500 bg-clip-text text-transparent bg-[length:300%_100%] animate-shine">
          Assign Wallet
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Status</span>
            {eerc?.isRegistered ? (
              <span className="flex items-center text-green-400 font-medium px-3 py-1 rounded-full bg-green-900/20 border border-green-500/30 text-xs">
                <CheckCircle className="w-4 h-4 mr-1" /> Assigned
              </span>
            ) : (
              <span className="flex items-center text-yellow-400 font-medium px-3 py-1 rounded-full bg-yellow-900/20 border border-yellow-500/30 text-xs">
                <Zap className="w-4 h-4 mr-1 animate-pulse" /> Not Assigned
              </span>
            )}
          </div>

          {eerc?.isRegistered && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Unique Key</span>
                <span className={`${generatedKey ? 'text-green-400' : 'text-red-400'} font-medium`}>
                  {generatedKey ? 'Set' : 'Not Set'}
                </span>
              </div>

              {!generatedKey && (
                <Button
                  onClick={handleGenerateKey}
                  disabled={isGeneratingKey || isCheckingAML}
                  className="w-full px-3 py-5 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-[#8A2BE2] hover:from-cyan-600 hover:to-purple-600 text-white rounded-full shadow-xl shadow-[#8A2BE2]/25 hover:shadow-[#8A2BE2]/40 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 border border-[#8A2BE2]"
                >
                  {isGeneratingKey || isCheckingAML ? 'Generating & Checking AML...' : 'Generate & Check AML'}
                </Button>
              )}

            {generatedKey && (
              <>
                <div className="bg-slate-800/50 border border-slate-700/40 p-4 rounded-xl text-xs font-mono text-yellow-300 break-all">
                  <p className="mb-1">Your Unique key (save this securely):</p>
                  <p>{generatedKey}</p>
                </div>
                {amlScore !== null && (
                  <div className="mt-2 text-center text-sm font-semibold">
                    AML Risk Score:{' '}
                    <span
                      className={`font-mono ${
                        amlScore <= 3
                          ? 'text-green-400'
                          : amlScore === 4
                          ? 'text-yellow-400'
                          : 'text-red-600 font-bold'
                      }`}
                    >
                      {amlScore} / 5 —{' '}
                      {amlScore <= 3
                        ? '🟢 Good'
                        : amlScore === 4
                        ? '🟠 Risky'
                        : '🔴 Alert: Avoid Transactions'}
                    </span>
                  </div>
                )}
              </>
            )}
            </div>
          )}

          {!eerc?.isRegistered && (
            <Button
              onClick={handleRegister}
              disabled={isRegistering}
              className="w-full px-3 py-5 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-[#8A2BE2] hover:from-cyan-600 hover:to-purple-600 text-white rounded-full shadow-xl shadow-[#8A2BE2]/25 hover:shadow-[#8A2BE2]/40 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 border border-[#8A2BE2]"
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </Button>
          )}

          {txHash && (
            <a
              href={getExplorerUrl(txHash, isMainnet)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-center mt-2 text-primary-400 hover:text-primary-300 underline"
            >
              View Transaction
            </a>
          )}

          {error && (
            <div className="mt-2 text-xs text-red-400 bg-red-900/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <p className="mt-6 text-xs text-center text-slate-400">
            Secure your crypto by generating unique keys for private transactions. Encrypted key pairs ensure your transactions are always secure, untraceable, and compliant with AML checks.
          </p>
        </div>
      </div>
    </>
  )
}
