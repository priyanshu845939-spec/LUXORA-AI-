import { WebsiteProject, StarterTemplate, ProjectFiles } from '../types';
import { STARTER_TEMPLATES } from '../data/templates';
import { DEFAULT_PALETTE } from '../data/palettes';

const STORAGE_KEY = 'luxora_ai_projects_v1';
const ACTIVE_PROJECT_ID_KEY = 'luxora_ai_active_project_id';

export function getProjects(): WebsiteProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedInitialProjects();
      saveProjects(seeded);
      return seeded;
    }
    const projects: WebsiteProject[] = JSON.parse(raw);
    return Array.isArray(projects) && projects.length > 0 ? projects : seedInitialProjects();
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    return seedInitialProjects();
  }
}

export function saveProjects(projects: WebsiteProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to persist projects to localStorage:', err);
  }
}

export function getProjectById(id: string): WebsiteProject | null {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
}

export function saveProject(project: WebsiteProject): WebsiteProject {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  const updated = {
    ...project,
    updatedAt: Date.now(),
    hasUnsavedChanges: false,
  };

  if (index >= 0) {
    projects[index] = updated;
  } else {
    projects.unshift(updated);
  }

  saveProjects(projects);
  setActiveProjectId(updated.id);
  return updated;
}

export function duplicateProject(id: string): WebsiteProject | null {
  const original = getProjectById(id);
  if (!original) return null;

  const duplicated: WebsiteProject = {
    ...original,
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    name: `${original.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hasUnsavedChanges: false,
  };

  const projects = getProjects();
  projects.unshift(duplicated);
  saveProjects(projects);
  return duplicated;
}

export function renameProject(id: string, newName: string): WebsiteProject | null {
  const projects = getProjects();
  const proj = projects.find((p) => p.id === id);
  if (!proj) return null;

  proj.name = newName.trim();
  proj.updatedAt = Date.now();
  saveProjects(projects);
  return proj;
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  saveProjects(filtered);

  if (getActiveProjectId() === id) {
    if (filtered.length > 0) {
      setActiveProjectId(filtered[0].id);
    } else {
      localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    }
  }
  return true;
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
}

export function createProjectFromTemplate(template: StarterTemplate): WebsiteProject {
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

  return saveProject(newProj);
}

function seedInitialProjects(): WebsiteProject[] {
  return STARTER_TEMPLATES.slice(0, 3).map((template, idx) => ({
    id: `seed_project_${idx + 1}`,
    name: template.title,
    description: template.description,
    category: template.category,
    style: template.style,
    palette: template.palette || DEFAULT_PALETTE,
    files: { ...template.files },
    activeFile: 'index.html',
    coverImage: template.coverImage,
    createdAt: Date.now() - (idx + 1) * 3600000 * 24,
    updatedAt: Date.now() - idx * 3600000 * 5,
    hasUnsavedChanges: false,
    history: [{ ...template.files }],
    historyIndex: 0,
  }));
}
