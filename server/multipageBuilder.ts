import { WebsitePlan } from '../src/types/index.js';

export function buildMultiPageProject(plan: WebsitePlan, userPrompt: string): {
  projectName: string;
  tagline: string;
  category: string;
  style: string;
  palette: any;
  files: Record<string, string>;
} {
  const isRealEstate =
    plan.category === 'Real estate' ||
    userPrompt.toLowerCase().includes('flat') ||
    userPrompt.toLowerCase().includes('real estate') ||
    userPrompt.toLowerCase().includes('vasai');

  const brand = plan.projectName || (isRealEstate ? 'Vasai Heights Residency' : 'Luxora Project');
  const accent = plan.colorPalette.accent || '#D4FF24';
  const bg = plan.colorPalette.bg || '#030407';
  const surface = plan.colorPalette.surface || '#0A0D14';
  const text = plan.colorPalette.text || '#F5F7FF';
  const textMuted = plan.colorPalette.secondaryText || '#9299AB';
  const location = plan.detectedLocation || (isRealEstate ? 'Vasai East, Mumbai MMR' : 'Metropolitan');

  if (isRealEstate) {
    return buildRealEstateMultiPageProject({
      brand,
      userPrompt,
      accent,
      bg,
      surface,
      text,
      textMuted,
      location,
      plan,
    });
  }

  return buildStandardMultiPageProject({
    brand,
    userPrompt,
    accent,
    bg,
    surface,
    text,
    textMuted,
    plan,
  });
}

function buildRealEstateMultiPageProject(opts: {
  brand: string;
  userPrompt: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  location: string;
  plan: WebsitePlan;
}) {
  const { brand, accent, bg, surface, text, textMuted, location, plan } = opts;

  const htmlContent = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand} — Luxury 1BHK Residences in ${location}</title>
  <meta name="description" content="Premium 1BHK flats in ${location} starting at ₹38 Lakhs*. Amenities: swimming pool, gym, 24/7 security. MahaRERA registered. Book a free site visit today.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brandBg: '${bg}',
            brandSurface: '${surface}',
            brandSurface2: '#101521',
            brandAccent: '${accent}',
            brandCobalt: '#1558C9',
            brandText: '${text}',
            brandMuted: '${textMuted}'
          },
          fontFamily: {
            heading: ['Space Grotesk', 'sans-serif'],
            body: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace']
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: ${bg}; color: ${text}; font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4, .font-heading { font-family: 'Space Grotesk', sans-serif; }
    .page-section { display: none; }
    .page-section.active { display: block; }
    .nav-link.active { color: ${accent}; border-bottom: 2px solid ${accent}; }
  </style>
</head>
<body class="bg-brandBg text-brandText antialiased selection:bg-brandAccent selection:text-brandBg min-h-screen flex flex-col justify-between">

  <!-- Top Announcement Bar -->
  <div class="bg-brandCobalt/20 border-b border-brandCobalt/30 py-2 px-4 text-center text-xs font-mono text-gray-300 flex items-center justify-center gap-2">
    <span class="w-2 h-2 rounded-full bg-brandAccent inline-block animate-pulse"></span>
    <span>Pre-Launch Offer: 1BHK Luxury Flats Starting @ <strong>₹38 Lakhs*</strong> in ${location} • MahaRERA: P51900034821</span>
    <button onclick="navigateTo('site-visit')" class="underline text-brandAccent ml-2 hover:opacity-80">Book Site Visit</button>
  </div>

  <!-- Header & Navigation -->
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-brandBg/90 border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
      <a href="#home" onclick="navigateTo('home'); return false;" class="flex items-center gap-2.5">
        <span class="w-3 h-3 rounded-full bg-brandAccent shadow-[0_0_12px_${accent}]"></span>
        <span class="font-heading font-bold text-lg sm:text-xl tracking-tight text-white">${brand}</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-brandMuted">
        <a href="#home" onclick="navigateTo('home'); return false;" id="nav-home" class="nav-link active py-2 hover:text-white transition">Home</a>
        <a href="#properties" onclick="navigateTo('properties'); return false;" id="nav-properties" class="nav-link py-2 hover:text-white transition">1BHK Listings</a>
        <a href="#property-details" onclick="navigateTo('property-details'); return false;" id="nav-property-details" class="nav-link py-2 hover:text-white transition">Floor Plans &amp; Specs</a>
        <a href="#site-visit" onclick="navigateTo('site-visit'); return false;" id="nav-site-visit" class="nav-link py-2 hover:text-white transition">Book Site Visit</a>
        <a href="#location" onclick="navigateTo('location'); return false;" id="nav-location" class="nav-link py-2 hover:text-white transition">Connectivity</a>
        <a href="#contact" onclick="navigateTo('contact'); return false;" id="nav-contact" class="nav-link py-2 hover:text-white transition">Contact</a>
      </nav>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <a href="https://wa.me/919876543210?text=Hi,%20I%20am%20interested%20in%20the%201BHK%20flats%20in%20Vasai%20East." target="_blank" class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.18-.544-1.895-.785-3.125-2.73-3.218-2.855-.094-.125-.769-1.025-.769-1.956 0-.931.488-1.391.662-1.581.174-.19.38-.238.508-.238.127 0 .254.001.365.006.118.005.275-.045.431.328.163.388.553 1.349.601 1.448.048.098.08.214.015.343-.064.129-.096.21-.19.32-.095.11-.2.247-.286.332-.096.096-.197.2-.085.393.111.192.495.816 1.062 1.321.73.65 1.346.852 1.538.948.192.096.304.08.417-.048.113-.129.488-.567.618-.762.13-.195.26-.163.438-.097.177.065 1.129.532 1.323.63.195.097.325.146.373.227.048.081.048.471-.096.876z"/></svg>
          <span>WhatsApp</span>
        </a>
        <button onclick="navigateTo('site-visit')" class="px-4 py-2 rounded-lg bg-brandAccent text-brandBg font-bold text-xs hover:opacity-90 transition shadow-[0_0_16px_rgba(212,255,36,0.25)] cursor-pointer">
          Schedule Visit
        </button>
      </div>
    </div>
  </header>

  <main class="flex-grow">

    <!-- ================= PAGE 1: HOME ================= -->
    <div id="page-home" class="page-section active">
      <!-- Hero Section -->
      <section class="relative pt-20 pb-24 px-4 sm:px-6 overflow-hidden border-b border-white/10">
        <div class="absolute inset-0 bg-gradient-to-b from-brandCobalt/15 via-transparent to-transparent pointer-events-none"></div>
        <div class="max-w-7xl mx-auto">
          <div class="grid lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-7 space-y-6">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-brandAccent">
                <span class="w-2 h-2 rounded-full bg-brandAccent"></span>
                <span>MAHARERA: P51900034821 • ${location.toUpperCase()}</span>
              </div>
              <h1 class="text-4xl sm:text-6xl font-bold font-heading tracking-tight leading-tight text-white">
                Ultra-Luxury <span class="text-brandAccent">1BHK Residences</span> in ${location}
              </h1>
              <p class="text-base sm:text-lg text-brandMuted max-w-xl leading-relaxed">
                Experience high-rise living with unobstructed views, designer modular kitchens, 20+ lifestyle amenities, and sub-5-minute connectivity to Vasai Railway Station.
              </p>

              <!-- Price & Inventory Metrics -->
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div class="p-3.5 rounded-xl bg-brandSurface border border-white/10">
                  <span class="text-[10px] font-mono uppercase text-gray-500 block">Starting Price</span>
                  <span class="text-lg sm:text-xl font-bold font-heading text-brandAccent">₹38 Lakhs*</span>
                  <span class="text-[10px] text-gray-400 block mt-0.5">All Inclusive</span>
                </div>
                <div class="p-3.5 rounded-xl bg-brandSurface border border-white/10">
                  <span class="text-[10px] font-mono uppercase text-gray-500 block">Carpet Area</span>
                  <span class="text-lg sm:text-xl font-bold font-heading text-white">425–515</span>
                  <span class="text-[10px] text-gray-400 block mt-0.5">Sq. Ft. Carpet</span>
                </div>
                <div class="p-3.5 rounded-xl bg-brandSurface border border-white/10">
                  <span class="text-[10px] font-mono uppercase text-gray-500 block">Possession</span>
                  <span class="text-lg sm:text-xl font-bold font-heading text-white">Dec 2026</span>
                  <span class="text-[10px] text-gray-400 block mt-0.5">RERA Timeline</span>
                </div>
              </div>

              <!-- CTA Row -->
              <div class="flex flex-wrap items-center gap-4 pt-4">
                <button onclick="navigateTo('site-visit')" class="px-7 py-3.5 rounded-xl bg-brandAccent text-brandBg font-bold text-xs hover:opacity-90 transition shadow-[0_0_20px_rgba(212,255,36,0.3)] cursor-pointer">
                  Book Free Site Visit (Free Cab)
                </button>
                <button onclick="navigateTo('properties')" class="px-7 py-3.5 rounded-xl bg-brandSurface2 border border-white/15 text-white font-semibold text-xs hover:bg-white/5 transition cursor-pointer">
                  Explore 1BHK Configurations
                </button>
              </div>
            </div>

            <!-- Hero Image Preview -->
            <div class="lg:col-span-5 relative">
              <div class="rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative aspect-[4/3] bg-brandSurface">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" alt="Luxury Real Estate" class="w-full h-full object-cover">
                <div class="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <div>
                    <span class="text-xs font-bold text-white block">Vasai Heights Tower A</span>
                    <span class="text-[10px] text-gray-400">Sample Flat Ready for Inspection</span>
                  </div>
                  <span class="px-2.5 py-1 rounded bg-brandAccent text-brandBg font-bold text-[10px]">Ready to View</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Amenities Snapshot -->
      <section class="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-xs font-mono uppercase text-brandAccent tracking-widest block mb-2">Curated Lifestyle</span>
          <h2 class="text-3xl font-bold font-heading text-white">20+ World-Class Amenities</h2>
          <p class="text-xs text-brandMuted mt-1">Designed for active living, recreation, and family security.</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-5 rounded-2xl bg-brandSurface border border-white/10">
            <span class="text-2xl mb-2 block">🏊‍♂️</span>
            <h3 class="font-bold text-sm text-white mb-1">Rooftop Pool</h3>
            <p class="text-[11px] text-brandMuted">Infinity pool with panoramic hill view and sun deck.</p>
          </div>
          <div class="p-5 rounded-2xl bg-brandSurface border border-white/10">
            <span class="text-2xl mb-2 block">🏋️</span>
            <h3 class="font-bold text-sm text-white mb-1">Fitness Club</h3>
            <p class="text-[11px] text-brandMuted">High-tech cardiovascular and resistance strength gym.</p>
          </div>
          <div class="p-5 rounded-2xl bg-brandSurface border border-white/10">
            <span class="text-2xl mb-2 block">🌳</span>
            <h3 class="font-bold text-sm text-white mb-1">Zen Garden</h3>
            <p class="text-[11px] text-brandMuted">Landscaped podium garden with senior citizen gazebo.</p>
          </div>
          <div class="p-5 rounded-2xl bg-brandSurface border border-white/10">
            <span class="text-2xl mb-2 block">⚡</span>
            <h3 class="font-bold text-sm text-white mb-1">EV Charging</h3>
            <p class="text-[11px] text-brandMuted">Dedicated 4-wheeler &amp; 2-wheeler fast EV stations.</p>
          </div>
        </div>
      </section>
    </div>

    <!-- ================= PAGE 2: PROPERTIES (1BHK CONFIGURATIONS) ================= -->
    <div id="page-properties" class="page-section">
      <section class="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span class="text-xs font-mono uppercase text-brandAccent tracking-widest block mb-2">Apartment Portfolio</span>
            <h2 class="text-3xl font-bold font-heading text-white">Available 1BHK Configurations</h2>
            <p class="text-xs text-brandMuted mt-1">Carefully planned Vastu-compliant layouts with zero space wastage.</p>
          </div>

          <!-- Quick Interactive Filter -->
          <div class="flex items-center gap-2 bg-brandSurface p-1.5 rounded-xl border border-white/10 text-xs">
            <button onclick="filterProperties('all')" class="prop-filter-btn px-3 py-1.5 rounded-lg bg-brandAccent text-brandBg font-bold">All</button>
            <button onclick="filterProperties('classic')" class="prop-filter-btn px-3 py-1.5 rounded-lg text-gray-300 hover:text-white">1BHK Classic</button>
            <button onclick="filterProperties('grande')" class="prop-filter-btn px-3 py-1.5 rounded-lg text-gray-300 hover:text-white">1BHK Grande</button>
            <button onclick="filterProperties('luxe')" class="prop-filter-btn px-3 py-1.5 rounded-lg text-gray-300 hover:text-white">1BHK Luxe</button>
          </div>
        </div>

        <!-- Property Grid -->
        <div class="grid md:grid-cols-3 gap-6">
          <!-- Card 1: 1BHK Classic -->
          <div class="property-card" data-category="classic">
            <div class="rounded-2xl bg-brandSurface border border-white/10 overflow-hidden flex flex-col justify-between hover:border-brandAccent/40 transition">
              <div class="h-52 relative overflow-hidden bg-black">
                <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" alt="1BHK Classic" class="w-full h-full object-cover">
                <span class="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-brandAccent">East Facing</span>
                <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-brandCobalt text-[10px] font-mono text-white font-bold">₹38.5 Lakhs*</span>
              </div>
              <div class="p-5 space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="font-bold font-heading text-lg text-white">1BHK Classic Suite</h3>
                  <span class="text-xs text-brandAccent font-mono">425 Sq. Ft.</span>
                </div>
                <p class="text-xs text-brandMuted">Optimal starter home featuring separate dining alcove and utility balcony.</p>
                <div class="grid grid-cols-2 gap-2 text-[11px] text-gray-400 font-mono py-2 border-t border-b border-white/5">
                  <div>Floor: 3rd–12th</div>
                  <div>Carpet: 425 sq.ft.</div>
                  <div>Balcony: 38 sq.ft.</div>
                  <div>Status: Booking Open</div>
                </div>
                <div class="flex items-center gap-2 pt-1">
                  <button onclick="navigateTo('property-details')" class="flex-1 py-2 rounded-lg bg-brandSurface2 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition">View Specs</button>
                  <button onclick="navigateTo('site-visit')" class="flex-1 py-2 rounded-lg bg-brandAccent text-brandBg text-xs font-bold hover:opacity-90 transition">Book Visit</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: 1BHK Grande -->
          <div class="property-card" data-category="grande">
            <div class="rounded-2xl bg-brandSurface border border-white/10 overflow-hidden flex flex-col justify-between hover:border-brandAccent/40 transition">
              <div class="h-52 relative overflow-hidden bg-black">
                <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" alt="1BHK Grande" class="w-full h-full object-cover">
                <span class="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-brandAccent">Garden View</span>
                <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-brandCobalt text-[10px] font-mono text-white font-bold">₹42.0 Lakhs*</span>
              </div>
              <div class="p-5 space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="font-bold font-heading text-lg text-white">1BHK Grande Luxury</h3>
                  <span class="text-xs text-brandAccent font-mono">485 Sq. Ft.</span>
                </div>
                <p class="text-xs text-brandMuted">Expansive master bedroom with walk-in closet space and dual balconies.</p>
                <div class="grid grid-cols-2 gap-2 text-[11px] text-gray-400 font-mono py-2 border-t border-b border-white/5">
                  <div>Floor: 5th–18th</div>
                  <div>Carpet: 485 sq.ft.</div>
                  <div>Balcony: 52 sq.ft.</div>
                  <div>Status: High Demand</div>
                </div>
                <div class="flex items-center gap-2 pt-1">
                  <button onclick="navigateTo('property-details')" class="flex-1 py-2 rounded-lg bg-brandSurface2 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition">View Specs</button>
                  <button onclick="navigateTo('site-visit')" class="flex-1 py-2 rounded-lg bg-brandAccent text-brandBg text-xs font-bold hover:opacity-90 transition">Book Visit</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3: 1BHK Luxe -->
          <div class="property-card" data-category="luxe">
            <div class="rounded-2xl bg-brandSurface border border-white/10 overflow-hidden flex flex-col justify-between hover:border-brandAccent/40 transition">
              <div class="h-52 relative overflow-hidden bg-black">
                <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" alt="1BHK Luxe" class="w-full h-full object-cover">
                <span class="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-brandAccent">Top Floors</span>
                <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-brandCobalt text-[10px] font-mono text-white font-bold">₹46.5 Lakhs*</span>
              </div>
              <div class="p-5 space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="font-bold font-heading text-lg text-white">1BHK Luxe Penthouse</h3>
                  <span class="text-xs text-brandAccent font-mono">515 Sq. Ft.</span>
                </div>
                <p class="text-xs text-brandMuted">Private deck with mountain skyline view and smart home automation.</p>
                <div class="grid grid-cols-2 gap-2 text-[11px] text-gray-400 font-mono py-2 border-t border-b border-white/5">
                  <div>Floor: 19th–24th</div>
                  <div>Carpet: 515 sq.ft.</div>
                  <div>Balcony: 65 sq.ft.</div>
                  <div>Status: 4 Units Left</div>
                </div>
                <div class="flex items-center gap-2 pt-1">
                  <button onclick="navigateTo('property-details')" class="flex-1 py-2 rounded-lg bg-brandSurface2 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition">View Specs</button>
                  <button onclick="navigateTo('site-visit')" class="flex-1 py-2 rounded-lg bg-brandAccent text-brandBg text-xs font-bold hover:opacity-90 transition">Book Visit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ================= PAGE 3: PROPERTY DETAILS & EMI CALCULATOR ================= -->
    <div id="page-property-details" class="page-section">
      <section class="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div class="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-mono uppercase text-brandAccent block mb-1">Detailed Specifications</span>
            <h2 class="text-3xl font-bold font-heading text-white">1BHK Grande Residence (485 Sq. Ft.)</h2>
            <p class="text-xs text-brandMuted mt-1">Tower A • Vasai East, Mumbai MMR • Starting ₹42 Lakhs*</p>
          </div>
          <button onclick="navigateTo('site-visit')" class="px-6 py-2.5 rounded-lg bg-brandAccent text-brandBg font-bold text-xs hover:opacity-90 transition self-start md:self-auto">
            Book Site Inspection
          </button>
        </div>

        <div class="grid lg:grid-cols-12 gap-8">
          <!-- Gallery & Floor Plan Tabs (7 cols) -->
          <div class="lg:col-span-7 space-y-6">
            <div class="rounded-2xl overflow-hidden border border-white/15 bg-brandSurface aspect-video relative">
              <img id="main-spec-img" src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80" alt="Apartment interior" class="w-full h-full object-cover">
            </div>

            <!-- Thumbnail Switcher -->
            <div class="grid grid-cols-4 gap-3">
              <button onclick="setSpecImage('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80')" class="rounded-xl overflow-hidden border border-white/10 hover:border-brandAccent transition aspect-video bg-black">
                <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover" alt="Living">
              </button>
              <button onclick="setSpecImage('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80')" class="rounded-xl overflow-hidden border border-white/10 hover:border-brandAccent transition aspect-video bg-black">
                <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover" alt="Kitchen">
              </button>
              <button onclick="setSpecImage('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80')" class="rounded-xl overflow-hidden border border-white/10 hover:border-brandAccent transition aspect-video bg-black">
                <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover" alt="Bathroom">
              </button>
              <button onclick="setSpecImage('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')" class="rounded-xl overflow-hidden border border-white/10 hover:border-brandAccent transition aspect-video bg-black">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover" alt="Exterior">
              </button>
            </div>

            <!-- Specifications Matrix -->
            <div class="p-6 rounded-2xl bg-brandSurface border border-white/10 space-y-4">
              <h3 class="text-sm font-bold font-heading text-white">Interior Specifications</h3>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div class="border-b border-white/5 pb-2">
                  <span class="text-gray-500 block text-[10px] font-mono">FLOORING</span>
                  <span class="text-gray-200">800×800mm Vitrified Glossy Tiles</span>
                </div>
                <div class="border-b border-white/5 pb-2">
                  <span class="text-gray-500 block text-[10px] font-mono">KITCHEN</span>
                  <span class="text-gray-200">Black Granite + SS Sink + Gas Pipeline</span>
                </div>
                <div class="border-b border-white/5 pb-2">
                  <span class="text-gray-500 block text-[10px] font-mono">BATHROOM</span>
                  <span class="text-gray-200">Jaguar / Kohler CP Fittings + Geyser Point</span>
                </div>
                <div class="border-b border-white/5 pb-2">
                  <span class="text-gray-500 block text-[10px] font-mono">WINDOWS</span>
                  <span class="text-gray-200">Sound-insulating French Sliding Glass</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Interactive EMI Calculator (5 cols) -->
          <div class="lg:col-span-5 space-y-6">
            <div class="p-6 rounded-2xl bg-brandSurface border border-white/10 space-y-6">
              <div>
                <span class="text-xs font-mono uppercase text-brandAccent block mb-1">Financial Planning</span>
                <h3 class="text-xl font-bold font-heading text-white">Interactive EMI Calculator</h3>
                <p class="text-xs text-brandMuted">Calculate your estimated monthly home loan installment.</p>
              </div>

              <!-- Loan Amount Slider -->
              <div>
                <div class="flex justify-between text-xs mb-1.5 font-mono">
                  <span class="text-gray-400">Loan Amount:</span>
                  <span id="loan-amount-disp" class="text-brandAccent font-bold">₹32,00,000</span>
                </div>
                <input id="loan-amount" type="range" min="1500000" max="6000000" step="100000" value="3200000" oninput="calculateEmi()" class="w-full accent-brandAccent cursor-pointer">
              </div>

              <!-- Interest Rate Slider -->
              <div>
                <div class="flex justify-between text-xs mb-1.5 font-mono">
                  <span class="text-gray-400">Interest Rate:</span>
                  <span id="interest-rate-disp" class="text-white font-bold">8.5%</span>
                </div>
                <input id="interest-rate" type="range" min="7" max="12" step="0.1" value="8.5" oninput="calculateEmi()" class="w-full accent-brandAccent cursor-pointer">
              </div>

              <!-- Loan Tenure Slider -->
              <div>
                <div class="flex justify-between text-xs mb-1.5 font-mono">
                  <span class="text-gray-400">Tenure (Years):</span>
                  <span id="tenure-disp" class="text-white font-bold">20 Years</span>
                </div>
                <input id="tenure" type="range" min="5" max="30" step="1" value="20" oninput="calculateEmi()" class="w-full accent-brandAccent cursor-pointer">
              </div>

              <!-- Monthly EMI Result Card -->
              <div class="p-4 rounded-xl bg-brandSurface2 border border-white/10 text-center space-y-1">
                <span class="text-[10px] font-mono text-gray-400 uppercase">Estimated Monthly Installment</span>
                <div id="emi-result" class="text-2xl sm:text-3xl font-bold font-heading text-brandAccent">₹27,769/mo</div>
                <span class="text-[10px] text-gray-500">Subject to bank qualification &amp; CIBIL score</span>
              </div>

              <button onclick="navigateTo('site-visit')" class="w-full py-3 rounded-xl bg-brandAccent text-brandBg font-bold text-xs hover:opacity-90 transition cursor-pointer">
                Check Bank Approval &amp; Subsidy
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ================= PAGE 4: BOOK SITE VISIT ================= -->
    <div id="page-site-visit" class="page-section">
      <section class="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <div class="p-6 sm:p-8 rounded-2xl bg-brandSurface border border-white/10 space-y-6">
          <div class="text-center space-y-2">
            <span class="text-xs font-mono uppercase text-brandAccent tracking-widest">VIP Experience</span>
            <h2 class="text-3xl font-bold font-heading text-white">Book a Complimentary Site Visit</h2>
            <p class="text-xs text-brandMuted max-w-md mx-auto">
              Inspect our fully-furnished 1BHK sample flat in Vasai East. Free AC cab pick-up &amp; drop available from your home or Vasai Railway Station.
            </p>
          </div>

          <form onsubmit="handleSiteVisitSubmit(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
                <input required type="text" placeholder="e.g., Rajesh Sharma" class="w-full px-3.5 py-2.5 rounded-xl bg-brandBg border border-white/10 text-white text-xs focus:outline-none focus:border-brandAccent">
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Mobile Phone (WhatsApp)</label>
                <input required type="tel" placeholder="+91 98765 43210" class="w-full px-3.5 py-2.5 rounded-xl bg-brandBg border border-white/10 text-white text-xs focus:outline-none focus:border-brandAccent">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Preferred Date</label>
                <input required type="date" value="2026-11-01" class="w-full px-3.5 py-2.5 rounded-xl bg-brandBg border border-white/10 text-white text-xs focus:outline-none focus:border-brandAccent">
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-300 mb-1.5">Time Slot</label>
                <select class="w-full px-3.5 py-2.5 rounded-xl bg-brandBg border border-white/10 text-white text-xs focus:outline-none focus:border-brandAccent">
                  <option>Morning (10:00 AM - 01:00 PM)</option>
                  <option>Afternoon (01:00 PM - 04:00 PM)</option>
                  <option>Evening (04:00 PM - 07:00 PM)</option>
                </select>
              </div>
            </div>

            <!-- Cab Pick-up toggle -->
            <div class="p-3.5 rounded-xl bg-brandSurface2 border border-white/10 flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-white block">Request Free Cab Pick-up</span>
                <span class="text-[10px] text-gray-400">Complimentary cab from your address or Vasai Station</span>
              </div>
              <input type="checkbox" checked class="w-4 h-4 accent-brandAccent cursor-pointer">
            </div>

            <button type="submit" class="w-full py-3.5 rounded-xl bg-brandAccent text-brandBg font-bold text-xs hover:opacity-90 transition cursor-pointer shadow-[0_0_20px_rgba(212,255,36,0.25)]">
              Confirm Site Visit Appointment
            </button>
          </form>

          <div id="visit-success" class="hidden p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs text-center">
            🎉 Site visit scheduled successfully! Our property manager will call you within 15 minutes to confirm cab timing.
          </div>
        </div>
      </section>
    </div>

    <!-- ================= PAGE 5: LOCATION & CONNECTIVITY ================= -->
    <div id="page-location" class="page-section">
      <section class="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div class="text-center max-w-2xl mx-auto">
          <span class="text-xs font-mono uppercase text-brandAccent tracking-widest block mb-2">Prime Strategic Address</span>
          <h2 class="text-3xl font-bold font-heading text-white">Unbeatable Connectivity in ${location}</h2>
          <p class="text-xs text-brandMuted mt-1">Direct access to Mumbai Western Railway Line, Western Express Highway &amp; Upcoming Metro.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-5 rounded-2xl bg-brandSurface border border-white/10 space-y-1">
            <span class="text-xs font-mono text-brandAccent font-bold">5 MINUTES</span>
            <h3 class="text-sm font-bold text-white">Vasai Railway Station</h3>
            <p class="text-[11px] text-brandMuted">Frequent Western Line local trains to Borivali, Andheri &amp; Churchgate.</p>
          </div>
          <div class="p-5 rounded-2xl bg-brandSurface border border-white/10 space-y-1">
            <span class="text-xs font-mono text-brandAccent font-bold">8 MINUTES</span>
            <h3 class="text-sm font-bold text-white">Western Express Highway</h3>
            <p class="text-[11px] text-brandMuted">Seamless 4-lane arterial road access toward Dahisar &amp; Mumbai.</p>
          </div>
          <div class="p-5 rounded-2xl bg-brandSurface border border-white/10 space-y-1">
            <span class="text-xs font-mono text-brandAccent font-bold">3 MINUTES</span>
            <h3 class="text-sm font-bold text-white">D-Mart &amp; Cinepolis</h3>
            <p class="text-[11px] text-brandMuted">Daily shopping, supermarkets, and entertainment right next door.</p>
          </div>
          <div class="p-5 rounded-2xl bg-brandSurface border border-white/10 space-y-1">
            <span class="text-xs font-mono text-brandAccent font-bold">4 MINUTES</span>
            <h3 class="text-sm font-bold text-white">Top Schools &amp; Hospitals</h3>
            <p class="text-[11px] text-brandMuted">Carmel Convent, St. Aloysius School, and Golden Park Multi-speciality.</p>
          </div>
        </div>
      </section>
    </div>

    <!-- ================= PAGE 6: CONTACT ================= -->
    <div id="page-contact" class="page-section">
      <section class="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-12 gap-8">
          <div class="lg:col-span-6 space-y-6">
            <div>
              <span class="text-xs font-mono uppercase text-brandAccent block mb-1">Get In Touch</span>
              <h2 class="text-3xl font-bold font-heading text-white">Sales &amp; Experience Center</h2>
              <p class="text-xs text-brandMuted mt-1">Our sales consultants are available 7 days a week from 9:30 AM to 7:30 PM.</p>
            </div>

            <div class="space-y-4 text-xs text-gray-300">
              <div class="p-4 rounded-xl bg-brandSurface border border-white/10 flex items-start gap-3">
                <span class="text-base text-brandAccent">📍</span>
                <div>
                  <strong class="text-white block mb-0.5">Site &amp; Sales Office Address</strong>
                  <span>Vasai Heights Residency, Station Road, Vasai East, Palghar, Maharashtra 401208</span>
                </div>
              </div>

              <div class="p-4 rounded-xl bg-brandSurface border border-white/10 flex items-start gap-3">
                <span class="text-base text-brandAccent">📞</span>
                <div>
                  <strong class="text-white block mb-0.5">Direct Inquiry Desk</strong>
                  <span>+91 98765 43210 / +91 98765 43211</span>
                </div>
              </div>

              <div class="p-4 rounded-xl bg-brandSurface border border-white/10 flex items-start gap-3">
                <span class="text-base text-brandAccent">🛡️</span>
                <div>
                  <strong class="text-white block mb-0.5">RERA Project Registration</strong>
                  <span>MahaRERA Registration Number: P51900034821 • Available on maharera.mahaonline.gov.in</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-brandSurface border border-white/10">
            <h3 class="text-lg font-bold font-heading text-white mb-4">Send Instant Inquiry</h3>
            <form onsubmit="handleInquirySubmit(event)" class="space-y-4 text-xs">
              <div>
                <label class="block text-gray-400 mb-1">Your Name</label>
                <input required type="text" placeholder="Name" class="w-full px-3 py-2.5 rounded-lg bg-brandBg border border-white/10 text-white focus:outline-none focus:border-brandAccent">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Phone Number</label>
                <input required type="tel" placeholder="+91" class="w-full px-3 py-2.5 rounded-lg bg-brandBg border border-white/10 text-white focus:outline-none focus:border-brandAccent">
              </div>
              <div>
                <label class="block text-gray-400 mb-1">Message or Questions</label>
                <textarea rows="3" placeholder="I would like to know pricing and floor plans for 1BHK in Vasai East..." class="w-full px-3 py-2.5 rounded-lg bg-brandBg border border-white/10 text-white focus:outline-none focus:border-brandAccent"></textarea>
              </div>
              <button type="submit" class="w-full py-3 rounded-lg bg-brandAccent text-brandBg font-bold hover:opacity-90 transition cursor-pointer">
                Submit Inquiry
              </button>
            </form>
            <div id="inquiry-success" class="hidden mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs text-center">
              Thank you! Our relationship manager will contact you shortly.
            </div>
          </div>
        </div>
      </section>
    </div>

  </main>

  <!-- Global Footer -->
  <footer class="border-t border-white/10 bg-brandSurface py-10 px-4 sm:px-6">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brandMuted">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-brandAccent inline-block"></span>
        <span class="font-heading font-bold text-white">${brand}</span>
        <span>• Luxury 1BHK Living</span>
      </div>
      <div class="font-mono text-[11px]">
        MahaRERA: P51900034821 | Generated with LUXORA AI
      </div>
    </div>
  </footer>

  <!-- Client-Side Router Script -->
  <script>
    function navigateTo(pageId) {
      document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
      const target = document.getElementById('page-' + pageId);
      if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
      const activeNav = document.getElementById('nav-' + pageId);
      if (activeNav) activeNav.classList.add('active');

      history.replaceState(null, '', '#' + pageId);
    }

    // Filter properties function
    function filterProperties(category) {
      document.querySelectorAll('.prop-filter-btn').forEach(btn => {
        btn.classList.remove('bg-brandAccent', 'text-brandBg', 'font-bold');
        btn.classList.add('text-gray-300');
      });
      event.target.classList.add('bg-brandAccent', 'text-brandBg', 'font-bold');
      event.target.classList.remove('text-gray-300');

      document.querySelectorAll('.property-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Image spec switcher
    function setSpecImage(url) {
      const img = document.getElementById('main-spec-img');
      if (img) img.src = url;
    }

    // EMI Calculator Logic
    function calculateEmi() {
      const p = parseFloat(document.getElementById('loan-amount').value);
      const r = parseFloat(document.getElementById('interest-rate').value) / (12 * 100);
      const n = parseFloat(document.getElementById('tenure').value) * 12;

      document.getElementById('loan-amount-disp').innerText = '₹' + p.toLocaleString('en-IN');
      document.getElementById('interest-rate-disp').innerText = (r * 12 * 100).toFixed(1) + '%';
      document.getElementById('tenure-disp').innerText = (n / 12) + ' Years';

      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      document.getElementById('emi-result').innerText = '₹' + Math.round(emi).toLocaleString('en-IN') + '/mo';
    }

    function handleSiteVisitSubmit(e) {
      e.preventDefault();
      document.getElementById('visit-success').classList.remove('hidden');
    }

    function handleInquirySubmit(e) {
      e.preventDefault();
      document.getElementById('inquiry-success').classList.remove('hidden');
    }

    // Handle postMessage for parent workspace editor navigation
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NAVIGATE_PAGE') {
        navigateTo(event.data.page);
      }
    });

    // Check hash on load
    window.addEventListener('DOMContentLoaded', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById('page-' + hash)) {
        navigateTo(hash);
      }
      calculateEmi();
    });
  </script>
</body>
</html>`;

  // Modular Vite + React SPA Code
  const appTsxContent = `import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import SiteVisit from './pages/SiteVisit';
import Location from './pages/Location';
import Contact from './pages/Contact';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'properties' | 'details' | 'site-visit' | 'location' | 'contact'>('home');

  return (
    <div className="min-h-screen bg-[#030407] text-[#F5F7FF] flex flex-col justify-between font-sans">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} brand="${brand}" />
      <main className="flex-grow">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
        {currentPage === 'properties' && <Properties onNavigate={setCurrentPage} />}
        {currentPage === 'details' && <PropertyDetail onNavigate={setCurrentPage} />}
        {currentPage === 'site-visit' && <SiteVisit onNavigate={setCurrentPage} />}
        {currentPage === 'location' && <Location />}
        {currentPage === 'contact' && <Contact />}
      </main>
      <Footer brand="${brand}" />
    </div>
  );
}`;

  const propertiesTsContent = `export interface PropertyFlat {
  id: string;
  name: string;
  configuration: string;
  carpetArea: number;
  price: string;
  priceNumeric: number;
  facing: string;
  possession: string;
  image: string;
  description: string;
  amenities: string[];
}

export const PROPERTIES: PropertyFlat[] = [
  {
    id: 'flat-1',
    name: '1BHK Classic Suite',
    configuration: '1BHK Classic',
    carpetArea: 425,
    price: '₹38.5 Lakhs*',
    priceNumeric: 3850000,
    facing: 'East Facing',
    possession: 'Ready Possession',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    description: 'Optimal starter home featuring separate dining alcove and utility balcony.',
    amenities: ['Modular Kitchen', 'Vitrified Tiles', 'Vaastu Compliant', 'MahaRERA: P51900034821']
  },
  {
    id: 'flat-2',
    name: '1BHK Grande Luxury',
    configuration: '1BHK Grande',
    carpetArea: 485,
    price: '₹42.0 Lakhs*',
    priceNumeric: 4200000,
    facing: 'Garden Facing',
    possession: 'Dec 2026',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    description: 'Expansive master bedroom with walk-in closet space and dual balconies.',
    amenities: ['Modular Kitchen', 'Double Balcony', 'Jaguar CP Fittings', 'Rooftop Pool Access']
  },
  {
    id: 'flat-3',
    name: '1BHK Luxe Penthouse',
    configuration: '1BHK Luxe',
    carpetArea: 515,
    price: '₹46.5 Lakhs*',
    priceNumeric: 4650000,
    facing: 'Hill Facing',
    possession: 'Dec 2026',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    description: 'Private deck with mountain skyline view and smart home automation.',
    amenities: ['Smart Automation', 'Deck Balcony', 'Clubhouse Privileges', 'Assigned EV Parking']
  }
];`;

  const emiCalculatorTsx = `import React, { useState } from 'react';

export default function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(3200000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const r = interestRate / (12 * 100);
  const n = tenureYears * 12;
  const emi = Math.round((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

  return (
    <div className="p-6 rounded-2xl bg-[#0A0D14] border border-white/10 space-y-4">
      <h3 className="text-lg font-bold font-heading text-white">Interactive EMI Calculator</h3>
      <div>
        <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
          <span>Loan Amount</span>
          <span className="text-[#D4FF24] font-bold">₹{loanAmount.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min="1500000"
          max="6000000"
          step="100000"
          value={loanAmount}
          onChange={(e) => setLoanAmount(Number(e.target.value))}
          className="w-full accent-[#D4FF24]"
        />
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
          <span>Interest Rate</span>
          <span>{interestRate}%</span>
        </div>
        <input
          type="range"
          min="7"
          max="12"
          step="0.1"
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          className="w-full accent-[#D4FF24]"
        />
      </div>
      <div className="p-4 rounded-xl bg-[#101521] text-center">
        <span className="text-[10px] text-gray-400 font-mono uppercase block">Estimated Monthly EMI</span>
        <span className="text-2xl font-bold font-heading text-[#D4FF24]">₹{emi.toLocaleString('en-IN')}/mo</span>
      </div>
    </div>
  );
}`;

  const packageJson = JSON.stringify(
    {
      name: brand.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        'lucide-react': '^0.460.0',
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.0',
        tailwindcss: '^4.0.0',
        typescript: '^5.0.0',
        vite: '^6.0.0',
      },
    },
    null,
    2
  );

  return {
    projectName: brand,
    tagline: 'Luxury 1BHK Residences & Premium Lifestyle Living',
    category: 'Real estate',
    style: 'Luxury',
    palette: plan.colorPalette,
    files: {
      'index.html': htmlContent,
      'src/App.tsx': appTsxContent,
      'src/data/properties.ts': propertiesTsContent,
      'src/components/EmiCalculator.tsx': emiCalculatorTsx,
      'package.json': packageJson,
      'README.md': `# ${brand}\n\nLuxury Real Estate Portal generated by **LUXORA AI**.\n\n- Multi-page architecture\n- Interactive EMI Calculator\n- Site Visit Booking\n- WhatsApp Integration\n- MahaRERA compliance: P51900034821\n`,
    },
  };
}

function buildStandardMultiPageProject(opts: {
  brand: string;
  userPrompt: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  plan: WebsitePlan;
}) {
  const { brand, userPrompt, accent, bg, surface, text, textMuted, plan } = opts;
  const pages = plan.pages || [
    { id: 'home', name: 'Home', path: '/' },
    { id: 'services', name: 'Services', path: '/services' },
    { id: 'portfolio', name: 'Portfolio', path: '/portfolio' },
    { id: 'pricing', name: 'Pricing', path: '/pricing' },
    { id: 'contact', name: 'Contact', path: '/contact' },
  ];

  const htmlContent = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand} — ${plan.style} ${plan.category}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brandBg: '${bg}',
            brandSurface: '${surface}',
            brandSurface2: '#101521',
            brandAccent: '${accent}',
            brandCobalt: '#1558C9',
            brandText: '${text}',
            brandMuted: '${textMuted}'
          },
          fontFamily: {
            heading: ['Space Grotesk', 'sans-serif'],
            body: ['Inter', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: ${bg}; color: ${text}; font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4, .font-heading { font-family: 'Space Grotesk', sans-serif; }
    .page-section { display: none; }
    .page-section.active { display: block; }
    .nav-link.active { color: ${accent}; border-bottom: 2px solid ${accent}; }
  </style>
</head>
<body class="bg-brandBg text-brandText antialiased selection:bg-brandAccent selection:text-brandBg min-h-screen flex flex-col justify-between">
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-brandBg/90 border-b border-white/10">
    <div class="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
      <a href="#home" onclick="navigateTo('home'); return false;" class="flex items-center gap-2 font-heading font-bold text-xl text-white">
        <span class="w-3 h-3 rounded-full bg-brandAccent"></span>
        <span>${brand}</span>
      </a>
      <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-brandMuted">
        ${pages.map((p, i) => `<a href="#${p.id}" id="nav-${p.id}" onclick="navigateTo('${p.id}'); return false;" class="nav-link ${i === 0 ? 'active' : ''} py-2 hover:text-white transition">${p.name}</a>`).join('\n        ')}
      </nav>
      <button onclick="navigateTo('contact')" class="px-4 py-2 rounded-lg bg-brandAccent text-brandBg font-bold text-xs hover:opacity-90 transition cursor-pointer">
        Get Started
      </button>
    </div>
  </header>

  <main class="flex-grow">
    <!-- Home Page -->
    <div id="page-home" class="page-section active">
      <section class="py-24 px-6 max-w-7xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-brandAccent mb-6">
          <span>${plan.style.toUpperCase()} • ${plan.category.toUpperCase()}</span>
        </div>
        <h1 class="text-5xl sm:text-7xl font-bold font-heading mb-6 tracking-tight leading-tight">
          Engineered for <span class="text-brandAccent">Exceptional Impact</span>
        </h1>
        <p class="text-base sm:text-lg text-brandMuted max-w-2xl mx-auto mb-10 leading-relaxed">
          ${userPrompt}
        </p>
        <div class="flex items-center justify-center gap-4">
          <button onclick="navigateTo('contact')" class="px-8 py-3.5 rounded-xl bg-brandAccent text-brandBg font-bold text-xs hover:opacity-90 transition">
            Initiate Engagement
          </button>
          <button onclick="navigateTo('${pages[1]?.id || 'home'}')" class="px-8 py-3.5 rounded-xl bg-brandSurface2 border border-white/15 text-white font-semibold text-xs hover:bg-white/5 transition">
            Explore ${pages[1]?.name || 'Overview'}
          </button>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="py-16 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div class="grid md:grid-cols-3 gap-6">
          <div class="p-8 rounded-2xl bg-brandSurface border border-white/10">
            <h3 class="font-bold text-lg font-heading mb-2">High-Velocity Execution</h3>
            <p class="text-xs text-brandMuted">Sub-second response times, calibrated typography, and responsive modular architecture.</p>
          </div>
          <div class="p-8 rounded-2xl bg-brandSurface border border-white/10">
            <h3 class="font-bold text-lg font-heading mb-2">Multi-Page Hierarchy</h3>
            <p class="text-xs text-brandMuted">Distinct modular pages, client-side routing, and working navigation controls.</p>
          </div>
          <div class="p-8 rounded-2xl bg-brandSurface border border-white/10">
            <h3 class="font-bold text-lg font-heading mb-2">Export Ready Source</h3>
            <p class="text-xs text-brandMuted">Complete React 19 + TypeScript + Tailwind source code download.</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Secondary Pages -->
    ${pages.filter(p => p.id !== 'home').map(p => `
    <div id="page-${p.id}" class="page-section">
      <section class="py-20 px-6 max-w-5xl mx-auto space-y-8">
        <div>
          <span class="text-xs font-mono uppercase text-brandAccent block mb-1">${plan.category}</span>
          <h2 class="text-3xl font-bold font-heading text-white">${p.name}</h2>
          <p class="text-xs text-brandMuted mt-1">${p.description || `Comprehensive ${p.name.toLowerCase()} overview and interactive components.`}</p>
        </div>
        <div class="p-8 rounded-2xl bg-brandSurface border border-white/10 space-y-6">
          <p class="text-sm text-gray-300 leading-relaxed">
            Welcome to the dedicated ${p.name} page for ${brand}. Engineered specifically to handle user interactions, data representations, and conversion flows.
          </p>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="p-5 rounded-xl bg-brandSurface2 border border-white/5">
              <span class="text-xs font-bold text-white block mb-1">Interactive Feature 1</span>
              <p class="text-[11px] text-gray-400">Streamlined workflow designed for maximum conversion and engagement.</p>
            </div>
            <div class="p-5 rounded-xl bg-brandSurface2 border border-white/5">
              <span class="text-xs font-bold text-white block mb-1">Interactive Feature 2</span>
              <p class="text-[11px] text-gray-400">Automated responsive adaptations across desktop, tablet, and mobile.</p>
            </div>
          </div>
          <button onclick="navigateTo('contact')" class="px-6 py-2.5 rounded-lg bg-brandAccent text-brandBg font-bold text-xs hover:opacity-90 transition">
            Contact ${brand} Team
          </button>
        </div>
      </section>
    </div>
    `).join('\n')}
  </main>

  <footer class="border-t border-white/10 py-10 px-6 text-center text-xs text-brandMuted">
    <p>© 2026 ${brand}. Generated by LUXORA AI.</p>
  </footer>

  <script>
    function navigateTo(pageId) {
      document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
      const target = document.getElementById('page-' + pageId);
      if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
      const activeNav = document.getElementById('nav-' + pageId);
      if (activeNav) activeNav.classList.add('active');

      history.replaceState(null, '', '#' + pageId);
    }

    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NAVIGATE_PAGE') {
        navigateTo(event.data.page);
      }
    });

    window.addEventListener('DOMContentLoaded', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById('page-' + hash)) {
        navigateTo(hash);
      }
    });
  </script>
</body>
</html>`;

  const appTsx = `import React, { useState } from 'react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-[#030407] text-[#F5F7FF] flex flex-col justify-between font-sans">
      <header className="border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <h1 className="font-heading font-bold text-xl">${brand}</h1>
        <nav className="flex gap-4 text-xs text-gray-400">
          ${pages.map(p => `<button onClick={() => setCurrentPage('${p.id}')} className="hover:text-white">${p.name}</button>`).join('\n          ')}
        </nav>
      </header>
      <main className="p-8 text-center flex-grow">
        <h2 className="text-4xl font-bold mb-4">${brand}</h2>
        <p className="text-gray-400 max-w-xl mx-auto">${userPrompt}</p>
      </main>
      <footer className="border-t border-white/10 p-6 text-center text-xs text-gray-500">
        © 2026 ${brand}.
      </footer>
    </div>
  );
}`;

  return {
    projectName: brand,
    tagline: `${plan.style} ${plan.category}`,
    category: plan.category,
    style: plan.style,
    palette: plan.colorPalette,
    files: {
      'index.html': htmlContent,
      'src/App.tsx': appTsx,
      'package.json': JSON.stringify({ name: brand.toLowerCase().replace(/[^a-z0-9]/g, '-'), private: true }, null, 2),
      'README.md': `# ${brand}\n\nBuilt with **LUXORA AI**.\n`,
    },
  };
}
