import React, { useState } from 'react';
import { WebsiteCategory, VisualStyle, ColorPalette, GeneratorRequest } from '../../types';
import { COLOR_PALETTES, DEFAULT_PALETTE } from '../../data/palettes';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, Wand2, AlertCircle, Check, Zap, ArrowRight } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (req: GeneratorRequest) => Promise<void>;
  onOpenPricing: () => void;
  isGenerating: boolean;
  generationStep: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  onOpenPricing,
  isGenerating,
  generationStep,
}) => {
  const { user, openAuthModal } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<WebsiteCategory>('Digital marketing agency');
  const [style, setStyle] = useState<VisualStyle>('Luxury');
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(DEFAULT_PALETTE);
  const [businessName, setBusinessName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [requirements, setRequirements] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creditLimitExceeded, setCreditLimitExceeded] = useState(false);

  if (!isOpen) return null;

  const examplePrompts = [
    {
      title: 'Vasai East 1BHK Luxury Flats',
      text: 'Create a modern real estate website for 1BHK luxury flats in Vasai East with property listings, price breakdown starting at ₹38 Lakhs, amenities, EMI calculator, site visit booking, and WhatsApp inquiry.',
      category: 'Real estate' as WebsiteCategory,
      style: 'Luxury' as VisualStyle,
    },
    {
      title: 'Luxury Creative Agency',
      text: 'Multi-page digital agency website named Aura Studio with Home, Services, Portfolio case studies, Pricing table, and Client consultation booking form.',
      category: 'Digital marketing agency' as WebsiteCategory,
      style: 'Luxury' as VisualStyle,
    },
    {
      title: 'Enterprise Edge Cloud SaaS',
      text: 'Developer-first cloud database portal with live sub-millisecond latency benchmarks, documentation, code playground, and interactive pricing tier estimator.',
      category: 'SaaS landing page' as WebsiteCategory,
      style: 'Futuristic' as VisualStyle,
    },
    {
      title: 'Artisanal Storefront',
      text: 'Minimalist e-commerce shop for luxury lighting fixtures with catalog filtering, product detail modals, and cart drawer.',
      category: 'E-commerce storefront' as WebsiteCategory,
      style: 'Minimal' as VisualStyle,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreditLimitExceeded(false);

    if (!user) {
      onClose();
      openAuthModal('signup');
      return;
    }

    if (!prompt.trim() || prompt.trim().length < 10) {
      setError('Please enter a descriptive prompt for your website (minimum 10 characters).');
      return;
    }

    // Check client-side limit
    if (user.freeGenerationsRemaining <= 0 && user.credits < 10 && user.role !== 'admin') {
      setCreditLimitExceeded(true);
      return;
    }

    try {
      await onGenerate({
        prompt: prompt.trim(),
        category,
        style,
        palette: selectedPalette,
        businessName: businessName.trim() || undefined,
        targetAudience: targetAudience.trim() || undefined,
        requirements: requirements.trim() || undefined,
      });
    } catch (err: any) {
      if (err?.code === 'CREDITS_EXHAUSTED' || err?.status === 402) {
        setCreditLimitExceeded(true);
      } else {
        setError(err?.message || 'Failed to generate website. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030407]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A0D14] border border-white/15 rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-left shadow-2xl relative my-8">
        {!isGenerating && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#D4FF24]"></div>
          <span className="text-xs uppercase tracking-widest text-[#D4FF24] font-mono">
            Autonomous Generation
          </span>
          {user && (
            <span className="text-[11px] font-mono text-gray-400 ml-auto mr-8">
              {user.freeGenerationsRemaining > 0
                ? `${user.freeGenerationsRemaining}/5 Free Generations`
                : `${user.credits} Credits (Cost: 10)`}
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold font-heading text-white">Create New Website</h2>
        <p className="text-xs text-[#9299AB] mt-1 mb-6">
          Describe the website you want to generate. LUXORA AI will build a complete, responsive multi-file project.
        </p>

        {creditLimitExceeded && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Zap className="w-4 h-4 text-[#D4FF24]" />
              <span>Free Generation Allowance Reached</span>
            </div>
            <p className="mb-3 text-gray-300">
              You have completed your 5 complimentary website generations. Choose a subscription package to receive instant credits and continue generating.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPricing();
              }}
              className="px-4 py-2 rounded-lg bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Plans &amp; Upgrade</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isGenerating ? (
          <div className="py-12 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-[#1558C9]/30 border-t-[#D4FF24] animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-[#030407] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#D4FF24] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold font-heading text-white">Synthesizing Your Website</h3>
              <p className="text-xs text-[#9299AB] font-mono">{generationStep || 'Building semantic components...'}</p>
            </div>

            <div className="max-w-xs mx-auto bg-[#101521] rounded-full h-1.5 overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-[#1558C9] via-[#D4FF24] to-[#D4FF24] h-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Inspiration Pills */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">Example Starter Prompts</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {examplePrompts.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPrompt(ex.text);
                      setCategory(ex.category);
                      setStyle(ex.style);
                    }}
                    className="p-2.5 text-left rounded-xl bg-[#101521] border border-white/5 hover:border-[#D4FF24]/40 hover:bg-white/5 transition text-xs text-gray-300 cursor-pointer"
                  >
                    <span className="font-semibold text-white block mb-0.5">{ex.title}</span>
                    <span className="text-[11px] text-gray-400 line-clamp-1">{ex.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Textarea */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Website Prompt / Vision <span className="text-[#D4FF24]">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., An ultra-clean modern architectural studio website with full-screen project photography, minimalist typography, interactive quote estimator, and client case study drawer..."
                className="w-full bg-[#101521] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4FF24] transition leading-relaxed"
              ></textarea>
            </div>

            {/* Category and Style Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Website Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WebsiteCategory)}
                  className="w-full bg-[#101521] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4FF24]"
                >
                  <option value="Portfolio">Portfolio</option>
                  <option value="Business website">Business website</option>
                  <option value="Digital marketing agency">Digital marketing agency</option>
                  <option value="E-commerce storefront">E-commerce storefront</option>
                  <option value="SaaS landing page">SaaS landing page</option>
                  <option value="Real estate">Real estate</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Blog">Blog</option>
                  <option value="Education">Education</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Visual Aesthetic Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as VisualStyle)}
                  className="w-full bg-[#101521] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4FF24]"
                >
                  <option value="Luxury">Luxury (Dark, refined, high-end)</option>
                  <option value="Minimal">Minimal (Spacious, clean, uncluttered)</option>
                  <option value="Editorial">Editorial (Strong typography, high contrast)</option>
                  <option value="Futuristic">Futuristic (High tech, sleek lines, cobalt)</option>
                  <option value="Corporate">Corporate (Balanced, trustworthy, structured)</option>
                  <option value="Creative">Creative (Expressive, dynamic layouts)</option>
                </select>
              </div>
            </div>

            {/* Color Scheme Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">Color Palette</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => setSelectedPalette(pal)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                      selectedPalette.id === pal.id
                        ? 'border-[#D4FF24] bg-[#101521]'
                        : 'border-white/10 bg-[#07090F] hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white text-[11px]">{pal.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.bg, border: '1px solid rgba(255,255,255,0.2)' }}></span>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.accent }}></span>
                      </div>
                    </div>
                    {selectedPalette.id === pal.id && <Check className="w-4 h-4 text-[#D4FF24]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Brand / Business Name (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., Studio Axon"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-[#101521] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4FF24]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Specific Components / Features (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., Pricing calculator, FAQ, contact form"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full bg-[#101521] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4FF24]"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition shadow-[0_0_20px_-4px_rgba(212,255,36,0.35)] flex items-center gap-2 cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>Generate Website</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
