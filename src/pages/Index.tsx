
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
    <div className="min-h-screen bg-gradient-to-br from-[#0E0B15] via-[#15070E] to-[#1A0913] text-white overflow-hidden">
      <ThreeBackground />
      <div className="flex flex-col min-h-screen">
        <Navbar 
          onTransferClick={() => setIsTransferModalOpen(true)}
          onPromptClick={() => setIsPromptModalOpen(true)}
        />
        
        {/* Added pt-24 for better spacing from the navbar */}
        <div className="flex-grow flex items-center justify-center pt-24 md:pt-16">
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
  );
};

export default Index;
