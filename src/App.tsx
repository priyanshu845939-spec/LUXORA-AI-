import React, { useState, useEffect } from 'react';
import { WebsiteProject, StarterTemplate, SubscriptionPlan, GeneratorRequest } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  apiFetchProjects,
  apiSaveProject,
  apiDuplicateProject,
  apiDeleteProject,
  apiGenerateWebsite,
  apiFetchStatus,
} from './services/api';
import { exportProjectToZip } from './services/exportZip';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { EditorWorkspace } from './components/editor/EditorWorkspace';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { CreateProjectModal } from './components/dashboard/CreateProjectModal';
import { RenameModal } from './components/modals/RenameModal';
import { DeleteModal } from './components/modals/DeleteModal';
import { PricingModal } from './components/modals/PricingModal';
import { RazorpayCheckoutModal } from './components/modals/RazorpayCheckoutModal';

function AppContent() {
  const { user, openAuthModal, refreshProfile } = useAuth();
  const [view, setView] = useState<'landing' | 'dashboard' | 'editor' | 'admin'>('landing');
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [activeProject, setActiveProject] = useState<WebsiteProject | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [checkoutTargetPlan, setCheckoutTargetPlan] = useState<SubscriptionPlan | null>(null);
  const [checkoutBillingCycle, setCheckoutBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [renameTargetProject, setRenameTargetProject] = useState<WebsiteProject | null>(null);
  const [deleteTargetProject, setDeleteTargetProject] = useState<WebsiteProject | null>(null);

  // Load projects from server whenever user is authenticated
  const loadUserProjects = async () => {
    if (!user) {
      setProjects([]);
      return;
    }
    try {
      const serverProjects = await apiFetchProjects();
      setProjects(serverProjects);
    } catch (err) {
      console.warn('Could not fetch user projects from backend:', err);
    }
  };

  useEffect(() => {
    loadUserProjects();
    apiFetchStatus()
      .then((status) => setApiStatus(status))
      .catch((err) => console.warn('API status error:', err));
  }, [user]);

  // Handlers
  const handleOpenProject = (project: WebsiteProject) => {
    setActiveProject(project);
    setView('editor');
  };

  const handleSelectTemplate = async (template: StarterTemplate) => {
    if (!user) {
      openAuthModal('signup');
      return;
    }

    const newProj: WebsiteProject = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      name: template.title,
      description: template.description,
      category: template.category,
      style: template.style,
      palette: template.palette,
      files: { ...template.files },
      activeFile: 'index.html',
      coverImage: template.coverImage,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      hasUnsavedChanges: false,
      history: [{ ...template.files }],
      historyIndex: 0,
    };

    try {
      await apiSaveProject(newProj);
      await loadUserProjects();
      setActiveProject(newProj);
      setView('editor');
    } catch (err: any) {
      alert(err.message || 'Failed to initialize project');
    }
  };

  const handleGenerateProject = async (req: GeneratorRequest) => {
    if (!user) {
      openAuthModal('signup');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Validating requirements & prompt...');

    try {
      setTimeout(() => setGenerationStep('Synthesizing semantic HTML & structure...'), 800);
      setTimeout(() => setGenerationStep('Applying responsive Tailwind tokens...'), 1800);
      setTimeout(() => setGenerationStep('Wiring interactive controls & scripts...'), 2800);

      const result = await apiGenerateWebsite(req);

      if (result.success && result.data) {
        await refreshProfile();
        await loadUserProjects();

        const newProj: WebsiteProject = {
          id: result.projectId,
          name: result.data.projectName || req.businessName || 'Luxora Website',
          description: req.prompt,
          category: req.category,
          style: req.style,
          palette: req.palette,
          files: result.data.files,
          activeFile: 'index.html',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          hasUnsavedChanges: false,
          isDemo: result.isDemo,
          history: [{ ...result.data.files }],
          historyIndex: 0,
        };

        setActiveProject(newProj);
        setIsCreateModalOpen(false);
        setView('editor');
      }
    } catch (err: any) {
      console.error('Generation failure:', err);
      throw err;
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleUpdateActiveProject = (updated: WebsiteProject) => {
    setActiveProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleSaveActiveProject = async (projectToSave: WebsiteProject) => {
    try {
      await apiSaveProject(projectToSave);
      await loadUserProjects();
      setActiveProject({ ...projectToSave, hasUnsavedChanges: false });
    } catch (err: any) {
      alert(err.message || 'Save failed');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await apiDuplicateProject(id);
      await loadUserProjects();
    } catch (err: any) {
      alert(err.message || 'Duplicate failed');
    }
  };

  const handleRename = async (id: string, newName: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    try {
      const updated = { ...project, name: newName };
      await apiSaveProject(updated);
      await loadUserProjects();
      if (activeProject && activeProject.id === id) {
        setActiveProject(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Rename failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteProject(id);
      await loadUserProjects();
      if (activeProject && activeProject.id === id) {
        setActiveProject(null);
        setView('dashboard');
      }
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleExportZip = async (projectToExport: WebsiteProject) => {
    try {
      await exportProjectToZip(projectToExport);
    } catch (err: any) {
      alert(err.message || 'Export error');
    }
  };

  const handleCheckoutInit = (plan: SubscriptionPlan, cycle: 'monthly' | 'yearly') => {
    setIsPricingModalOpen(false);
    setCheckoutTargetPlan(plan);
    setCheckoutBillingCycle(cycle);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#030407] text-[#F5F7FF] flex flex-col font-sans selection:bg-[#D4FF24] selection:text-[#030407]">
      {/* Top Navbar */}
      <Navbar
        currentView={view}
        onNavigate={(newView) => setView(newView)}
        onOpenCreateModal={() => {
          if (!user) {
            openAuthModal('signup');
          } else {
            setIsCreateModalOpen(true);
          }
        }}
        onOpenPricing={() => setIsPricingModalOpen(true)}
      />

      {/* Main View Router */}
      <div className="flex-1 flex flex-col">
        {view === 'landing' && (
          <LandingPage
            onStartBuilding={() => {
              if (user) {
                setView('dashboard');
              } else {
                openAuthModal('signup');
              }
            }}
            onSelectTemplate={handleSelectTemplate}
            onOpenPricingDemo={(plan) => {
              setIsPricingModalOpen(true);
            }}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard
            projects={projects}
            onOpenProject={handleOpenProject}
            onNewProject={() => {
              if (!user) {
                openAuthModal('signup');
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            onSelectTemplate={handleSelectTemplate}
            onDuplicateProject={handleDuplicate}
            onRenameProject={(p) => setRenameTargetProject(p)}
            onDeleteProject={(p) => setDeleteTargetProject(p)}
            onExportProject={handleExportZip}
            onOpenPricing={() => setIsPricingModalOpen(true)}
            apiStatus={apiStatus}
          />
        )}

        {view === 'editor' && activeProject && (
          <EditorWorkspace
            project={activeProject}
            onUpdateProject={handleUpdateActiveProject}
            onSaveProject={handleSaveActiveProject}
            onBackToDashboard={() => setView('dashboard')}
            onOpenPricing={() => setIsPricingModalOpen(true)}
            apiStatus={apiStatus}
          />
        )}

        {view === 'admin' && (
          <AdminDashboard onBackToDashboard={() => setView('dashboard')} />
        )}
      </div>

      {/* Modals */}
      <AuthModal />

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGenerate={handleGenerateProject}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        isGenerating={isGenerating}
        generationStep={generationStep}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSelectPlanForCheckout={handleCheckoutInit}
      />

      <RazorpayCheckoutModal
        plan={checkoutTargetPlan}
        billingCycle={checkoutBillingCycle}
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onSuccess={async () => {
          await refreshProfile();
          await loadUserProjects();
        }}
        onOpenAdmin={() => {
          setView('admin');
        }}
        onOpenCreateProject={() => {
          setIsCreateModalOpen(true);
        }}
      />

      <RenameModal
        project={renameTargetProject}
        onClose={() => setRenameTargetProject(null)}
        onRename={handleRename}
      />

      <DeleteModal
        project={deleteTargetProject}
        onClose={() => setDeleteTargetProject(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
