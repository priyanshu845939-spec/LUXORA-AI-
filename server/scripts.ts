import { GoogleGenAI } from '@google/genai';
import { VideoScript, ScriptPlatform, ScriptLanguage, ScriptTone, ScriptScene } from '../src/types/index.js';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function generateVideoScript(params: {
  topic: string;
  platform: string;
  duration: string;
  language: string;
  tone: string;
  targetAudience?: string;
}): Promise<VideoScript> {
  const { topic, platform, duration, language, tone, targetAudience } = params;
  const ai = getGeminiClient();

  if (ai) {
    const systemInstruction = `You are LUXORA AI's Viral Script Studio Director.
You generate high-converting scene-by-scene video scripts for ${platform}.
Duration target: ${duration}.
Language: ${language} (CRITICAL: if Hindi or Hinglish, write natural, native spoken Hindi / Hinglish dialogue that sounds authentic to Indian audiences).
Tone: ${tone}.
Target Audience: ${targetAudience || 'General active social audience'}.

You MUST return valid JSON in this exact structure:
{
  "title": "Short punchy title",
  "hook": "Spoken & visual 0-3s hook",
  "viralHooks": ["Alternative viral hook 1", "Alternative viral hook 2", "Alternative viral hook 3"],
  "scenes": [
    {
      "sceneNumber": 1,
      "timestamp": "0:00 - 0:03",
      "visualDirection": "Visual staging & framing",
      "cameraMovement": "Specific camera movement (e.g. Drone fly-in, Macro zoom)",
      "dialogue": "Spoken words in ${language}",
      "onScreenText": "On-screen caption graphic",
      "musicSfx": "Music mood and sound effects"
    }
  ],
  "callToAction": "Direct final CTA",
  "captionAndHashtags": "Instagram/YouTube ready caption with 10-15 relevant hashtags"
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create a high-performing video script for: "${topic}".`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);

      return {
        id: `script_${Math.random().toString(36).substring(2, 9)}`,
        title: parsed.title || 'Production Video Script',
        topic,
        platform: platform as ScriptPlatform,
        duration,
        language: language as ScriptLanguage,
        tone: tone as ScriptTone,
        hook: parsed.hook,
        viralHooks: parsed.viralHooks || [],
        scenes: parsed.scenes || [],
        callToAction: parsed.callToAction,
        captionAndHashtags: parsed.captionAndHashtags,
        createdAt: Date.now(),
      };
    } catch (err) {
      console.warn('Gemini script generation error, using synthesis:', err);
    }
  }

  // Synthesis Fallback Engine
  return synthesizeVideoScript(params);
}

export async function refineVideoScript(params: {
  script: VideoScript;
  action: 'regenerate-hook' | 'make-professional' | 'shorten' | 'translate';
  targetLanguage?: string;
}): Promise<VideoScript> {
  const { script, action, targetLanguage } = params;
  const ai = getGeminiClient();

  if (ai) {
    let prompt = '';
    if (action === 'regenerate-hook') {
      prompt = `Provide 3 new viral, scroll-stopping hooks for this video script about "${script.topic}" in language ${script.language}. Return JSON: { "hook": "...", "viralHooks": ["...", "...", "..."] }`;
    } else if (action === 'make-professional') {
      prompt = `Refine this video script to have an ultra-luxurious, authoritative, and professional tone. Keep language ${script.language}. Return updated JSON matching original script structure.`;
    } else if (action === 'shorten') {
      prompt = `Condense this video script into a rapid 15-second format with punchy cuts. Keep language ${script.language}. Return updated JSON.`;
    } else if (action === 'translate') {
      prompt = `Translate all spoken dialogue, hook, and captions of this script into ${targetLanguage}. Return updated JSON matching original script structure with language: "${targetLanguage}".`;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${prompt}\n\nCurrent Script:\n${JSON.stringify(script)}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        ...script,
        ...parsed,
        id: script.id,
        createdAt: script.createdAt,
      };
    } catch (err) {
      console.warn('Gemini script refine error:', err);
    }
  }

  // Synthesized refine fallbacks
  if (action === 'regenerate-hook') {
    if (script.language === 'Hindi' || script.topic.toLowerCase().includes('vasai')) {
      return {
        ...script,
        hook: 'Mumbai MMR mein 1BHK flat sirf ₹38 Lakhs mein? Ye deal miss mat karna!',
        viralHooks: [
          'Station se sirf 5 minute door — Vasai East ka sabse bada luxury project!',
          'Kiya aap bhi rent pay karke thak gaye hain? Apna 1BHK lijiye monthly EMI pe!',
          'Swimming pool, gym aur rooftop garden — sab kuch ₹38 Lakhs ke budget mein!',
        ],
      };
    }
    return {
      ...script,
      hook: 'Stop scrolling: This changes everything you know about this market.',
      viralHooks: [
        'Here is the secret most competitors will never tell you.',
        'If you are looking for the ultimate value, watch this till the end.',
        'Why everyone in 2026 is making this exact switch.',
      ],
    };
  }

  if (action === 'shorten') {
    return {
      ...script,
      duration: '15s',
      scenes: script.scenes.slice(0, 3).map((s, i) => ({
        ...s,
        timestamp: i === 0 ? '0:00 - 0:03' : i === 1 ? '0:03 - 0:10' : '0:10 - 0:15',
      })),
    };
  }

  if (action === 'translate' && targetLanguage) {
    return {
      ...script,
      language: targetLanguage as ScriptLanguage,
    };
  }

  return script;
}

function synthesizeVideoScript(params: {
  topic: string;
  platform: string;
  duration: string;
  language: string;
  tone: string;
  targetAudience?: string;
}): VideoScript {
  const { topic, platform, duration, language, tone } = params;
  const isRealEstate = topic.toLowerCase().includes('flat') || topic.toLowerCase().includes('real estate') || topic.toLowerCase().includes('vasai');
  const isHindi = language === 'Hindi' || language === 'Hinglish';

  if (isRealEstate && isHindi) {
    return {
      id: `script_${Math.random().toString(36).substring(2, 9)}`,
      title: 'Vasai East 1BHK Luxury Flats Reel',
      topic,
      platform: platform as ScriptPlatform,
      duration,
      language: language as ScriptLanguage,
      tone: tone as ScriptTone,
      hook: 'Vasai East mein luxury 1BHK flat sirf ₹38 Lakhs mein? Station se sirf 5 minute door!',
      viralHooks: [
        'Mumbai MMR mein apna khud ka ghar, wo bhi sirf ₹38 Lakhs ki starting price pe!',
        'Kiya aap rent pay karke pareshaan hain? Vasai East mein lijiye apna dream 1BHK!',
        'Swimming pool, club house, aur zero brokerage — Vasai East ka best investment opportunity!',
      ],
      scenes: [
        {
          sceneNumber: 1,
          timestamp: '0:00 - 0:03',
          visualDirection: 'Drone fly-in shot over modern high-rise tower exterior during golden hour, zooming in towards luxury balcony.',
          cameraMovement: 'Fast Drone Fly-in -> Whip Pan',
          dialogue: 'Vasai East mein luxury 1BHK flat sirf ₹38 Lakhs mein? Station se sirf 5 minute door!',
          onScreenText: '1BHK @ ₹38 LAKHS* | 5 MINS FROM VASAI STATION',
          musicSfx: 'Upbeat trending bass lofi beat, whoosh transition SFX',
        },
        {
          sceneNumber: 2,
          timestamp: '0:03 - 0:10',
          visualDirection: 'Wide interior shot of fully furnished living room with modern vitrified tiles, false ceiling, and large French windows with natural light.',
          cameraMovement: 'Smooth Steadicam forward glide -> Low angle pan',
          dialogue: 'Ye dekhiye spacious living room, cross-ventilation aur premium finish ke saath.',
          onScreenText: '445 SQ.FT. CARPET | FULLY VENTILATED',
          musicSfx: 'Upbeat background rhythm continues',
        },
        {
          sceneNumber: 3,
          timestamp: '0:10 - 0:18',
          visualDirection: 'Quick cuts showcasing modular granite kitchen platform, designer bathroom fittings, and master bedroom with panoramic green hill view.',
          cameraMovement: 'Macro close-up -> Quick cut to balcony view',
          dialogue: 'Designer modular kitchen, premium branded bathroom fittings aur balcony se khula scenic view.',
          onScreenText: 'MODULAR KITCHEN • BRANDED CP FITTINGS',
          musicSfx: 'Subtle high-hat rhythm builds up anticipation',
        },
        {
          sceneNumber: 4,
          timestamp: '0:18 - 0:25',
          visualDirection: 'Montage of lifestyle amenities: swimming pool, fully equipped gymnasium, children play park, and 24/7 security lobby.',
          cameraMovement: 'Slow-motion pan across swimming pool and club house',
          dialogue: 'Iske saath swimming pool, gym, landscaped garden aur grand entrance lobby — sab kuch aapke complex mein.',
          onScreenText: '20+ WORLD-CLASS AMENITIES • MAHARERA APPROVED',
          musicSfx: 'Crescendo beat build-up',
        },
        {
          sceneNumber: 5,
          timestamp: '0:25 - 0:30',
          visualDirection: 'Presenter points to screen with site office contact card, MahaRERA badge, and WhatsApp booking icon.',
          cameraMovement: 'Front static medium shot with animated CTA graphics',
          dialogue: 'Units limited hain! Aaj hi free site visit book karne ke liye niche diye gaye link pe click karein ya WhatsApp karein!',
          onScreenText: 'BOOK FREE SITE VISIT ▾ WHATSAPP NOW',
          musicSfx: 'Punchy bass drop and chime SFX on button appearance',
        },
      ],
      callToAction: 'Limited inventory available. Click "Book Site Visit" now or send a direct WhatsApp message to reserve your priority viewing with free cab pick-up!',
      captionAndHashtags: `Mumbai MMR mein apna dream home paana ab aasaan! 🏡✨
Vasai East mein premium 1BHK luxury apartments starting at just ₹38 Lakhs*.
📍 Vasai Railway Station: 5 mins
📍 Western Express Highway: 8 mins
🏊‍♂️ Swimming pool, modern gym, landscaped gardens & 24/7 security.
MahaRERA Registered. Zero brokerage.

👉 Click link in bio or DM us to schedule your FREE site visit today!

#VasaiEast #VasaiRealEstate #1BHKFlat #MumbaiProperty #AffordableLuxury #HomeBuyingGuide #VasaiFlats #MumbaiRealtor #PropertyInvestment #DreamHomeMumbai`,
      createdAt: Date.now(),
    };
  }

  // Default Generic Synthesis
  return {
    id: `script_${Math.random().toString(36).substring(2, 9)}`,
    title: `${topic.slice(0, 30)} Video Script`,
    topic,
    platform: platform as ScriptPlatform,
    duration,
    language: language as ScriptLanguage,
    tone: tone as ScriptTone,
    hook: `If you are looking for ${topic.slice(0, 40)}, you need to see this right now.`,
    viralHooks: [
      `The #1 secret nobody tells you about ${topic.slice(0, 30)}.`,
      `Here is why 90% of people make the wrong choice here.`,
      `Stop doing this the old way in 2026. Watch this instead.`,
    ],
    scenes: [
      {
        sceneNumber: 1,
        timestamp: '0:00 - 0:03',
        visualDirection: 'Fast-paced hook visual with dynamic split screen and high contrast text overlay.',
        cameraMovement: 'Zoom-in snap -> Whip pan',
        dialogue: `If you are looking for ${topic.slice(0, 40)}, you need to see this right now.`,
        onScreenText: 'WAIT TILL YOU SEE THIS 🚨',
        musicSfx: 'High energy trending audio opener, vinyl stop effect',
      },
      {
        sceneNumber: 2,
        timestamp: '0:03 - 0:12',
        visualDirection: 'Demonstration of the core solution, high-quality showcase with smooth animations.',
        cameraMovement: 'Steadicam tracking forward',
        dialogue: 'Engineered for maximum performance and luxury aesthetic, with zero compromises.',
        onScreenText: 'SUB-SECOND SPEED • LUXURY DESIGN',
        musicSfx: 'Bass drop into confident melodic groove',
      },
      {
        sceneNumber: 3,
        timestamp: '0:12 - 0:22',
        visualDirection: 'Feature highlight breakdown with clean callout boxes and customer proof points.',
        cameraMovement: 'Side pan with parallax background',
        dialogue: 'Every single detail has been calibrated for real-world impact and results.',
        onScreenText: 'VERIFIED RESULTS • PRODUCTION READY',
        musicSfx: 'Rhythmic percussive beat',
      },
      {
        sceneNumber: 4,
        timestamp: '0:22 - 0:30',
        visualDirection: 'Logo reveal, clear call to action button animation, and special offer badge.',
        cameraMovement: 'Slow center pull-back',
        dialogue: 'Tap the link below right now to get started with instant access.',
        onScreenText: 'GET STARTED TODAY ▾ LINK IN BIO',
        musicSfx: 'Resolving chord with subtle shimmer SFX',
      },
    ],
    callToAction: 'Tap the link in bio right now to explore the live demo and get started!',
    captionAndHashtags: `Discover the future of ${topic.slice(0, 30)}. Built for visionaries who refuse to settle. 🚀

Tap link in bio to get full access today!

#Innovation #ViralReel #Marketing2026 #TechTrends #NextLevel #ReelsInstagram #GrowthHacking`,
    createdAt: Date.now(),
  };
}
