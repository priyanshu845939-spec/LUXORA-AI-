import { StarterTemplate } from '../types';
import { COLOR_PALETTES } from './palettes';

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'tpl-agency',
    title: 'Aura Studio',
    category: 'Digital marketing agency',
    style: 'Luxury',
    tagline: 'Bespoke Brand Architecture & Digital Craft',
    description: 'High-contrast editorial agency layout featuring client project showcase, capability matrix, and quote inquiry flow.',
    coverImage: '/src/assets/images/agency_template_cover_1793197349357.jpg',
    palette: COLOR_PALETTES[0],
    features: ['Project Case Studies', 'Full-screen Video Scrim', 'Inquiry Drawer', 'Dynamic Client Marquee'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AURA STUDIO — Architecture of Distinction</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            midnight: '#030407',
            cobalt: '#1558C9',
            lime: '#D4FF24',
            surface: '#0A0D14',
          },
          fontFamily: {
            heading: ['Space Grotesk', 'sans-serif'],
            body: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>
</head>
<body class="bg-midnight text-[#F5F7FF] antialiased selection:bg-lime selection:text-midnight">
  <!-- Navigation -->
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-midnight/80 border-b border-white/10">
    <div class="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
      <a href="#" class="font-heading font-bold text-xl tracking-tight flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-lime"></span>
        <span>AURA STUDIO</span>
      </a>
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        <a href="#work" class="hover:text-white transition">Selected Works</a>
        <a href="#services" class="hover:text-white transition">Disciplines</a>
        <a href="#philosophy" class="hover:text-white transition">Philosophy</a>
      </nav>
      <button onclick="document.getElementById('inquiry-modal').classList.remove('hidden')" class="px-5 py-2.5 rounded-lg bg-lime text-midnight font-semibold text-xs hover:opacity-90 transition">
        Commission Work
      </button>
    </div>
  </header>

  <!-- Hero -->
  <section class="pt-28 pb-20 px-6 max-w-7xl mx-auto text-center relative">
    <div class="max-w-4xl mx-auto">
      <span class="text-xs uppercase tracking-widest text-lime font-mono font-medium">Global Brand Architecture</span>
      <h1 class="text-5xl sm:text-7xl font-bold font-heading mt-4 mb-6 tracking-tight leading-[1.05]">
        Defining the aesthetics of modern enterprise.
      </h1>
      <p class="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
        We partner with world-class founders and heritage brands to design identities, digital experiences, and interfaces of enduring value.
      </p>
      <div class="flex items-center justify-center gap-4">
        <a href="#work" class="px-8 py-3.5 rounded-lg bg-lime text-midnight font-semibold text-sm hover:opacity-90 transition">
          View Selected Works
        </a>
        <a href="#services" class="px-8 py-3.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition">
          Our Capabilities
        </a>
      </div>
    </div>
  </section>

  <!-- Showcase Works -->
  <section id="work" class="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
    <div class="flex items-end justify-between mb-12">
      <div>
        <span class="text-xs text-lime font-mono">PORTFOLIO</span>
        <h2 class="text-3xl font-bold font-heading text-white mt-1">Featured Commissions</h2>
      </div>
      <span class="text-xs text-gray-400 font-mono">2024 — 2026</span>
    </div>

    <div class="grid md:grid-cols-2 gap-8">
      <div class="group cursor-pointer rounded-2xl overflow-hidden bg-surface border border-white/10 p-6 hover:border-white/20 transition">
        <div class="h-64 rounded-xl bg-gradient-to-tr from-cobalt/40 via-midnight to-surface border border-white/10 flex items-center justify-center text-gray-500 font-mono text-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-cobalt/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <span class="relative z-10 text-white font-semibold">Vanguard Aerospace Identity</span>
        </div>
        <div class="mt-6 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold font-heading text-white group-hover:text-lime transition">Vanguard Systems</h3>
            <p class="text-xs text-gray-400 mt-1">Brand Strategy & Global Web Platform</p>
          </div>
          <span class="text-xs font-mono text-lime">→</span>
        </div>
      </div>

      <div class="group cursor-pointer rounded-2xl overflow-hidden bg-surface border border-white/10 p-6 hover:border-white/20 transition">
        <div class="h-64 rounded-xl bg-gradient-to-tr from-midnight via-surface to-lime/10 border border-white/10 flex items-center justify-center text-gray-500 font-mono text-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-lime/10 opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <span class="relative z-10 text-white font-semibold">Krona Cloud Engine</span>
        </div>
        <div class="mt-6 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold font-heading text-white group-hover:text-lime transition">Krona Enterprise</h3>
            <p class="text-xs text-gray-400 mt-1">Design System & Product UI</p>
          </div>
          <span class="text-xs font-mono text-lime">→</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Disciplines -->
  <section id="services" class="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
    <div class="max-w-2xl mb-12">
      <span class="text-xs text-lime font-mono">CAPABILITIES</span>
      <h2 class="text-3xl font-bold font-heading text-white mt-1">Disciplines of Distinction</h2>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-8 rounded-2xl bg-surface border border-white/10">
        <span class="font-mono text-xs text-lime">01</span>
        <h3 class="text-lg font-bold font-heading text-white mt-3 mb-2">Brand Identity</h3>
        <p class="text-xs text-gray-400 leading-relaxed">Visual systems, bespoke typography, motion behaviors, and comprehensive brand books that stand the test of time.</p>
      </div>
      <div class="p-8 rounded-2xl bg-surface border border-white/10">
        <span class="font-mono text-xs text-lime">02</span>
        <h3 class="text-lg font-bold font-heading text-white mt-3 mb-2">Digital Flagships</h3>
        <p class="text-xs text-gray-400 leading-relaxed">Websites and web applications engineered for sub-second load times, smooth micro-interactions, and high conversion.</p>
      </div>
      <div class="p-8 rounded-2xl bg-surface border border-white/10">
        <span class="font-mono text-xs text-lime">03</span>
        <h3 class="text-lg font-bold font-heading text-white mt-3 mb-2">Product Architecture</h3>
        <p class="text-xs text-gray-400 leading-relaxed">End-to-end design systems, component libraries, and ergonomic SaaS platforms tailored for complex workflows.</p>
      </div>
    </div>
  </section>

  <!-- Inquiry Modal -->
  <div id="inquiry-modal" class="hidden fixed inset-0 z-50 bg-midnight/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="bg-surface border border-white/20 rounded-2xl max-w-md w-full p-6 text-left relative">
      <button onclick="document.getElementById('inquiry-modal').classList.add('hidden')" class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
      <h3 class="text-xl font-bold font-heading text-white">Start a Commission</h3>
      <p class="text-xs text-gray-400 mt-1 mb-6">Tell us about your upcoming launch or brand initiative.</p>
      <form onsubmit="event.preventDefault(); alert('Inquiry submitted. Our partners will reply within 24 hours.'); document.getElementById('inquiry-modal').classList.add('hidden')" class="space-y-4">
        <input required type="text" placeholder="Your Name" class="w-full bg-[#101521] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-lime">
        <input required type="email" placeholder="Business Email" class="w-full bg-[#101521] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-lime">
        <textarea rows="3" placeholder="Project scope, budget, and desired timeline..." class="w-full bg-[#101521] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-lime"></textarea>
        <button type="submit" class="w-full py-3 bg-lime text-midnight font-bold rounded-lg text-xs hover:opacity-90 transition">
          Submit Commission Inquiry
        </button>
      </form>
    </div>
  </div>

  <!-- Footer -->
  <footer class="py-12 border-t border-white/10 text-center text-xs text-gray-500 font-mono">
    <p>AURA STUDIO © 2026. ALL RIGHTS RESERVED.</p>
  </footer>
</body>
</html>`,
      'src/App.tsx': `export default function App() { return <div>Aura Studio</div>; }`,
      'package.json': `{"name": "aura-studio", "version": "1.0.0"}`,
      'README.md': `# Aura Studio\nPremium Agency Template built with LUXORA AI.`,
    },
  },
  {
    id: 'tpl-saas',
    title: 'Krona Cloud',
    category: 'SaaS landing page',
    style: 'Futuristic',
    tagline: 'Real-Time Edge Data Infrastructure',
    description: 'High-density developer platform with interactive latency benchmarks, code snippet tabs, and tier calculator.',
    coverImage: '/src/assets/images/saas_template_cover_1793197349422.jpg',
    palette: COLOR_PALETTES[1],
    features: ['Live Latency Benchmark', 'Multi-Language SDK Tabs', 'Volume Calculator', 'Status Indicator'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KRONA CLOUD — Distributed Global Edge Engine</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            bgDark: '#050811',
            cobalt: '#1558C9',
            lime: '#D4FF24',
            panel: '#0B1124',
          },
          fontFamily: {
            heading: ['Space Grotesk', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>
</head>
<body class="bg-bgDark text-[#F5F8FF] font-sans antialiased">
  <!-- Top Bar -->
  <header class="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 bg-bgDark/90">
    <div class="flex items-center gap-3">
      <div class="w-3 h-3 rounded-sm bg-lime"></div>
      <span class="font-heading font-bold text-lg text-white">KRONA CLOUD</span>
      <span class="text-[11px] font-mono text-lime bg-lime/10 px-2 py-0.5 rounded">v3.4 EDGE</span>
    </div>
    <div class="flex items-center gap-4">
      <button onclick="alert('API documentation will open in a new window.')" class="text-xs text-gray-400 hover:text-white font-mono">DOCS</button>
      <button onclick="alert('Account creation initialized.')" class="px-4 py-2 bg-lime text-[#050811] font-semibold text-xs rounded-lg hover:opacity-90 transition">Deploy Cluster</button>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="max-w-6xl mx-auto px-6 py-20">
    <div class="text-center max-w-3xl mx-auto mb-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-lime mb-6">
        <span class="w-1.5 h-1.5 rounded-full bg-lime animate-pulse"></span>
        310 Global PoPs • 0.8ms p99 Latency
      </div>
      <h1 class="text-4xl sm:text-6xl font-bold font-heading mb-6 tracking-tight">
        Serverless compute at the speed of light.
      </h1>
      <p class="text-gray-400 text-base sm:text-lg mb-8">
        Run stateful workflows, edge mutations, and vector embeddings in 300+ metropolitan regions with instant failover.
      </p>
      <div class="flex items-center justify-center gap-4">
        <button class="px-6 py-3 bg-lime text-[#050811] font-bold text-xs rounded-lg hover:opacity-90 transition font-mono">
          $ curl -sSL https://krona.sh | sh
        </button>
      </div>
    </div>

    <!-- Live Telemetry Grid -->
    <div class="grid md:grid-cols-3 gap-6 mb-16">
      <div class="p-6 rounded-xl bg-panel border border-white/10 font-mono">
        <span class="text-xs text-gray-400">P99 GLOBAL LATENCY</span>
        <div class="text-3xl font-bold text-lime mt-2 tabular-nums">0.82 ms</div>
        <div class="text-[11px] text-gray-500 mt-1">Measured across 50,000 requests</div>
      </div>
      <div class="p-6 rounded-xl bg-panel border border-white/10 font-mono">
        <span class="text-xs text-gray-400">THROUGHPUT CAPACITY</span>
        <div class="text-3xl font-bold text-white mt-2 tabular-nums">1.4 TB/s</div>
        <div class="text-[11px] text-gray-500 mt-1">Automatic horizontal scaling</div>
      </div>
      <div class="p-6 rounded-xl bg-panel border border-white/10 font-mono">
        <span class="text-xs text-gray-400">SLA GUARANTEE</span>
        <div class="text-3xl font-bold text-lime mt-2 tabular-nums">99.999%</div>
        <div class="text-[11px] text-gray-500 mt-1">Multi-cloud active-active routing</div>
      </div>
    </div>
  </main>
</body>
</html>`,
      'src/App.tsx': `export default function App() { return <div>Krona Cloud</div>; }`,
      'package.json': `{"name": "krona-cloud", "version": "1.0.0"}`,
      'README.md': `# Krona Cloud\nSaaS Infrastructure Template.`,
    },
  },
  {
    id: 'tpl-realestate',
    title: 'Vanguard Estates',
    category: 'Real estate',
    style: 'Luxury',
    tagline: 'Architectural Ultra-Prime Residences',
    description: 'Immersive property listings with high-res photography showcase, amenity breakdown, and private viewing booking.',
    coverImage: '/src/assets/images/realestate_template_cover_1793197349139.jpg',
    palette: COLOR_PALETTES[0],
    features: ['Property Filters', 'Interactive Floorplan View', 'Private Showing Booking', 'Specification Specs'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VANGUARD ESTATES — Architectural Residences</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#030407] text-[#F5F7FF] antialiased">
  <header class="border-b border-white/10 px-8 py-5 flex items-center justify-between">
    <div class="font-semibold text-lg tracking-widest font-mono">VANGUARD • ESTATES</div>
    <button onclick="alert('Viewing inquiry requested.')" class="px-5 py-2.5 bg-[#D4FF24] text-[#030407] font-semibold text-xs rounded-lg">Schedule Private Showing</button>
  </header>
  <main class="max-w-6xl mx-auto px-6 py-16">
    <div class="mb-12">
      <span class="text-xs uppercase text-[#D4FF24] font-mono tracking-widest">CURRENT RESIDENCE</span>
      <h1 class="text-4xl sm:text-6xl font-bold mt-2 font-serif">The Cliffside Monolith</h1>
      <p class="text-gray-400 mt-2">Cape Town, Atlantic Seaboard • $24,500,000</p>
    </div>
    <div class="rounded-2xl overflow-hidden border border-white/10 mb-12">
      <img src="/src/assets/images/realestate_template_cover_1793197349139.jpg" alt="Villa" class="w-full h-[480px] object-cover">
    </div>
    <div class="grid md:grid-cols-4 gap-6 p-6 rounded-xl bg-[#0A0D14] border border-white/10 font-mono text-center">
      <div><span class="text-xs text-gray-400">INTERIOR AREA</span><div class="text-xl font-bold text-white mt-1">1,240 m²</div></div>
      <div><span class="text-xs text-gray-400">BEDROOMS</span><div class="text-xl font-bold text-white mt-1">6 En-Suite</div></div>
      <div><span class="text-xs text-gray-400">ELEVATION</span><div class="text-xl font-bold text-white mt-1">180m Above Sea</div></div>
      <div><span class="text-xs text-gray-400">GARAGE</span><div class="text-xl font-bold text-[#D4FF24] mt-1">8 Vehicles</div></div>
    </div>
  </main>
</body>
</html>`,
      'src/App.tsx': `export default function App() { return <div>Vanguard Estates</div>; }`,
      'package.json': `{"name": "vanguard-estates", "version": "1.0.0"}`,
      'README.md': `# Vanguard Estates\nLuxury Real Estate Template.`,
    },
  },
  {
    id: 'tpl-portfolio',
    title: 'Elena Vance',
    category: 'Portfolio',
    style: 'Editorial',
    tagline: 'Principal Spatial & Digital Product Designer',
    description: 'Minimalist creative personal portfolio highlighting design leadership, project retrospectives, and speaking history.',
    coverImage: '/src/assets/images/agency_template_cover_1793197349357.jpg',
    palette: COLOR_PALETTES[2],
    features: ['Timeline Career Log', 'Case Study Previews', 'Writings Index', 'One-Click Contact'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Elena Vance — Principal Spatial Designer</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090A0D] text-[#F4F5F7] p-8 max-w-4xl mx-auto font-sans">
  <header class="flex justify-between items-center py-6 border-b border-white/10 mb-12">
    <div class="font-bold text-lg">ELENA VANCE</div>
    <a href="mailto:elena@example.com" class="text-xs font-mono underline hover:text-[#D4FF24]">Get in touch</a>
  </header>
  <h1 class="text-4xl font-bold mb-4">Designing interfaces for physical & spatial environments.</h1>
  <p class="text-gray-400 leading-relaxed mb-12 text-sm">Formerly Staff Designer at Apple Special Projects & Humane. Currently consulting on autonomous spatial computing systems.</p>
</body>
</html>`,
      'src/App.tsx': `export default function App() { return <div>Elena Vance</div>; }`,
      'package.json': `{"name": "elena-vance-portfolio", "version": "1.0.0"}`,
      'README.md': `# Elena Vance Portfolio`,
    },
  },
  {
    id: 'tpl-ecommerce',
    title: 'Luminaire Objects',
    category: 'E-commerce storefront',
    style: 'Minimal',
    tagline: 'Sculptural Lighting & Architectural Objects',
    description: 'Editorial boutique storefront with product catalog, variant selector, and interactive shopping cart drawer.',
    coverImage: '/src/assets/images/hero_builder_preview_1793197348154.jpg',
    palette: COLOR_PALETTES[0],
    features: ['Interactive Cart Drawer', 'Product Grid with Filtering', 'Material Selector', 'Checkout Flow Demo'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LUMINAIRE OBJECTS — Architectural Lighting</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#030407] text-[#F5F7FF] antialiased">
  <header class="px-8 py-5 border-b border-white/10 flex justify-between items-center">
    <div class="font-bold tracking-widest text-lg">LUMINAIRE</div>
    <button onclick="alert('Shopping bag: 2 items ($1,850)')" class="text-xs px-3 py-1.5 bg-[#D4FF24] text-black font-semibold rounded">Bag (2)</button>
  </header>
  <main class="max-w-6xl mx-auto px-6 py-12">
    <h1 class="text-3xl font-bold mb-8">Collection 04 • Cast Bronze & Alabaster</h1>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="p-6 rounded-xl bg-[#0A0D14] border border-white/10">
        <div class="h-48 rounded bg-white/5 mb-4 flex items-center justify-center font-mono text-xs text-gray-500">Pendant 01</div>
        <h3 class="font-bold text-white">Orbit Cast Pendant</h3>
        <p class="text-xs text-gray-400 mt-1 mb-4">$890 USD</p>
        <button onclick="alert('Added Orbit Cast Pendant to bag')" class="w-full py-2 bg-white/10 hover:bg-[#D4FF24] hover:text-black transition rounded text-xs font-semibold">Add to Bag</button>
      </div>
      <div class="p-6 rounded-xl bg-[#0A0D14] border border-white/10">
        <div class="h-48 rounded bg-white/5 mb-4 flex items-center justify-center font-mono text-xs text-gray-500">Sconce 02</div>
        <h3 class="font-bold text-white">Travertine Wall Sconce</h3>
        <p class="text-xs text-gray-400 mt-1 mb-4">$960 USD</p>
        <button onclick="alert('Added Travertine Sconce to bag')" class="w-full py-2 bg-white/10 hover:bg-[#D4FF24] hover:text-black transition rounded text-xs font-semibold">Add to Bag</button>
      </div>
      <div class="p-6 rounded-xl bg-[#0A0D14] border border-white/10">
        <div class="h-48 rounded bg-white/5 mb-4 flex items-center justify-center font-mono text-xs text-gray-500">Table Lamp 03</div>
        <h3 class="font-bold text-white">Monolith Obsidian Lamp</h3>
        <p class="text-xs text-gray-400 mt-1 mb-4">$1,250 USD</p>
        <button onclick="alert('Added Monolith Obsidian Lamp to bag')" class="w-full py-2 bg-white/10 hover:bg-[#D4FF24] hover:text-black transition rounded text-xs font-semibold">Add to Bag</button>
      </div>
    </div>
  </main>
</body>
</html>`,
      'src/App.tsx': `export default function App() { return <div>Luminaire</div>; }`,
      'package.json': `{"name": "luminaire-objects", "version": "1.0.0"}`,
      'README.md': `# Luminaire Storefront`,
    },
  },
  {
    id: 'tpl-restaurant',
    title: 'Nox Dining & Cellar',
    category: 'Restaurant',
    style: 'Luxury',
    tagline: 'Nocturnal Tasting Experience & Rare Vintages',
    description: 'Sophisticated fine dining concept with multi-course tasting menu, wine pairings, and reservation booking modal.',
    coverImage: '/src/assets/images/realestate_template_cover_1793197349139.jpg',
    palette: COLOR_PALETTES[4],
    features: ['Seasonal Tasting Menu', 'Wine Cellar Pairings', 'Reservation Booking Engine', 'Private Dining Inquiry'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NOX — Tasting Menu & Cellar</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#070503] text-[#FFFBEB] antialiased p-8 max-w-4xl mx-auto">
  <header class="py-6 border-b border-white/10 flex justify-between items-center mb-12">
    <div class="text-xl font-serif font-bold tracking-widest text-[#F59E0B]">N O X</div>
    <button onclick="alert('Reservation calendar opened.')" class="px-5 py-2 bg-[#F59E0B] text-black font-semibold text-xs rounded">Reserve a Table</button>
  </header>
  <div class="text-center my-16">
    <span class="text-xs uppercase tracking-widest text-[#F59E0B] font-mono">AUTUMN TASTING 2026</span>
    <h1 class="text-5xl font-serif mt-3 mb-6">Twelve Courses of Twilight</h1>
    <p class="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">Each evening, Chef Marcus Vance presents twelve interpretations of local foraged botanicals, cured linefish, and heritage grains.</p>
  </div>
</body>
</html>`,
      'src/App.tsx': `export default function App() { return <div>Nox Dining</div>; }`,
      'package.json': `{"name": "nox-dining", "version": "1.0.0"}`,
      'README.md': `# Nox Dining Template`,
    },
  },
];
