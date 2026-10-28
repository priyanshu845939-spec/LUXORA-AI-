export type WebsiteCategory =
  | 'Portfolio'
  | 'Business website'
  | 'Digital marketing agency'
  | 'E-commerce storefront'
  | 'SaaS landing page'
  | 'Real estate'
  | 'Restaurant'
  | 'Blog'
  | 'Education'
  | 'Custom';

export type VisualStyle =
  | 'Luxury'
  | 'Minimal'
  | 'Editorial'
  | 'Futuristic'
  | 'Corporate'
  | 'Creative';

export interface ColorPalette {
  id: string;
  name: string;
  bg: string;
  surface: string;
  accent: string;
  text: string;
  secondaryText: string;
  isDefault?: boolean;
}

export interface ProjectFiles {
  'index.html': string;
  'src/App.tsx'?: string;
  'src/main.tsx'?: string;
  'src/styles.css'?: string;
  'package.json'?: string;
  'README.md'?: string;
  [key: string]: string | undefined;
}

export interface WebsiteProject {
  id: string;
  userId?: string;
  name: string;
  description: string;
  category: WebsiteCategory;
  style: VisualStyle;
  palette: ColorPalette;
  files: ProjectFiles;
  activeFile?: string;
  isDemo?: boolean;
  hasUnsavedChanges?: boolean;
  createdAt: number;
  updatedAt: number;
  coverImage?: string;
  generationCount?: number;
  history?: ProjectFiles[];
  historyIndex?: number;
}

export interface StarterTemplate {
  id: string;
  title: string;
  category: WebsiteCategory;
  style: VisualStyle;
  tagline: string;
  description: string;
  palette: ColorPalette;
  features: string[];
  coverImage: string;
  files: ProjectFiles;
}

export type DeviceViewport = 'desktop' | 'tablet' | 'mobile';

export interface GeneratorRequest {
  prompt: string;
  category: WebsiteCategory;
  style: VisualStyle;
  palette: ColorPalette;
  businessName?: string;
  targetAudience?: string;
  requirements?: string;
  provider?: 'gemini' | 'deepseek' | 'demo' | 'auto';
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  freeGenerationsUsed: number;
  freeGenerationsTotal: number;
  freeGenerationsRemaining: number;
  credits: number;
  subscription?: UserSubscription | null;
  createdAt?: number;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  plan_name: string;
  status: 'active' | 'cancelled' | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  amount: number;
  credits_per_cycle: number;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  badge?: string;
  priceMonthly: number;
  priceYearly: number;
  creditsMonthly: number;
  creditsYearly: number;
  features: string[];
  highlighted?: boolean;
}

export type PricingPlan = SubscriptionPlan;

export interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  reference_id?: string;
  balance_after: number;
  created_at: number;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  payment_id?: string;
  amount: number;
  currency: string;
  status: string;
  plan_id: string;
  created_at: number;
}

export interface PlannedPage {
  id: string;
  name: string;
  path: string;
  description: string;
  components: string[];
}

export interface WebsitePlan {
  projectName: string;
  tagline: string;
  category: WebsiteCategory;
  style: VisualStyle;
  detectedNiche: string;
  detectedLocation?: string;
  detectedFocus?: string;
  targetAudience?: string;
  pages: PlannedPage[];
  suggestedFeatures: string[];
  colorPalette: ColorPalette;
}

export type ScriptPlatform =
  | 'Instagram Reels'
  | 'YouTube Shorts'
  | 'TikTok'
  | 'Video Ad (Lead Gen)'
  | 'Property Walkthrough';

export type ScriptLanguage = 'Hindi' | 'Hinglish' | 'English';

export type ScriptTone =
  | 'High Energy & Viral'
  | 'Luxury & Cinematic'
  | 'Direct Response & Urgency'
  | 'Educational & Informative';

export interface ScriptScene {
  sceneNumber: number;
  timestamp: string;
  visualDirection: string;
  cameraMovement: string;
  dialogue: string;
  onScreenText: string;
  musicSfx: string;
}

export interface VideoScript {
  id: string;
  title: string;
  topic: string;
  platform: ScriptPlatform;
  duration: string;
  language: ScriptLanguage;
  tone: ScriptTone;
  hook: string;
  viralHooks: string[];
  scenes: ScriptScene[];
  callToAction: string;
  captionAndHashtags: string;
  createdAt: number;
}

