import React, { useState, useEffect } from 'react';
import { WebsiteProject, StarterTemplate, SubscriptionPlan } from '../../types';
import { STARTER_TEMPLATES } from '../../data/templates';
import { useAuth } from '../../context/AuthContext';
import {
  apiFetchCreditHistory,
  apiFetchPaymentHistory,
  apiCancelSubscription,
  apiUpdateProfile,
  apiFetchPaymentConfig,
} from '../../services/api';
import {
  FolderKanban,
  LayoutTemplate,
  Image as ImageIcon,
  CreditCard,
  History,
  User as UserIcon,
  Settings,
  Plus,
  Search,
  MoreVertical,
  ExternalLink,
  Copy,
  Pencil,
  Trash2,
  Download,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Video,
  Clapperboard,
} from 'lucide-react';
import { ScriptStudio } from '../script/ScriptStudio';

interface DashboardProps {
  projects: WebsiteProject[];
  onOpenProject: (project: WebsiteProject) => void;
  onNewProject: () => void;
  onSelectTemplate: (template: StarterTemplate) => void;
  onDuplicateProject: (id: string) => void;
  onRenameProject: (project: WebsiteProject) => void;
  onDeleteProject: (project: WebsiteProject) => void;
  onExportProject: (project: WebsiteProject) => void;
  onOpenPricing: () => void;
  apiStatus: any;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onOpenProject,
  onNewProject,
  onSelectTemplate,
  onDuplicateProject,
  onRenameProject,
  onDeleteProject,
  onExportProject,
  onOpenPricing,
  apiStatus,
}) => {
  const { user, refreshProfile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'projects' | 'templates' | 'scripts' | 'assets' | 'billing' | 'usage' | 'profile' | 'settings'
  >('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Billing & Usage history states
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [gatewayConfig, setGatewayConfig] = useState<any>({ configured: false, mode: 'development' });
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'usage' || activeTab === 'billing') {
      apiFetchCreditHistory().then((data) => setCreditHistory(data.transactions || []));
      apiFetchPaymentHistory().then((data) => setPaymentHistory(data || []));
      apiFetchPaymentConfig().then((cfg) => setGatewayConfig(cfg)).catch(() => {});
    }
  }, [activeTab]);

  const categories = [
    'All',
    'Portfolio',
    'Business website',
    'Digital marketing agency',
    'E-commerce storefront',
    'SaaS landing page',
    'Real estate',
    'Restaurant',
  ];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiUpdateProfile({ name: profileName });
      await refreshProfile();
      setProfileMessage('Profile details updated successfully.');
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const handleCancelSub = async () => {
    if (!confirm('Are you sure you want to cancel automatic subscription renewal?')) return;
    try {
      await apiCancelSubscription();
      await refreshProfile();
      alert('Subscription cancelled. Your access will remain active until the end of your billing cycle.');
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#030407] text-[#F5F7FF] flex overflow-x-hidden">
      {/* Sidebar Navigation */}
      <aside
        className={`border-r border-white/10 bg-[#07090F] transition-all duration-300 flex flex-col justify-between shrink-0 ${
          sidebarCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        <div>
          {/* Collapse Toggle */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-xs font-mono uppercase tracking-wider text-gray-500">Workspace</span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition ml-auto cursor-pointer"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#9299AB] hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-[#D4FF24] shrink-0" />
              {!sidebarCollapsed && <span>My Projects</span>}
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#9299AB] hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutTemplate className="w-4 h-4 text-[#1558C9] shrink-0" />
              {!sidebarCollapsed && <span>Templates</span>}
            </button>

            <button
              onClick={() => setActiveTab('scripts')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'scripts'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#9299AB] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4 text-[#D4FF24] shrink-0" />
                {!sidebarCollapsed && <span>AI Script Studio</span>}
              </div>
              {!sidebarCollapsed && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4FF24]/20 text-[#D4FF24]">
                  NEW
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'assets'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#9299AB] hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
              {!sidebarCollapsed && <span>Assets &amp; Media</span>}
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#9299AB] hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
              {!sidebarCollapsed && <span>Billing &amp; Subscription</span>}
            </button>

            <button
              onClick={() => setActiveTab('usage')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'usage'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#9299AB] hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4 text-amber-400 shrink-0" />
              {!sidebarCollapsed && <span>Usage History</span>}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#9299AB] hover:text-white hover:bg-white/5'
              }`}
            >
              <UserIcon className="w-4 h-4 text-blue-400 shrink-0" />
              {!sidebarCollapsed && <span>User Profile</span>}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#9299AB] hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4 text-gray-400 shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {!sidebarCollapsed && user && (
            <div className="p-3 rounded-xl bg-[#0A0D14] border border-white/10 text-[11px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-white">Generations Allowance</span>
                <span className="text-[#D4FF24] font-mono font-bold">
                  {user.freeGenerationsRemaining > 0 ? `${user.freeGenerationsRemaining}/5 Free` : `${user.credits} Credits`}
                </span>
              </div>
              <div className="w-full bg-[#101521] rounded-full h-1.5 overflow-hidden mb-2">
                <div
                  className="bg-[#D4FF24] h-full"
                  style={{
                    width: `${Math.min(100, ((5 - user.freeGenerationsRemaining) / 5) * 100)}%`,
                  }}
                ></div>
              </div>
              <button
                onClick={onOpenPricing}
                className="w-full py-1.5 rounded bg-[#101521] hover:bg-white/10 text-[#D4FF24] text-[10px] font-semibold transition text-center cursor-pointer block border border-white/5"
              >
                Upgrade / Add Credits
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <HelpCircle className="w-4 h-4 text-gray-500 shrink-0" />
            {!sidebarCollapsed && <span>LUXORA v2.4 SaaS</span>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        {/* Prominent Free Generations / Active Plan Banner */}
        {user && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0A0D14] via-[#101521] to-[#0A0D14] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#D4FF24]/10 border border-[#D4FF24]/20 flex items-center justify-center text-[#D4FF24] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#D4FF24] font-semibold">
                    {user.subscription ? `${user.subscription.plan_name} ACTIVE` : 'FREE PLAN ACCOUNT'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-xs text-gray-300">
                    {user.freeGenerationsRemaining > 0
                      ? `${user.freeGenerationsRemaining} of 5 free website generations remaining`
                      : `${user.credits} AI credits available`}
                  </span>
                </div>
                <p className="text-xs text-[#9299AB] mt-0.5">
                  {user.freeGenerationsRemaining > 0
                    ? 'Free generations never expire. Only successful website builds count towards your allowance.'
                    : 'Each new generation consumes 10 credits. Follow-up refinements consume 3 credits.'}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenPricing}
              className="px-4 py-2 rounded-xl bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition whitespace-nowrap cursor-pointer shadow-[0_0_15px_-3px_rgba(212,255,36,0.3)] shrink-0"
            >
              {user.freeGenerationsRemaining === 0 ? 'Buy AI Credits' : 'Upgrade to Pro'}
            </button>
          </div>
        )}

        {/* Tab 1: My Projects */}
        {activeTab === 'projects' && (
          <div>
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading">My Websites</h1>
                <p className="text-xs text-[#9299AB] mt-1">
                  Manage, preview, refine, and export your generated website projects.
                </p>
              </div>

              <button
                onClick={onNewProject}
                className="px-4 py-2.5 rounded-lg bg-[#D4FF24] text-[#030407] font-semibold text-xs hover:opacity-90 transition flex items-center gap-2 shadow-[0_0_20px_-4px_rgba(212,255,36,0.3)] cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Website</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4FF24] transition"
                />
              </div>

              {/* Category Segmented Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#101521] text-[#D4FF24] border border-white/15'
                        : 'text-gray-400 hover:text-white bg-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-[#0A0D14] max-w-xl mx-auto my-12">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#D4FF24] mx-auto mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold font-heading text-white">No websites generated yet</h3>
                <p className="text-xs text-[#9299AB] mt-1 mb-6">
                  {searchQuery ? 'Try clearing your search query.' : 'Use your 5 free generations to build your first website.'}
                </p>
                <button
                  onClick={onNewProject}
                  className="px-5 py-2.5 bg-[#D4FF24] text-[#030407] font-semibold text-xs rounded-lg hover:opacity-90 transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start First Website</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-white/10 bg-[#0A0D14] hover:border-white/20 transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Project Preview Header */}
                      <div
                        onClick={() => onOpenProject(project)}
                        className="h-44 bg-[#050811] border-b border-white/5 relative overflow-hidden cursor-pointer flex items-center justify-center group-hover:opacity-95 transition"
                      >
                        {project.coverImage ? (
                          <img
                            src={project.coverImage}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center p-6">
                            <span className="font-heading font-bold text-lg text-white block mb-1">{project.name}</span>
                            <span className="text-[11px] font-mono text-gray-500">{project.category}</span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-[#D4FF24] border border-white/10">
                            {project.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3
                              onClick={() => onOpenProject(project)}
                              className="font-bold font-heading text-base text-white hover:text-[#D4FF24] transition cursor-pointer"
                            >
                              {project.name}
                            </h3>
                            <p className="text-xs text-[#9299AB] mt-1 line-clamp-2">
                              {project.description || `${project.style} website.`}
                            </p>
                          </div>

                          {/* Menu Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}
                              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {menuOpenId === project.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[#101521] border border-white/15 p-1 shadow-2xl z-20 text-xs">
                                <button
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    onRenameProject(project);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Rename</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    onDuplicateProject(project.id);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    onExportProject(project);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2"
                                >
                                  <Download className="w-3.5 h-3.5 text-[#D4FF24]" />
                                  <span>Export ZIP</span>
                                </button>
                                <div className="border-t border-white/10 my-1"></div>
                                <button
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    onDeleteProject(project);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                          </span>
                          <span className="text-[#D4FF24]">
                            {Object.keys(project.files).length} files
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => onOpenProject(project)}
                        className="w-full py-2.5 rounded-lg bg-[#101521] hover:bg-[#D4FF24] text-white hover:text-[#030407] font-semibold text-xs transition duration-200 flex items-center justify-center gap-1.5 border border-white/10 hover:border-transparent cursor-pointer"
                      >
                        <span>Open in Builder</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Templates */}
        {activeTab === 'templates' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading">Starter Architectures</h1>
              <p className="text-xs text-[#9299AB] mt-1">
                Clone a complete responsive starter with full source code and sample content.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STARTER_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-2xl border border-white/10 bg-[#0A0D14] overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 overflow-hidden relative">
                      <img src={tpl.coverImage} alt={tpl.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-[#D4FF24]">
                        {tpl.style}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold font-heading text-lg text-white">{tpl.title}</h3>
                      <p className="text-xs text-[#9299AB] mt-1 mb-4">{tpl.description}</p>
                      <div className="space-y-1">
                        {tpl.features.map((f, i) => (
                          <div key={i} className="text-[11px] text-gray-400 flex items-center gap-1.5">
                            <span className="text-[#D4FF24]">✓</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => onSelectTemplate(tpl)}
                      className="w-full py-2.5 rounded-lg bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition cursor-pointer"
                    >
                      Start Project with this Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2.5: AI Script Studio */}
        {activeTab === 'scripts' && (
          <ScriptStudio onOpenPricing={onOpenPricing} />
        )}

        {/* Tab 3: Assets */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">Assets &amp; Media</h1>
            <p className="text-xs text-[#9299AB]">High-resolution local assets stored directly within the application.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0A0D14]">
                <img src="/src/assets/images/hero_builder_preview_1793197348154.jpg" alt="Asset" className="w-full h-44 object-cover" />
                <div className="p-3 text-[11px] font-mono text-gray-400">hero_builder_preview.jpg</div>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0A0D14]">
                <img src="/src/assets/images/agency_template_cover_1793197349357.jpg" alt="Asset" className="w-full h-44 object-cover" />
                <div className="p-3 text-[11px] font-mono text-gray-400">agency_template_cover.jpg</div>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0A0D14]">
                <img src="/src/assets/images/saas_template_cover_1793197349422.jpg" alt="Asset" className="w-full h-44 object-cover" />
                <div className="p-3 text-[11px] font-mono text-gray-400">saas_template_cover.jpg</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Billing & Subscription */}
        {activeTab === 'billing' && (
          <div className="space-y-8 max-w-4xl">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading">Billing &amp; Subscription</h1>
              <p className="text-xs text-[#9299AB] mt-1">Manage your plan, payment methods, and invoices.</p>
            </div>

            {/* Current Active Plan Card */}
            <div className="p-6 rounded-2xl bg-[#0A0D14] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-mono uppercase text-[#D4FF24] font-semibold">Active Plan</span>
                <h3 className="text-2xl font-bold font-heading text-white mt-1">
                  {user?.subscription?.plan_name || 'Free Tier (5 Generations)'}
                </h3>
                <p className="text-xs text-[#9299AB] mt-1">
                  {user?.subscription
                    ? `Billed ${user.subscription.billing_cycle} · ₹${(user.subscription.amount / 100).toLocaleString('en-IN')}`
                    : 'Standard free access tier with 5 full website generations.'}
                </p>
                {user?.subscription && (
                  <div className="text-[11px] font-mono text-gray-400 mt-2">
                    Current period end: {new Date(user.subscription.current_period_end).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onOpenPricing}
                  className="px-5 py-2.5 rounded-xl bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition cursor-pointer"
                >
                  Change Plan / Buy Credits
                </button>
                {user?.subscription && (
                  <button
                    onClick={handleCancelSub}
                    className="px-4 py-2.5 rounded-xl bg-[#101521] border border-white/10 hover:border-red-500/40 text-red-400 text-xs transition cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>

            {/* Gateway Environment Status Notice */}
            {!gatewayConfig.configured ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-amber-300 font-mono">
                    Payment Gateway: Development Mode (Real Payments Paused)
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Razorpay credentials (<code className="text-amber-300 font-mono">RAZORPAY_KEY_ID</code> &amp;{' '}
                    <code className="text-amber-300 font-mono">RAZORPAY_KEY_SECRET</code>) are not configured on the
                    backend. Real payment processing and purchasing credits are paused. Your account includes{' '}
                    <strong className="text-white">5 Free Website Generations</strong> to build, refine, preview, and
                    export complete websites without payment required.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#D4FF24] shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-white font-mono">
                    Payment Gateway: {gatewayConfig.mode === 'test' ? 'Razorpay Test Sandbox Active' : 'Razorpay Production Active'}
                  </span>
                  <p className="text-gray-400">Cryptographically verified INR payments with instant credit activation.</p>
                </div>
              </div>
            )}

            {/* Invoices & Payment Receipts Table */}
            <div className="space-y-4">
              <h3 className="text-base font-bold font-heading text-white">Payment Receipts (Razorpay)</h3>
              <div className="rounded-2xl border border-white/10 bg-[#0A0D14] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#101521] border-b border-white/10 text-gray-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {paymentHistory.map((p) => (
                      <tr key={p.id}>
                        <td className="p-4 text-gray-300">{p.order_id}</td>
                        <td className="p-4 text-[#D4FF24]">{p.plan_id}</td>
                        <td className="p-4 text-white">₹{(p.amount / 100).toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px]">
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {paymentHistory.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500 font-sans">
                          No payment receipts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Usage History */}
        {activeTab === 'usage' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading">AI Credits &amp; Usage Ledger</h1>
              <p className="text-xs text-[#9299AB] mt-1">
                Transparent cryptographic record of all credits received, website generations, and follow-up edits.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0A0D14] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101521] border-b border-white/10 text-gray-400 font-mono text-[11px]">
                  <tr>
                    <th className="p-4">Activity Description</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Delta</th>
                    <th className="p-4">Balance After</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {creditHistory.map((txn) => (
                    <tr key={txn.id}>
                      <td className="p-4 font-sans text-white">{txn.description}</td>
                      <td className="p-4 text-gray-400 text-[11px]">{txn.type}</td>
                      <td className={`p-4 tabular-nums font-bold ${txn.amount > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                        {txn.amount > 0 ? `+${txn.amount}` : txn.amount}
                      </td>
                      <td className="p-4 text-white tabular-nums">{txn.balance_after}</td>
                      <td className="p-4 text-gray-500 text-[11px]">{new Date(txn.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {creditHistory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 font-sans">
                        No credit operations recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: User Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading">User Profile</h1>
              <p className="text-xs text-[#9299AB] mt-1">Manage your account identity and security.</p>
            </div>

            {profileMessage && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{profileMessage}</span>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-[#0A0D14] border border-white/10">
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Registered Email</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-[#101521] border border-white/5 rounded-xl p-3 text-xs text-gray-400 font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-[#101521] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4FF24]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#D4FF24] text-[#030407] font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 7: Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading">Workspace Settings</h1>
              <p className="text-xs text-[#9299AB] mt-1">Persistence &amp; AI configurations.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0A0D14] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white font-heading">Database &amp; Storage Architecture</h3>
              <p className="text-xs text-[#9299AB] leading-relaxed">
                All projects, user balances, credit ledgers, and subscriptions are stored on a persistent server database (SQLite with WAL mode). Data is strictly isolated per user account.
              </p>
              <div className="p-3.5 rounded-xl bg-[#101521] border border-white/5 font-mono text-xs text-gray-400">
                Data directory: <span className="text-[#D4FF24]">./data/luxora.db</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
