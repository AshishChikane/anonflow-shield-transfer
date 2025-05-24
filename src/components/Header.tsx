import { ConnectKitButton } from 'connectkit';
import { displayFullAddress } from '../lib/utils';
import { Shield, Wallet } from 'lucide-react';

interface HeaderProps {
  network: 'mainnet' | 'testnet';
  connectedAddress: string | null;
  setConnectedAddress: (addr: string | null) => void;
  setDecryptionKey: (addr: string | null) => void;
}

export default function Header({
  network,
  connectedAddress,
  setConnectedAddress,
  setDecryptionKey
}: HeaderProps) {
  const shortAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-[#8A2BE2] rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Privora</h1>
          </div>
        </div>

        <ConnectKitButton.Custom>
          {({ isConnected, isConnecting, show, address }) => {
            if (isConnected && address && address !== connectedAddress) {
              setConnectedAddress(address);
            }
            if (!isConnected && connectedAddress !== null) {
              setConnectedAddress(null);
              setDecryptionKey(null)
            }

            return (
              <button
                onClick={show}
                className="text-md flex shadow-md transition-transform truncate max-w-[240px] px-6 py-3 text-md font-semibold bg-gradient-to-r from-cyan-500 to-[#8A2BE2] text-white rounded-full hover:from-cyan-600 hover:to-purple-600 shadow-[#8A2BE2]/25 hover:shadow-[#8A2BE2]/40 hover:scale-105"
              >
                <Wallet className="w-5 h-5 mt-0.5 mr-2" />
                {isConnected
                  ? shortAddress(displayFullAddress(address || ''))
                  : isConnecting
                  ? 'Connecting...'
                  : 'Connect Wallet'}
              </button>
            );
          }}
        </ConnectKitButton.Custom>
      </div>
    </header>
  );
}
