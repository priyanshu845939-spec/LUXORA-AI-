import React, { useState, useEffect } from 'react';
import { VideoScript, ScriptPlatform, ScriptLanguage, ScriptTone } from '../../types';
import { apiGenerateScript, apiRefineScript, apiFetchUserScripts, apiSaveScript } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Video,
  Sparkles,
  Clapperboard,
  Clock,
  Globe,
  Flame,
  Copy,
  Check,
  Download,
  Bookmark,
  RefreshCw,
  Sliders,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Share2,
  Layers,
  Volume2,
  Camera,
  Eye,
} from 'lucide-react';

interface ScriptStudioProps {
  onOpenPricing: () => void;
  defaultPrompt?: string;
}

export const ScriptStudio: React.FC<ScriptStudioProps> = ({ onOpenPricing, defaultPrompt = '' }) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState(defaultPrompt || '30-second Hindi real estate reel for 1BHK luxury flats in Vasai East starting at 38 lakhs');
  const [platform, setPlatform] = useState<ScriptPlatform>('Instagram Reels');
  const [duration, setDuration] = useState<string>('30s');
  const [language, setLanguage] = useState<ScriptLanguage>('Hindi');
  const [tone, setTone] = useState<ScriptTone>('Luxury & Cinematic');
  const [targetAudience, setTargetAudience] = useState('First-time home buyers, working professionals in Mumbai MMR');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [savedScripts, setSavedScripts] = useState<VideoScript[]>([]);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'scenes' | 'teleprompter'>('scenes');

  useEffect(() => {
    apiFetchUserScripts().then((res) => {
      if (res && res.length > 0) setSavedScripts(res);
    }).catch(() => {});
  }, []);

  const promptSuggestions = [
    {
      title: 'Vasai East 1BHK Flat Reel (Hindi)',
      topic: '30-second high-energy Hindi reel for 1BHK flats in Vasai East starting at ₹38 Lakhs, 5 mins from station with swimming pool and gym.',
      platform: 'Instagram Reels' as ScriptPlatform,
      duration: '30s',
      language: 'Hindi' as ScriptLanguage,
      tone: 'High Energy & Viral' as ScriptTone,
    },
    {
      title: 'Luxury Villa Tour (Hinglish)',
      topic: '45-second aesthetic cinematic walkthrough of a cliffside 4BHK luxury villa with infinity pool and private helipad.',
      platform: 'Property Walkthrough' as ScriptPlatform,
      duration: '45s',
      language: 'Hinglish' as ScriptLanguage,
      tone: 'Luxury & Cinematic' as ScriptTone,
    },
    {
      title: 'E-commerce Brand Ad (English)',
      topic: '30-second direct response video ad for noise-cancelling wireless earbuds with 60-hour battery life and spatial audio.',
      platform: 'Video Ad (Lead Gen)' as ScriptPlatform,
      duration: '30s',
      language: 'English' as ScriptLanguage,
      tone: 'Direct Response & Urgency' as ScriptTone,
    },
    {
      title: 'Developer SaaS Reel (English)',
      topic: '15-second viral hook reel showing developer switching to sub-millisecond edge database and eliminating cold starts.',
      platform: 'YouTube Shorts' as ScriptPlatform,
      duration: '15s',
      language: 'English' as ScriptLanguage,
      tone: 'High Energy & Viral' as ScriptTone,
    },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please provide a video topic or brief.');
      return;
    }

    if (user && user.freeGenerationsRemaining <= 0 && user.credits < 3 && user.role !== 'admin') {
      onOpenPricing();
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const generated = await apiGenerateScript({
        topic: topic.trim(),
        platform,
        duration,
        language,
        tone,
        targetAudience: targetAudience.trim() || undefined,
      });
      setScript(generated);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (action: 'regenerate-hook' | 'make-professional' | 'shorten' | 'translate', targetLang?: string) => {
    if (!script) return;
    setIsRefining(true);
    setError(null);

    try {
      const refined = await apiRefineScript({
        script,
        action,
        targetLanguage: targetLang,
      });
      setScript(refined);
      if (action === 'translate' && targetLang) {
        setLanguage(targetLang as ScriptLanguage);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to refine script.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSwapHook = (hookText: string) => {
    if (!script) return;
    setScript({
      ...script,
      hook: hookText,
      scenes: script.scenes.map((s, idx) => (idx === 0 ? { ...s, dialogue: hookText } : s)),
    });
  };

  const handleSaveToProjects = async () => {
    if (!script) return;
    try {
      await apiSaveScript(script);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      const updated = await apiFetchUserScripts();
      setSavedScripts(updated || []);
    } catch (err: any) {
      alert(err.message || 'Failed to save script.');
    }
  };

  const handleCopyFullScript = () => {
    if (!script) return;
    const formatted = `=== ${script.title.toUpperCase()} ===
Platform: ${script.platform} | Duration: ${script.duration} | Language: ${script.language} | Tone: ${script.tone}

HOOK (0-3s):
${script.hook}

--- SCENE BREAKDOWN ---
${script.scenes
  .map(
    (s) => `[SCENE ${s.sceneNumber} (${s.timestamp})]
Camera & Visual: ${s.visualDirection}
Movement: ${s.cameraMovement}
Dialogue / VO: ${s.dialogue}
On-Screen Text: ${s.onScreenText}
Music / SFX: ${s.musicSfx}
`
  )
  .join('\n')}
CALL TO ACTION:
${script.callToAction}

CAPTION & HASHTAGS:
${script.captionAndHashtags}
`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    if (!script) return;
    const formatted = `LUXORA AI — PRODUCTION SCRIPT
TITLE: ${script.title}
PLATFORM: ${script.platform}
DURATION: ${script.duration}
LANGUAGE: ${script.language}
TONE: ${script.tone}
DATE: ${new Date(script.createdAt).toLocaleDateString()}

=========================================
HOOK (0-3 SECONDS):
=========================================
${script.hook}

ALTERNATIVE VIRAL HOOKS:
${(script.viralHooks || []).map((h, i) => `${i + 1}. ${h}`).join('\n')}

=========================================
SCENE BY SCENE PRODUCTION DIRECTIONS:
=========================================
${script.scenes
  .map(
    (s) => `SCENE ${s.sceneNumber} [${s.timestamp}]
-----------------------------------------
VISUAL DIRECTION: ${s.visualDirection}
CAMERA MOVEMENT:  ${s.cameraMovement}
AUDIO / VOICEOVER (${script.language}):
"${s.dialogue}"
ON-SCREEN TEXT:   ${s.onScreenText}
SFX & MUSIC:      ${s.musicSfx}
`
  )
  .join('\n')}

=========================================
CALL TO ACTION (CTA):
=========================================
${script.callToAction}

=========================================
CAPTION & HASHTAGS:
=========================================
${script.captionAndHashtags}
`;

    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-left space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF24] shadow-[0_0_12px_#D4FF24]"></span>
            <span className="text-xs uppercase tracking-widest text-[#D4FF24] font-mono font-semibold">
              Viral Creator Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            AI Script Studio <span className="text-xs text-blue-400 font-mono ml-2 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">Reels • Shorts • Video Ads</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9299AB] mt-1">
            Turn real estate listings, business ideas, and product launches into scene-by-scene high-converting video scripts in Hindi, Hinglish, or English.
          </p>
        </div>

        {user && (
          <div className="px-4 py-2.5 rounded-xl bg-[#0A0D14] border border-white/10 flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-gray-500 font-mono block">AI ENGINE BALANCE</span>
              <span className="text-xs font-bold text-white">
                {user.freeGenerationsRemaining > 0
                  ? `${user.freeGenerationsRemaining} Free Gens Remaining`
                  : `${user.credits} AI Credits`}
              </span>
            </div>
            <button
              onClick={onOpenPricing}
              className="px-3 py-1.5 rounded-lg bg-[#D4FF24] text-[#030407] text-xs font-bold hover:opacity-90 transition cursor-pointer"
            >
              Get Credits
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Controls vs Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Script Brief Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold font-heading text-white flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-[#D4FF24]" />
              <span>Video Brief &amp; Strategy</span>
            </h2>

            {/* Quick Inspiration Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-gray-500 block">Quick Templates</span>
              <div className="flex flex-wrap gap-1.5">
                {promptSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTopic(item.topic);
                      setPlatform(item.platform);
                      setDuration(item.duration);
                      setLanguage(item.language);
                      setTone(item.tone);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-[#101521] border border-white/10 text-gray-300 hover:text-white hover:border-[#D4FF24]/40 transition text-left cursor-pointer"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt / Topic */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Video Topic / Property Brief / Angle
              </label>
              <textarea
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 30-second Hindi reel for 1BHK flats in Vasai East starting at 38 lakhs, 5 mins from station with swimming pool and gym..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030407] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-[#D4FF24] transition resize-none leading-relaxed"
              />
            </div>

            {/* Platform & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Platform Format</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as ScriptPlatform)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/15 text-white text-xs focus:outline-none focus:border-[#D4FF24] transition"
                >
                  <option value="Instagram Reels">Instagram Reels (9:16)</option>
                  <option value="YouTube Shorts">YouTube Shorts</option>
                  <option value="TikTok">TikTok / Short Video</option>
                  <option value="Video Ad (Lead Gen)">Video Ad (Lead Gen)</option>
                  <option value="Property Walkthrough">Property Walkthrough</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Target Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/15 text-white text-xs focus:outline-none focus:border-[#D4FF24] transition"
                >
                  <option value="15s">15 Seconds (Ultra Viral)</option>
                  <option value="30s">30 Seconds (Standard Reel)</option>
                  <option value="45s">45 Seconds (Story / Property)</option>
                  <option value="60s">60 Seconds (Comprehensive Ad)</option>
                </select>
              </div>
            </div>

            {/* Language & Tone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Script Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as ScriptLanguage)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/15 text-white text-xs focus:outline-none focus:border-[#D4FF24] transition"
                >
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Hinglish">Hinglish (Hindi in Latin Script)</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tone &amp; Energy</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as ScriptTone)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/15 text-white text-xs focus:outline-none focus:border-[#D4FF24] transition"
                >
                  <option value="Luxury & Cinematic">Luxury &amp; Cinematic</option>
                  <option value="High Energy & Viral">High Energy &amp; Viral</option>
                  <option value="Direct Response & Urgency">Direct Response &amp; Urgency</option>
                  <option value="Educational & Informative">Educational &amp; Informative</option>
                </select>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., First-time home buyers, young families, working professionals in Mumbai MMR"
                className="w-full px-3.5 py-2 rounded-xl bg-[#030407] border border-white/15 text-white text-xs focus:outline-none focus:border-[#D4FF24] transition"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || isRefining}
              className="w-full py-3 px-4 rounded-xl bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,255,36,0.2)] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Scene-by-Scene Script...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Video Script</span>
                </>
              )}
            </button>
          </div>

          {/* Saved Scripts Archive Drawer */}
          {savedScripts.length > 0 && (
            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold font-heading text-white flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#D4FF24]" />
                <span>Saved Production Scripts ({savedScripts.length})</span>
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedScripts.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setScript(s)}
                    className="w-full p-2.5 rounded-xl bg-[#030407] border border-white/10 hover:border-white/25 text-left text-xs text-gray-300 hover:text-white transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold block truncate text-white">{s.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {s.platform} • {s.duration} • {s.language}
                      </span>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#D4FF24] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Generated Script Studio Workspace (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!script && !isGenerating && (
            <div className="bg-[#0A0D14] border border-white/10 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Clapperboard className="w-6 h-6 text-[#D4FF24]" />
              </div>
              <h3 className="text-lg font-bold font-heading text-white mb-2">Script Canvas Empty</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                Configure your video brief on the left and click Generate to produce a full scene-by-scene script with timestamps, camera directions, voiceovers, on-screen text, and viral hook variations.
              </p>
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4FF24]" />
                <span>Try Demo: Vasai East 1BHK Flat Reel</span>
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px] space-y-4">
              <div className="w-10 h-10 rounded-full border-2 border-[#D4FF24] border-t-transparent animate-spin mb-2" />
              <h3 className="text-base font-bold font-heading text-white">Directing AI Video Blueprint</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Structuring hook psychology, camera movements, dialogue in {language}, and timestamped scenes...
              </p>
            </div>
          )}

          {script && !isGenerating && (
            <div className="space-y-4">
              {/* Script Toolbar */}
              <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('scenes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'scenes' ? 'bg-[#D4FF24] text-[#030407]' : 'bg-white/5 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Storyboard Scenes</span>
                  </button>
                  <button
                    onClick={() => setViewMode('teleprompter')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'teleprompter' ? 'bg-[#D4FF24] text-[#030407]' : 'bg-white/5 text-gray-300 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Teleprompter Text</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyFullScript}
                    className="p-2 rounded-lg bg-[#101521] border border-white/10 hover:border-white/25 text-gray-300 hover:text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    title="Copy full script to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleExportTxt}
                    className="p-2 rounded-lg bg-[#101521] border border-white/10 hover:border-white/25 text-gray-300 hover:text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    title="Download as TXT file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export TXT</span>
                  </button>

                  <button
                    onClick={handleSaveToProjects}
                    className="p-2 rounded-lg bg-[#101521] border border-white/10 hover:border-white/25 text-[#D4FF24] text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    title="Save script to project library"
                  >
                    {savedSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span>{savedSuccess ? 'Saved!' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* AI Quick Actions Bar */}
              <div className="p-3.5 rounded-2xl bg-[#07090F] border border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-gray-500 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D4FF24]" />
                  <span>Refine:</span>
                </span>

                <button
                  onClick={() => handleRefine('regenerate-hook')}
                  disabled={isRefining}
                  className="px-2.5 py-1.5 rounded-lg bg-[#101521] border border-white/10 hover:border-[#D4FF24]/40 text-gray-300 hover:text-white text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 text-[#D4FF24] ${isRefining ? 'animate-spin' : ''}`} />
                  <span>New Hooks</span>
                </button>

                <button
                  onClick={() => handleRefine('make-professional')}
                  disabled={isRefining}
                  className="px-2.5 py-1.5 rounded-lg bg-[#101521] border border-white/10 hover:border-white/25 text-gray-300 hover:text-white text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <span>👔 Make Professional</span>
                </button>

                <button
                  onClick={() => handleRefine('shorten')}
                  disabled={isRefining}
                  className="px-2.5 py-1.5 rounded-lg bg-[#101521] border border-white/10 hover:border-white/25 text-gray-300 hover:text-white text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Shorten (15s)</span>
                </button>

                <div className="h-4 w-px bg-white/10 mx-1"></div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500 font-mono">Translate:</span>
                  <button
                    onClick={() => handleRefine('translate', 'Hindi')}
                    disabled={isRefining || script.language === 'Hindi'}
                    className="px-2 py-1 rounded bg-[#101521] border border-white/10 hover:border-white/25 text-[10px] text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    Hindi
                  </button>
                  <button
                    onClick={() => handleRefine('translate', 'Hinglish')}
                    disabled={isRefining || script.language === 'Hinglish'}
                    className="px-2 py-1 rounded bg-[#101521] border border-white/10 hover:border-white/25 text-[10px] text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    Hinglish
                  </button>
                  <button
                    onClick={() => handleRefine('translate', 'English')}
                    disabled={isRefining || script.language === 'English'}
                    className="px-2 py-1 rounded bg-[#101521] border border-white/10 hover:border-white/25 text-[10px] text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    English
                  </button>
                </div>
              </div>

              {/* View Mode 1: Scene Cards */}
              {viewMode === 'scenes' && (
                <div className="space-y-4">
                  {/* Hook Spotlight Card */}
                  <div className="bg-[#0A0D14] border border-[#D4FF24]/30 rounded-2xl p-5 shadow-[0_0_25px_rgba(212,255,36,0.06)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-[#D4FF24]/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#D4FF24]" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4FF24]">
                          Primary Hook (0-3s)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">
                        {script.platform} • {script.language}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-white leading-relaxed mb-4">
                      "{script.hook}"
                    </p>

                    {/* Viral Hook Alternatives */}
                    {script.viralHooks && script.viralHooks.length > 0 && (
                      <div className="pt-3 border-t border-white/10 space-y-2">
                        <span className="text-[10px] font-mono text-gray-400 block uppercase">
                          A/B Test Alternatives (Click to Swap):
                        </span>
                        <div className="space-y-1.5">
                          {script.viralHooks.map((altHook, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSwapHook(altHook)}
                              className="w-full text-left p-2 rounded-lg bg-[#030407] hover:bg-white/5 border border-white/5 hover:border-[#D4FF24]/30 text-xs text-gray-300 transition flex items-center justify-between group cursor-pointer"
                            >
                              <span className="truncate pr-2">"{altHook}"</span>
                              <span className="text-[10px] font-mono text-gray-500 group-hover:text-[#D4FF24] shrink-0">
                                Use Hook ▾
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scene Timeline Cards */}
                  <div className="space-y-3">
                    {script.scenes.map((scene) => (
                      <div
                        key={scene.sceneNumber}
                        className="bg-[#0A0D14] border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-white/20 transition space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-[#101521] border border-white/15 text-[11px] font-mono font-bold flex items-center justify-center text-white">
                              {scene.sceneNumber}
                            </span>
                            <span className="text-xs font-mono text-[#D4FF24] font-semibold">
                              {scene.timestamp}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 flex items-center gap-1">
                            <Camera className="w-3 h-3 text-blue-400" />
                            <span>{scene.cameraMovement}</span>
                          </span>
                        </div>

                        {/* Visual & Camera Direction */}
                        <div className="text-xs text-gray-300 bg-[#030407] p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                          <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-gray-400 text-[10px] font-mono uppercase block">
                              Visual Staging &amp; Direction:
                            </span>
                            <span>{scene.visualDirection}</span>
                          </div>
                        </div>

                        {/* Spoken Dialogue / Voiceover */}
                        <div className="text-xs sm:text-sm text-white font-medium pl-3 border-l-2 border-[#D4FF24] py-0.5 leading-relaxed">
                          <span className="text-[10px] font-mono text-gray-400 block uppercase mb-1">
                            Voiceover / Dialogue ({script.language}):
                          </span>
                          "{scene.dialogue}"
                        </div>

                        {/* On-screen text & SFX */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="bg-[#101521] px-3 py-2 rounded-lg border border-white/5 text-gray-300">
                            <span className="text-[9px] font-mono uppercase text-gray-500 block">On-Screen Caption</span>
                            <span className="font-bold text-white">{scene.onScreenText}</span>
                          </div>
                          <div className="bg-[#101521] px-3 py-2 rounded-lg border border-white/5 text-gray-300">
                            <span className="text-[9px] font-mono uppercase text-gray-500 block">Music &amp; SFX Cue</span>
                            <span className="text-gray-300">{scene.musicSfx}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Call to Action Card */}
                  <div className="bg-[#0A0D14] border border-blue-500/20 rounded-2xl p-4 sm:p-5 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">
                      Final Call to Action (CTA)
                    </span>
                    <p className="text-xs sm:text-sm text-white font-semibold">{script.callToAction}</p>
                  </div>

                  {/* Caption & Hashtags Card */}
                  <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-gray-400 block">
                        Instagram / YouTube Post Caption &amp; Tags
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(script.captionAndHashtags);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-[11px] text-[#D4FF24] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Caption</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-300 font-mono whitespace-pre-line leading-relaxed bg-[#030407] p-3 rounded-xl border border-white/5">
                      {script.captionAndHashtags}
                    </p>
                  </div>
                </div>
              )}

              {/* View Mode 2: Teleprompter Full Text View */}
              {viewMode === 'teleprompter' && (
                <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold font-heading text-white">{script.title}</h2>
                    <span className="text-xs font-mono text-[#D4FF24]">
                      {script.platform} • {script.duration} • {script.language}
                    </span>
                  </div>

                  <div className="space-y-6 font-mono text-xs sm:text-sm leading-loose">
                    <div className="p-4 rounded-xl bg-[#030407] border border-[#D4FF24]/40">
                      <span className="text-[10px] text-[#D4FF24] block uppercase mb-1">HOOK:</span>
                      <p className="text-white font-bold">{script.hook}</p>
                    </div>

                    {script.scenes.map((s) => (
                      <div key={s.sceneNumber} className="border-b border-white/5 pb-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>[SCENE {s.sceneNumber} • {s.timestamp}]</span>
                          <span>{s.cameraMovement}</span>
                        </div>
                        <p className="text-white text-sm font-semibold">{s.dialogue}</p>
                        <div className="text-[11px] text-gray-400 space-y-0.5">
                          <p>Visual: {s.visualDirection}</p>
                          <p>Text on Screen: "{s.onScreenText}"</p>
                          <p>Audio Cue: {s.musicSfx}</p>
                        </div>
                      </div>
                    ))}

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                      <span className="text-[10px] text-blue-300 block uppercase mb-1">CALL TO ACTION:</span>
                      <p className="text-white font-bold">{script.callToAction}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
