
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import ThreeBackground from '@/components/ThreeBackground';
import HeroSection from '@/components/HeroSection';
import MultiTransferModal from '@/components/MultiTransferModal';
import AIPromptModal from '@/components/AIPromptModal';

const Index = () => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-cyan-900/10 text-white overflow-hidden">
      <ThreeBackground />
      <Navbar 
        onTransferClick={() => setIsTransferModalOpen(true)}
        onPromptClick={() => setIsPromptModalOpen(true)}
      />
      
      <HeroSection 
        onTransferClick={() => setIsTransferModalOpen(true)}
        onPromptClick={() => setIsPromptModalOpen(true)}
      />

      <MultiTransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <AIPromptModal 
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
      />
    </div>
  );
};

export default Index;
