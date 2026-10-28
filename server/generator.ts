import { GoogleGenAI } from '@google/genai';
import { WebsitePlan, PlannedPage, ColorPalette, WebsiteCategory, VisualStyle } from '../src/types/index.js';

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

export async function planWebsitePrompt(params: {
  prompt: string;
  category: string;
  style: string;
  businessName?: string;
  location?: string;
}): Promise<WebsitePlan> {
  const { prompt, category, style, businessName, location } = params;
  const ai = getGeminiClient();

  if (ai) {
    const systemInstruction = `You are LUXORA AI's Master Website Architect.
Analyze the user's prompt and extract structured planning data for a multi-page website.
Extract:
1. detectedNiche: specific industry/niche (e.g., "Real Estate / Luxury Residential", "Digital Marketing Agency", "Specialty Coffee Shop").
2. detectedLocation: specific location if mentioned in the prompt (e.g. "Vasai East, Mumbai MMR", "SoHo, New York").
3. detectedFocus: core product or property focus (e.g., "1BHK Luxury Flats", "Edge Database Platform").
4. pages: array of 4-6 dedicated pages for this business (e.g., for real estate: Home, Properties, Property Details, Book Site Visit, Location & Connectivity, Contact).
5. suggestedFeatures: 4-6 key interactive features (e.g., "EMI Calculator", "Site Visit Scheduler Modal", "Direct WhatsApp Chat Link", "Filterable Floor Plans").

Return JSON:
{
  "projectName": "Title",
  "tagline": "Subtitle",
  "category": "${category}",
  "style": "${style}",
  "detectedNiche": "...",
  "detectedLocation": "...",
  "detectedFocus": "...",
  "pages": [
    { "id": "home", "name": "Home", "path": "/", "description": "...", "components": ["..."] }
  ],
  "suggestedFeatures": ["..."]
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze and plan a multi-page website for: "${prompt}".`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        projectName: parsed.projectName || businessName || deriveTitle(prompt, category),
        tagline: parsed.tagline || `${style} ${category}`,
        category: category as WebsiteCategory,
        style: style as VisualStyle,
        detectedNiche: parsed.detectedNiche || category,
        detectedLocation: parsed.detectedLocation || location || extractLocationFromPrompt(prompt),
        detectedFocus: parsed.detectedFocus || 'Core Offering',
        pages: parsed.pages || defaultPagesForCategory(category, prompt),
        suggestedFeatures: parsed.suggestedFeatures || defaultFeaturesForCategory(category),
        colorPalette: {
          id: 'luxora-midnight',
          name: 'Luxora Midnight',
          bg: '#030407',
          surface: '#0A0D14',
          accent: '#D4FF24',
          text: '#F5F7FF',
          secondaryText: '#9299AB',
        },
      };
    } catch (err) {
      console.warn('Gemini website planning error, using intelligent parser:', err);
    }
  }

  // Intelligent Rule-Based Planning Engine
  return synthesizeWebsitePlan(params);
}

function extractLocationFromPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('vasai')) return 'Vasai East, Mumbai MMR';
  if (lower.includes('mumbai')) return 'Mumbai, Maharashtra';
  if (lower.includes('pune')) return 'Pune, Maharashtra';
  if (lower.includes('bangalore') || lower.includes('bengaluru')) return 'Bengaluru, Karnataka';
  if (lower.includes('delhi') || lower.includes('gurgaon') || lower.includes('noida')) return 'Delhi NCR';
  return '';
}

function synthesizeWebsitePlan(params: {
  prompt: string;
  category: string;
  style: string;
  businessName?: string;
  location?: string;
}): WebsitePlan {
  const { prompt, category, style, businessName, location } = params;
  const loc = location || extractLocationFromPrompt(prompt);
  const isRealEstate = category === 'Real estate' || prompt.toLowerCase().includes('flat') || prompt.toLowerCase().includes('real estate') || prompt.toLowerCase().includes('vasai');

  if (isRealEstate) {
    const brand = businessName || (loc.includes('Vasai') ? 'Vasai Heights Residency' : 'Aura Luxury Residences');
    return {
      projectName: brand,
      tagline: 'Luxury 1BHK Residences & Premium Lifestyle Living',
      category: 'Real estate',
      style: style as VisualStyle,
      detectedNiche: 'Real Estate / Residential Property',
      detectedLocation: loc || 'Vasai East, Mumbai MMR',
      detectedFocus: '1BHK Luxury Flats starting at ₹38 Lakhs*',
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          description: 'Atmospheric hero, location connectivity highlights, featured configurations, and quick site visit booking.',
          components: ['HeroBanner', 'QuickFilterBar', 'FeaturedFlats', 'AmenitiesGrid', 'LocationSnapshot'],
        },
        {
          id: 'properties',
          name: 'Properties',
          path: '/properties',
          description: 'Filterable property catalog with BHK types, carpet areas, all-inclusive pricing, and specifications.',
          components: ['PropertyFilter', 'PropertyCardGrid', 'ConfigurationCompare'],
        },
        {
          id: 'property-details',
          name: 'Property Details',
          path: '/property-details',
          description: 'Deep dive into 1BHK Grande with floor plan tabs, specifications, and interactive EMI calculator.',
          components: ['FloorPlanViewer', 'PhotoGallery', 'SpecificationsTable', 'EmiCalculatorWidget'],
        },
        {
          id: 'site-visit',
          name: 'Book Site Visit',
          path: '/site-visit',
          description: 'Interactive site-visit scheduler with calendar date picker, time slots, and complimentary pick-up request.',
          components: ['VisitSchedulerForm', 'CabPickUpService', 'ConfirmationModal'],
        },
        {
          id: 'location',
          name: 'Location & Connectivity',
          path: '/location',
          description: 'Proximity map to Vasai Railway Station, Western Express Highway, schools, hospitals, and shopping.',
          components: ['ProximityMatrix', 'InfrastructureRoadmap', 'NeighborhoodHighlights'],
        },
        {
          id: 'contact',
          name: 'Contact & Sales Office',
          path: '/contact',
          description: 'Direct sales desk, WhatsApp hotline, callback request form, and MahaRERA registration details.',
          components: ['ContactForm', 'WhatsAppDirectButton', 'SalesOfficeMap', 'ReraComplianceBadge'],
        },
      ],
      suggestedFeatures: [
        'Interactive EMI Calculator (Loan Amount, Interest & Tenure)',
        'Schedule Free Site Visit with Cab Pick-up',
        'Direct WhatsApp Chat Integration with Pre-filled Inquiries',
        'Filter by Carpet Area, Budget & Possession Timeline',
        'Floor Plan Switcher (2D Architectural & 3D Isometric)',
        'MahaRERA Verified Project Status',
      ],
      colorPalette: {
        id: 'luxora-midnight',
        name: 'Luxora Midnight',
        bg: '#030407',
        surface: '#0A0D14',
        accent: '#D4FF24',
        text: '#F5F7FF',
        secondaryText: '#9299AB',
      },
    };
  }

  // Generic category plan
  const brand = businessName || deriveTitle(prompt, category);
  return {
    projectName: brand,
    tagline: `${style} ${category}`,
    category: category as WebsiteCategory,
    style: style as VisualStyle,
    detectedNiche: category,
    detectedLocation: loc,
    detectedFocus: prompt.slice(0, 40),
    pages: defaultPagesForCategory(category, prompt),
    suggestedFeatures: defaultFeaturesForCategory(category),
    colorPalette: {
      id: 'luxora-midnight',
      name: 'Luxora Midnight',
      bg: '#030407',
      surface: '#0A0D14',
      accent: '#D4FF24',
      text: '#F5F7FF',
      secondaryText: '#9299AB',
    },
  };
}

function defaultPagesForCategory(category: string, prompt: string): PlannedPage[] {
  if (category === 'Digital marketing agency') {
    return [
      { id: 'home', name: 'Home', path: '/', description: 'Brand positioning, client proof, metrics, and hero showcase.', components: ['Hero', 'ClientLogos', 'ServicesSummary', 'Metrics'] },
      { id: 'services', name: 'Services', path: '/services', description: 'Detailed capability breakdown: SEO, Growth, Branding, Performance Media.', components: ['ServiceMatrix', 'DeliverablesList'] },
      { id: 'portfolio', name: 'Portfolio', path: '/portfolio', description: 'Filterable case studies with ROI benchmarks and visual deliverables.', components: ['CaseStudyGrid', 'ResultsBar'] },
      { id: 'pricing', name: 'Pricing', path: '/pricing', description: 'Transparent monthly retainers and dedicated sprint packages.', components: ['PricingCards', 'ComparisonTable'] },
      { id: 'contact', name: 'Contact', path: '/contact', description: 'Project inquiry form and consultation calendar.', components: ['ConsultationForm', 'OfficeLocations'] },
    ];
  }

  if (category === 'E-commerce storefront') {
    return [
      { id: 'home', name: 'Home', path: '/', description: 'Featured collections, new arrivals hero, brand values.', components: ['Hero', 'FeaturedProducts', 'CategoryGrid'] },
      { id: 'catalog', name: 'Catalog', path: '/catalog', description: 'Product listings with multi-filter and sort controls.', components: ['FilterSidebar', 'ProductGrid'] },
      { id: 'details', name: 'Product Details', path: '/details', description: 'Photo carousel, variant selectors, add-to-cart.', components: ['Gallery', 'VariantSelector', 'Reviews'] },
      { id: 'cart', name: 'Cart & Checkout', path: '/cart', description: 'Itemized bag summary, discount code, mock payment flow.', components: ['CartItems', 'OrderSummary', 'CheckoutForm'] },
    ];
  }

  if (category === 'Restaurant') {
    return [
      { id: 'home', name: 'Home', path: '/', description: 'Atmospheric culinary experience, chef philosophy, hours.', components: ['Hero', 'SignatureDishes', 'Experience'] },
      { id: 'menu', name: 'Menu', path: '/menu', description: 'Categorized food & wine list with dietary filters.', components: ['CategoryTabs', 'MenuItems'] },
      { id: 'reservations', name: 'Reservations', path: '/reservations', description: 'Table booking form with party size and date selection.', components: ['BookingForm', 'DiningGuidelines'] },
      { id: 'contact', name: 'Contact', path: '/contact', description: 'Location map, private dining inquiry, valet parking info.', components: ['Map', 'Hours', 'PrivateEvents'] },
    ];
  }

  // Default
  return [
    { id: 'home', name: 'Home', path: '/', description: 'Primary overview and hero presentation.', components: ['Hero', 'Features', 'Testimonials'] },
    { id: 'features', name: 'Capabilities', path: '/features', description: 'Deep feature breakdown and specifications.', components: ['FeatureGrid', 'Specs'] },
    { id: 'pricing', name: 'Pricing', path: '/pricing', description: 'Tier plans and feature comparison.', components: ['PricingCards', 'FAQ'] },
    { id: 'contact', name: 'Contact', path: '/contact', description: 'Direct contact form and support channels.', components: ['ContactForm'] },
  ];
}

function defaultFeaturesForCategory(category: string): string[] {
  if (category === 'Digital marketing agency') {
    return ['Interactive Case Study Drawer', 'Consultation Booking Form', 'Retainer vs Sprint Pricing Switcher', 'Live ROI Calculator'];
  }
  if (category === 'E-commerce storefront') {
    return ['Live Category & Price Filters', 'Slide-out Shopping Bag Drawer', 'Product Variant Selector', 'Free Shipping Progress Meter'];
  }
  return ['Multi-device Responsive Navigation', 'Lead Generation Contact Form', 'Interactive Modal Drawers', 'Zero-latency Transitions'];
}

function deriveTitle(prompt: string, category: string): string {
  const words = prompt.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${capitalize(words[0])} ${capitalize(words[1])}`;
  }
  return `${category} Studio`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
