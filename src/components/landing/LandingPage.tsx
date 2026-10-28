import React, { useState } from 'react';
import { STARTER_TEMPLATES } from '../../data/templates';
import { PRICING_PLANS } from '../../data/pricing';
import { StarterTemplate, PricingPlan } from '../../types';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Code2,
  Download,
  Smartphone,
  Eye,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  ChevronDown,
  Monitor,
  Tablet,
  Sliders,
} from 'lucide-react';

interface LandingPageProps {
  onStartBuilding: () => void;
  onSelectTemplate: (template: StarterTemplate) => void;
  onOpenPricingDemo: (plan: PricingPlan) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartBuilding,
  onSelectTemplate,
  onOpenPricingDemo,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const faqs = [
    {
      q: 'How does LUXORA AI generate websites from prompts?',
      a: 'LUXORA AI connects to our server-side AI provider engine (featuring official Google Gemini 3.8 Flash SDK integration and DeepSeek support). It translates your prompt, chosen visual style, and color palette into a clean multi-file project with semantic HTML, Tailwind CSS, and interactive client JavaScript.',
    },
    {
      q: 'Can I export clean source code and host it anywhere?',
      a: 'Yes. With one click, LUXORA generates and downloads a standard ZIP archive containing package.json, index.html, Vite configuration, and complete modular files. You can deploy it instantly to Vercel, Netlify, Cloud Run, AWS S3, or any static host with zero vendor lock-in.',
    },
    {
      q: 'How does live preview isolation work?',
      a: 'The preview workspace renders your project within an isolated, sandboxed iframe. This guarantees that generated scripts and styling never conflict with the builder workspace while allowing real-time responsive testing across desktop, tablet, and mobile breakpoints.',
    },
    {
      q: 'Can I refine specific sections with follow-up prompts?',
      a: 'Absolutely. Using the visual editor prompt bar, you can issue targeted directives such as "Add an interactive pricing calculator", "Make hero layout two-column", or "Change accent to Electric Cobalt". LUXORA modifies only the requested sections while preserving existing content.',
    },
    {
      q: 'What happens if I do not have an API key configured?',
      a: 'LUXORA includes a built-in Demo Mode powered by our local synthesis engine. You can create projects, explore all 6 production templates, test responsive viewports, edit visual design tokens, and export full ZIP files without entering any external credentials.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#030407] text-[#F5F7FF]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient cobalt atmospheric glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#1558C9]/20 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Small label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-[#D4FF24] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF24]"></span>
            <span>YOUR IDEAS. BUILT WITH AI.</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight font-heading leading-[1.08] mb-8 text-balance">
            From Prompt to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F7FF] via-[#D4FF24] to-[#D4FF24]">
              Production-Ready Website.
            </span>
          </h1>

          {/* Supporting text */}
          <p className="text-base sm:text-xl text-[#9299AB] max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            Describe your vision. Generate your website. Refine every detail. Export clean code when you're ready.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartBuilding}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#D4FF24] text-[#030407] font-bold text-sm hover:opacity-95 transition-all duration-200 shadow-[0_0_30px_-5px_rgba(212,255,36,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Building Free</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <a
              href="#templates"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#101521] border border-white/10 text-[#F5F7FF] font-medium text-sm hover:bg-white/10 transition-all duration-200 text-center cursor-pointer"
            >
              Explore Templates
            </a>
          </div>
        </div>

        {/* Realistic Interactive Product Preview */}
        <div className="mt-16 max-w-6xl mx-auto rounded-2xl border border-white/15 bg-[#0A0D14] shadow-[0_20px_70px_-15px_rgba(21,88,201,0.3)] overflow-hidden">
          {/* Builder Top Toolbar */}
          <div className="px-5 py-3 border-b border-white/10 bg-[#07090F] flex items-center justify-between text-xs text-[#9299AB]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              </div>
              <span className="text-white/40">|</span>
              <span className="font-mono text-gray-400">luxora-workspace / aura-studio</span>
            </div>

            {/* Viewport switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-[#101521] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded transition ${previewDevice === 'desktop' ? 'bg-[#030407] text-[#D4FF24]' : 'text-gray-400 hover:text-white'}`}
                title="Desktop (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded transition ${previewDevice === 'tablet' ? 'bg-[#030407] text-[#D4FF24]' : 'text-gray-400 hover:text-white'}`}
                title="Tablet (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded transition ${previewDevice === 'mobile' ? 'bg-[#030407] text-[#D4FF24]' : 'text-gray-400 hover:text-white'}`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab(activeTab === 'preview' ? 'code' : 'preview')}
                className="px-2.5 py-1 rounded bg-[#101521] border border-white/10 hover:text-white transition flex items-center gap-1.5 text-[11px]"
              >
                <Code2 className="w-3 h-3 text-[#D4FF24]" />
                <span>{activeTab === 'preview' ? 'View Source' : 'View Preview'}</span>
              </button>
              <button
                onClick={onStartBuilding}
                className="px-3 py-1 rounded bg-[#D4FF24] text-[#030407] font-semibold text-[11px] hover:opacity-90 transition flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Export ZIP</span>
              </button>
            </div>
          </div>

          {/* Builder 3-Panel Preview Mockup */}
          <div className="grid grid-cols-12 min-h-[460px] bg-[#030407]">
            {/* Left Panel: Component & File Explorer */}
            <div className="hidden lg:block col-span-3 border-r border-white/10 bg-[#0A0D14]/90 p-4 text-xs font-mono">
              <div className="text-[11px] text-[#9299AB] uppercase tracking-wider mb-3 font-sans font-semibold">
                Project Files
              </div>
              <div className="space-y-1 mb-6 text-gray-400">
                <div className="px-2.5 py-1.5 rounded bg-white/5 text-[#D4FF24] flex items-center justify-between">
                  <span>📄 index.html</span>
                  <span className="text-[10px] bg-[#D4FF24]/10 text-[#D4FF24] px-1 rounded">active</span>
                </div>
                <div className="px-2.5 py-1.5 rounded hover:bg-white/5 flex items-center justify-between">
                  <span>📄 src/App.tsx</span>
                </div>
                <div className="px-2.5 py-1.5 rounded hover:bg-white/5 flex items-center justify-between">
                  <span>📄 src/styles.css</span>
                </div>
                <div className="px-2.5 py-1.5 rounded hover:bg-white/5 flex items-center justify-between">
                  <span>📄 package.json</span>
                </div>
              </div>

              <div className="text-[11px] text-[#9299AB] uppercase tracking-wider mb-3 font-sans font-semibold">
                Page Sections
              </div>
              <div className="space-y-1 text-gray-400">
                <div className="px-2.5 py-1 rounded bg-white/5 text-white flex items-center justify-between">
                  <span>01. Header Navigation</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF24]"></span>
                </div>
                <div className="px-2.5 py-1 rounded hover:bg-white/5 flex items-center justify-between">
                  <span>02. Atmospheric Hero</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1558C9]"></span>
                </div>
                <div className="px-2.5 py-1 rounded hover:bg-white/5 flex items-center justify-between">
                  <span>03. Showcase Grid</span>
                </div>
                <div className="px-2.5 py-1 rounded hover:bg-white/5 flex items-center justify-between">
                  <span>04. Pricing Matrix</span>
                </div>
                <div className="px-2.5 py-1 rounded hover:bg-white/5 flex items-center justify-between">
                  <span>05. Multi-column Footer</span>
                </div>
              </div>
            </div>

            {/* Center Panel: Live Preview Area */}
            <div className="col-span-12 lg:col-span-6 p-4 sm:p-6 flex flex-col items-center justify-center bg-[#05070D]">
              {activeTab === 'preview' ? (
                <div
                  className={`w-full transition-all duration-300 rounded-xl overflow-hidden border border-white/10 bg-[#030407] shadow-xl ${
                    previewDevice === 'mobile'
                      ? 'max-w-[360px]'
                      : previewDevice === 'tablet'
                      ? 'max-w-[540px]'
                      : 'max-w-full'
                  }`}
                >
                  <img
                    src="/src/assets/images/hero_builder_preview_1793197348154.jpg"
                    alt="LUXORA AI Builder Interface"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-full h-[400px] p-4 bg-[#0A0D14] rounded-xl border border-white/10 font-mono text-xs overflow-auto text-gray-300">
                  <div className="text-gray-500">// index.html — Self-contained production build</div>
                  <div className="mt-2 text-[#D4FF24]">&lt;!DOCTYPE html&gt;</div>
                  <div>&lt;html lang=&quot;en&quot; class=&quot;scroll-smooth&quot;&gt;</div>
                  <div className="pl-4">&lt;head&gt;</div>
                  <div className="pl-8 text-blue-400">&lt;script src=&quot;https://cdn.tailwindcss.com&quot;&gt;&lt;/script&gt;</div>
                  <div className="pl-8">&lt;link href=&quot;https://fonts.googleapis.com/...&quot; rel=&quot;stylesheet&quot;&gt;</div>
                  <div className="pl-4">&lt;/head&gt;</div>
                  <div className="pl-4">&lt;body class=&quot;bg-[#030407] text-[#F5F7FF]&quot;&gt;</div>
                  <div className="pl-8 text-emerald-400">&lt;header class=&quot;sticky top-0 z-50 backdrop-blur-xl border-b border-white/10&quot;&gt;</div>
                  <div className="pl-12 text-gray-400">&lt;!-- Dynamic Brand Bar &amp; CTAs --&gt;</div>
                  <div className="pl-8 text-emerald-400">&lt;/header&gt;</div>
                  <div className="pl-4">&lt;/body&gt;</div>
                  <div>&lt;/html&gt;</div>
                </div>
              )}
            </div>

            {/* Right Panel: Design Controls & AI Refine Box */}
            <div className="hidden lg:block col-span-3 border-l border-white/10 bg-[#0A0D14]/90 p-4 text-xs">
              <div className="text-[11px] text-[#9299AB] uppercase tracking-wider mb-3 font-sans font-semibold flex items-center justify-between">
                <span>Design Tokens</span>
                <Sliders className="w-3 h-3 text-[#D4FF24]" />
              </div>

              {/* Color Presets */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-gray-400 block mb-1.5 text-[11px]">Primary Brand Accent</label>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#101521] border border-white/10">
                    <span className="w-4 h-4 rounded-full bg-[#D4FF24] shadow-[0_0_8px_#D4FF24]"></span>
                    <span className="font-mono text-[11px] text-white">#D4FF24 (Acid Lime)</span>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1.5 text-[11px]">Canvas Surface</label>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#101521] border border-white/10">
                    <span className="w-4 h-4 rounded-full bg-[#030407] border border-white/20"></span>
                    <span className="font-mono text-[11px] text-white">#030407 (Midnight)</span>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1.5 text-[11px]">Typography Pair</label>
                  <div className="p-2 rounded-lg bg-[#101521] border border-white/10 text-[11px] text-white">
                    Space Grotesk + Inter
                  </div>
                </div>
              </div>

              {/* AI Prompt Box */}
              <div className="p-3 rounded-xl bg-gradient-to-b from-[#101521] to-[#0A0D14] border border-white/10">
                <span className="text-[11px] font-semibold text-[#D4FF24] flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Direct Prompt</span>
                </span>
                <p className="text-[11px] text-gray-400 mb-2">Tell LUXORA what to change...</p>
                <div className="text-[11px] font-mono text-gray-300 p-2 rounded bg-black/40 border border-white/5 mb-2">
                  "Make hero section two-column and add a pricing calculator"
                </div>
                <button
                  onClick={onStartBuilding}
                  className="w-full py-2 bg-[#D4FF24] text-[#030407] font-semibold text-[11px] rounded hover:opacity-90 transition"
                >
                  Test Prompt Live
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#D4FF24] font-mono font-medium">Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mt-2 mb-4">How LUXORA Works</h2>
          <p className="text-sm text-[#9299AB]">From initial spark to downloadable production code in four streamlined steps.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0A0D14] border border-white/10 hover:border-white/20 transition-all duration-200">
            <span className="font-mono text-xs text-[#D4FF24]">01</span>
            <h3 className="text-lg font-bold font-heading mt-3 mb-2">Describe</h3>
            <p className="text-xs text-[#9299AB] leading-relaxed">
              Input your vision in natural language. Pick your category, visual style, and brand color palette.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0A0D14] border border-white/10 hover:border-white/20 transition-all duration-200">
            <span className="font-mono text-xs text-[#D4FF24]">02</span>
            <h3 className="text-lg font-bold font-heading mt-3 mb-2">Generate</h3>
            <p className="text-xs text-[#9299AB] leading-relaxed">
              Gemini 3.8 Flash synthesizes responsive layouts, semantic markup, and interactive components.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0A0D14] border border-white/10 hover:border-white/20 transition-all duration-200">
            <span className="font-mono text-xs text-[#D4FF24]">03</span>
            <h3 className="text-lg font-bold font-heading mt-3 mb-2">Refine</h3>
            <p className="text-xs text-[#9299AB] leading-relaxed">
              Test in desktop, tablet, and mobile breakpoints. Tweak design tokens or issue follow-up prompts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0A0D14] border border-white/10 hover:border-white/20 transition-all duration-200">
            <span className="font-mono text-xs text-[#D4FF24]">04</span>
            <h3 className="text-lg font-bold font-heading mt-3 mb-2">Export</h3>
            <p className="text-xs text-[#9299AB] leading-relaxed">
              Download clean ZIP archives with package.json and full instructions. Run locally or deploy anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Curated Template Gallery */}
      <section id="templates" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D4FF24] font-mono font-medium">Starters</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mt-2">Curated Template Gallery</h2>
            <p className="text-sm text-[#9299AB] mt-1">Six production-grade starters with distinct architectures and real copy.</p>
          </div>
          <button
            onClick={onStartBuilding}
            className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition self-start sm:self-auto cursor-pointer"
          >
            Create from Scratch
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STARTER_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="group rounded-2xl overflow-hidden bg-[#0A0D14] border border-white/10 hover:border-white/25 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="h-52 overflow-hidden relative bg-[#030407]">
                  <img
                    src={tpl.coverImage}
                    alt={tpl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#D4FF24]">
                    {tpl.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold font-heading text-white">{tpl.title}</h3>
                  <p className="text-xs text-[#9299AB] mt-1 mb-4 line-clamp-2">{tpl.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tpl.features.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => onSelectTemplate(tpl)}
                  className="w-full py-2.5 rounded-lg bg-[#D4FF24] text-[#030407] font-semibold text-xs hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Open in Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features & Benefits */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="max-w-2xl mb-16">
          <span className="text-xs uppercase tracking-widest text-[#D4FF24] font-mono font-medium">Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mt-2">Engineered for Senior Quality</h2>
          <p className="text-sm text-[#9299AB] mt-2">LUXORA AI is built like a developer workspace, prioritizing code purity and maintainability.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#0A0D14] border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#1558C9]/20 flex items-center justify-center text-[#D4FF24] mb-5">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading mb-2">Semantic Multi-File Codebase</h3>
            <p className="text-xs text-[#9299AB] leading-relaxed">
              Generated outputs are real structured projects with HTML, TypeScript, CSS modules, and package.json—not a single monolithic string.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0A0D14] border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#1558C9]/20 flex items-center justify-center text-[#D4FF24] mb-5">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading mb-2">Sandboxed Multi-Device Testing</h3>
            <p className="text-xs text-[#9299AB] leading-relaxed">
              Inspect your layouts in real desktop, tablet, and mobile viewport frames. No artificial browser emulation or styling bleed.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0A0D14] border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#1558C9]/20 flex items-center justify-center text-[#D4FF24] mb-5">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading mb-2">Integrated Source Code Editor</h3>
            <p className="text-xs text-[#9299AB] leading-relaxed">
              Directly edit raw project files with line numbers and syntax highlighting. Changes reflect immediately in the preview.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0A0D14] border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#1558C9]/20 flex items-center justify-center text-[#D4FF24] mb-5">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading mb-2">Real JSZip Export</h3>
            <p className="text-xs text-[#9299AB] leading-relaxed">
              Export standard Vite-compatible ZIP bundles with npm scripts. Zero proprietary locks or hidden subscription watermarks.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0A0D14] border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#1558C9]/20 flex items-center justify-center text-[#D4FF24] mb-5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading mb-2">Server-Side Secret Hygiene</h3>
            <p className="text-xs text-[#9299AB] leading-relaxed">
              API keys are strictly evaluated on our secure backend. No credentials are ever exposed in client bundles or exported files.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0A0D14] border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#1558C9]/20 flex items-center justify-center text-[#D4FF24] mb-5">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading mb-2">Official Gemini 3.8 Flash Core</h3>
            <p className="text-xs text-[#9299AB] leading-relaxed">
              Leverages Google GenAI TypeScript SDK for sub-second responses, high aesthetic fidelity, and intelligent follow-up code diffs.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#D4FF24] font-mono font-medium">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mt-2 mb-4">Straightforward Plans</h2>
          <p className="text-sm text-[#9299AB] mb-6">Choose the capacity that fits your workflow. Cancel or upgrade anytime.</p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-[#0A0D14] border border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                billingCycle === 'monthly' ? 'bg-[#101521] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-[#101521] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Yearly</span>
              <span className="text-[10px] bg-[#D4FF24]/20 text-[#D4FF24] px-1.5 py-0.5 rounded font-mono">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`p-8 rounded-2xl bg-[#0A0D14] border flex flex-col justify-between relative ${
                  plan.highlighted
                    ? 'border-[#D4FF24] shadow-[0_0_35px_-5px_rgba(212,255,36,0.2)]'
                    : 'border-white/10'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#D4FF24] text-[#030407] text-[10px] font-bold uppercase tracking-wider font-mono">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <span className="text-xs font-semibold text-[#9299AB] uppercase tracking-wider">{plan.name}</span>
                  <div className="text-4xl font-bold font-heading text-white mt-3 tabular-nums">
                    ₹{price.toLocaleString()}
                    <span className="text-xs font-normal text-[#9299AB] ml-1">/ month</span>
                  </div>
                  <p className="text-xs text-[#9299AB] mt-2 mb-6">{plan.description}</p>

                  <div className="border-t border-white/10 pt-6 space-y-3">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-[#D4FF24] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => onOpenPricingDemo(plan)}
                    className={`w-full py-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      plan.highlighted
                        ? 'bg-[#D4FF24] text-[#030407] hover:opacity-90 shadow-sm'
                        : 'bg-[#101521] border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {plan.priceMonthly === 0 ? 'Start Free Workspace' : `Select ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-24 px-6 max-w-4xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-[#D4FF24] font-mono font-medium">FAQ</span>
          <h2 className="text-3xl font-bold font-heading mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-[#0A0D14] overflow-hidden transition-colors"
            >
              <button
                onClick={() => setFaqOpenIndex(faqOpenIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white focus-visible:outline-none"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#D4FF24] transition-transform duration-200 shrink-0 ${
                    faqOpenIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {faqOpenIndex === index && (
                <div className="px-6 pb-5 text-xs text-[#9299AB] leading-relaxed border-t border-white/5 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 px-6 bg-[#030407] text-xs text-[#9299AB]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF24]"></span>
              <span className="font-bold text-base font-heading text-white">LUXORA AI</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Autonomous website architecture engine. Transforming natural language prompts into production-grade digital flagships.
            </p>
            <span className="text-[11px] font-mono text-gray-600">Built for Google AI Studio</span>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-white font-semibold block mb-3 font-mono">Product</span>
            <ul className="space-y-2">
              <li><button onClick={onStartBuilding} className="hover:text-white transition">Builder Workspace</button></li>
              <li><a href="#templates" className="hover:text-white transition">Curated Starters</a></li>
              <li><a href="#features" className="hover:text-white transition">Technical Specs</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing Plans</a></li>
            </ul>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-white font-semibold block mb-3 font-mono">Integrations</span>
            <ul className="space-y-2">
              <li className="text-gray-400">Google Gemini 3.8 Flash</li>
              <li className="text-gray-400">DeepSeek API Adapter</li>
              <li className="text-gray-400">JSZip Source Exporter</li>
              <li className="text-gray-400">Tailwind CSS Engine</li>
            </ul>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-white font-semibold block mb-3 font-mono">System</span>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">Security Architecture</a></li>
              <li><a href="#" className="hover:text-white transition">Terms & Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-600">
          <p>© 2026 LUXORA AI. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono">Status: All Systems Operational</p>
        </div>
      </footer>
    </div>
  );
};
