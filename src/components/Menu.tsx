import React, { useEffect, useState } from 'react';

type MenuItem = 'assignWallet' | 'bridge' | 'transfer';

interface Props {
  activeMenu: MenuItem;
  onChange: (menu: MenuItem) => void;
}

const MENU_ITEMS: { label: string; value: MenuItem }[] = [
  { label: 'Assign Wallet', value: 'assignWallet' },
  { label: 'Bridge', value: 'bridge' },
  { label: 'Transfer', value: 'transfer' },
];

const Menu: React.FC<Props> = ({ activeMenu, onChange }) => {
  return (
    <div
      className="relative flex rounded-full border border-secondary-700 bg-slate-800 mb-6 overflow-hidden select-none w-full max-w-md mx-auto"
      role="tablist"
    >
      <div
        className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-cyan-400 via-[#8A2BE2] to-purple-500 rounded-full shadow-lg transition-transform duration-800 ease-in-out"
        style={{
          transform:
            activeMenu === 'assignWallet'
              ? 'translateX(0%)'
              : activeMenu === 'bridge'
              ? 'translateX(100%)'
              : 'translateX(200%)',
        }}
      />
      {MENU_ITEMS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`relative flex-1 rounded-full px-4 py-2 text-center font-semibold transition-colors duration-300 ${
            activeMenu === value ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
          role="tab"
          aria-selected={activeMenu === value}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Menu;
