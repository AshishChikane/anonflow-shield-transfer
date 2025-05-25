import { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import MultiTransferModal from '@/components/MultiTransferModal';
import AIPromptModal from '@/components/AIPromptModal';
import ThreeBackground from '@/components/ThreeBackground';
import Header from '../components/Header';
import NetworkToggle from '../components/NetworkToggle';
import Register from '../components/Register';
import TokenOperations from '../components/TokenOperations';
import TokenTransfer from '../components/TokenTransfer';
import { EERCProvider } from '../context/EERCContext';
import { motion } from 'framer-motion';
import Menu from '../components/Menu';
import { toast } from 'react-hot-toast';

type MenuItem = 'assignWallet' | 'bridge' | 'transfer';

const LOCAL_STORAGE_MENU_KEY = 'activeMenuItem';
const LOCAL_STORAGE_KEY_KEY = 'decryptionKey';

const Index = () => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet');
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [decryptionKey, setDecryptionKeyState] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem>('assignWallet');
  const [amlScore, setAmlScore] = useState<number | null>(null)

  useEffect(() => {
    const savedMenu = localStorage.getItem(LOCAL_STORAGE_MENU_KEY) as MenuItem | null;
    if (savedMenu && ['assignWallet', 'bridge', 'transfer'].includes(savedMenu)) {
      setActiveMenuItem(savedMenu);
    } else {
      setActiveMenuItem('assignWallet'); // Ensure default
    }
  
    const savedKey = localStorage.getItem(LOCAL_STORAGE_KEY_KEY);
    if (savedKey) {
      setDecryptionKeyState(savedKey);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_MENU_KEY, activeMenuItem);
  }, [activeMenuItem]);


  const setDecryptionKey = (key: string | null) => {
    if (key) {
      localStorage.setItem(LOCAL_STORAGE_KEY_KEY, key);
      setDecryptionKeyState(key);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_KEY);
      setDecryptionKeyState('');
    }
  };

  const handleMenuChange = (menu: MenuItem) => {
    if ((menu === 'bridge' || menu === 'transfer') && !decryptionKey) {
      toast.error('Please register and generate a unique key before accessing this section.');
      return;
    }
    setActiveMenuItem(menu);
  };

  useEffect(() => {
    if (connectedAddress) {
      setActiveMenuItem('assignWallet');
    }
  }, [connectedAddress]);
  

  return (
    <div className="min-h-screen flex flex-col text-white">
      <div className="flex flex-col min-h-screen relative z-10">
        <Header
          network={network}
          connectedAddress={connectedAddress}
          setConnectedAddress={setConnectedAddress}
          setDecryptionKey={setDecryptionKey}
        />
        <ThreeBackground />
        {connectedAddress ? (
          <EERCProvider network={network}>
            <motion.main
              className="flex-1 container mx-auto px-4 py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="mb-8 flex justify-end">
                <NetworkToggle
                  network={network}
                  onToggle={() => setNetwork(network === 'mainnet' ? 'testnet' : 'mainnet')}
                />
              </div>
              <Menu activeMenu={activeMenuItem} onChange={handleMenuChange} />
              {activeMenuItem === 'assignWallet' && (
                <div className="min-h-96 flex items-center justify-center px-4">
                <Register
                  decryptionKey={decryptionKey}
                  setDecryptionKey={setDecryptionKey}
                  contractAddress={connectedAddress}
                  setAmlScore={setAmlScore}
                  amlScore={amlScore}
                />               
               </div>
              )}
              {activeMenuItem === 'bridge' && (
                <div className="space-y-8">
                  <TokenOperations />
                </div>
              )}
              {activeMenuItem === 'transfer' && (
                <div className="space-y-8">
                  <TokenTransfer />
                </div>
              )}
            </motion.main>
          </EERCProvider>
        ) : (
          <div className="min-h-screen text-white overflow-hidden">
            <div className="flex flex-col min-h-screen relative z-10">
              <div className="flex-grow flex items-center justify-center">
                <HeroSection
                  onTransferClick={() => setIsTransferModalOpen(true)}
                  onPromptClick={() => setIsPromptModalOpen(true)}
                />
              </div>
            </div>

            <MultiTransferModal
              isOpen={isTransferModalOpen}
              onClose={() => setIsTransferModalOpen(false)}
            />
            <AIPromptModal
              isOpen={isPromptModalOpen}
              onClose={() => setIsPromptModalOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
