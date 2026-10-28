import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  CreditCard,
  User,
  LogOut,
  Shield,
  ChevronDown,
  Layers,
  Plus,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'editor' | 'admin';
  onNavigate: (view: 'landing' | 'dashboard' | 'admin') => void;
  onOpenCreateModal: () => void;
  onOpenPricing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCreateModal,
  onOpenPricing,
}) => {
  const { user, logout, openAuthModal } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#030407]/90 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-[#F5F7FF] whitespace-nowrap shrink-0 font-heading focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4FF24] cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF24] shadow-[0_0_12px_#D4FF24]"></span>
          <span className="tracking-tighter text-xl">
            LUXORA<span className="text-[#D4FF24] ml-1">AI</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#9299AB]">
          <button
            onClick={() => onNavigate('landing')}
            className={`hover:text-[#F5F7FF] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'landing' ? 'text-[#F5F7FF]' : ''
            }`}
          >
            Product
          </button>
          <a
            href="#templates"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-[#F5F7FF] transition-colors whitespace-nowrap shrink-0"
          >
            Templates
          </a>
          <a
            href="#features"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-[#F5F7FF] transition-colors whitespace-nowrap shrink-0"
          >
            Features
          </a>
          <button
            onClick={onOpenPricing}
            className="hover:text-[#F5F7FF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pricing
          </button>
          {user && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`hover:text-[#F5F7FF] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'dashboard' ? 'text-[#D4FF24] font-semibold' : ''
              }`}
            >
              Dashboard
            </button>
          )}
          {user && user.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`hover:text-purple-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                currentView === 'admin' ? 'text-purple-400 font-bold' : 'text-purple-400/80'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: User Status & Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Credit / Free Badge */}
              <button
                onClick={onOpenPricing}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#101521] border border-white/10 hover:border-[#D4FF24]/40 transition text-xs font-mono cursor-pointer"
                title="Manage credits and subscription"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4FF24]" />
                {user.freeGenerationsRemaining > 0 ? (
                  <span>
                    <strong className="text-white">{user.freeGenerationsRemaining}</strong>/5 Free
                  </span>
                ) : (
                  <span>
                    <strong className="text-[#D4FF24]">{user.credits}</strong> Credits
                  </span>
                )}
              </button>

              {/* New Project Button */}
              <button
                onClick={onOpenCreateModal}
                className="px-3.5 py-2 text-xs font-semibold text-[#030407] bg-[#D4FF24] rounded-lg hover:opacity-90 transition-all duration-200 shadow-[0_0_20px_-4px_rgba(212,255,36,0.35)] whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Project</span>
              </button>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition border border-white/10 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#101521] border border-[#D4FF24]/40 flex items-center justify-center text-xs font-bold text-[#D4FF24]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#0A0D14] border border-white/15 p-2 shadow-2xl z-50 text-xs">
                    <div className="p-3 border-b border-white/5">
                      <div className="font-semibold text-white truncate">{user.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono truncate">{user.email}</div>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-gray-500">Plan:</span>
                        <span className="text-[#D4FF24] font-bold">
                          {user.subscription?.plan_name || 'Free Tier'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-gray-400" />
                        <span>My Projects</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenPricing();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#D4FF24]" />
                        <span>Billing &amp; Credits</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-500/10 text-purple-300 flex items-center gap-2 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-400" />
                          <span>Admin Console</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition whitespace-nowrap cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 text-xs font-bold text-[#030407] bg-[#D4FF24] rounded-lg hover:opacity-90 transition-all duration-200 shadow-[0_0_20px_-4px_rgba(212,255,36,0.35)] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
