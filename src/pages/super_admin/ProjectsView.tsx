
import React, { useEffect, useState } from 'react';
import { SectionHeader, Badge } from './UI.tsx';
/* Added Shield to lucide-react imports to fix error on line 302 */
import { Calendar, Users, Plus, Layout, Type, Target, Image as ImageIcon, FileText, Check, Pencil, Trash2, Shield } from 'lucide-react';
import { Modal } from '../../components/super_admin/Modal.tsx';
/* Added FormSelect to FormFields imports to fix error on line 223 */
import { FormInput, FormTextArea, FormSelect } from '../../components/super_admin/FormFields.tsx';
import { Project } from '../../types.tsx';
import * as projectsApi from '../../api/projects.ts';

const EMPTY_PROJECT: Partial<Project> = {
  name: '',
  client: '',
  progress: 0,
  status: 'planning',
  team: [],
  dueDate: new Date().toISOString().split('T')[0],
  startDate: new Date().toISOString().split('T')[0],
  priority: 'MEDIUM',
  budget: 0,
  currency: 'USD',
  projectManagerId: undefined,
};

export const ProjectsView = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectManagers, setProjectManagers] = useState<any[]>([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [managersError, setManagersError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project>>(EMPTY_PROJECT);
  const [description, setDescription] = useState('');
  const [isNew, setIsNew] = useState(true);

  // Form Validation State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({
    name: '',
    client: '',
    startDate: '',
    dueDate: '',
    description: ''
  });

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.getAllProjects();
      // map server objects to our simplified Project type
      const mapped: Project[] = data.map((p: any) => ({
        id: p.projectCode,
        projectCode: p.projectCode,
        name: p.name,
        status: p.status.toLowerCase().replace('_', '-'),
        progress: p.progress || 0,
        description: p.description,
        client: p.clientId != null ? String(p.clientId) : '',
        dueDate: p.endDate ? p.endDate.split('T')[0] : '',
        // keep any other metadata so that edits can send them back
        clientId: p.clientId,
        priority: p.priority,
        startDate: p.startDate ? p.startDate.split('T')[0] : '',
        endDate: p.endDate ? p.endDate.split('T')[0] : '',
        budget: p.budget,
        currency: p.currency,
        projectManagerId: p.projectManagerId,
      }));
      setProjects(mapped);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const fetchManagers = async () => {
    try {
      setManagersLoading(true);
      setManagersError(null);
      console.log('Fetching project managers...');
      const mgrs = await projectsApi.getProjectManagers();
      console.log('Fetched managers:', mgrs);
      console.log('Manager count:', mgrs?.length || 0);
      if (!Array.isArray(mgrs)) {
        console.warn('Expected array of managers but got:', typeof mgrs, mgrs);
        setProjectManagers([]);
        setManagersError('Invalid managers data format');
      } else {
        setProjectManagers(mgrs);
        setManagersError(null);
      }
    } catch (err: any) {
      console.error('failed to load managers:', err);
      setManagersError(err?.message || 'Failed to load project managers');
      setProjectManagers([]);
    } finally {
      setManagersLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingProject(EMPTY_PROJECT);
    setDescription('');
    setValidationErrors({ name: '', client: '', startDate: '', dueDate: '', description: '' });
    setIsNew(true);
    setIsModalOpen(true);
    // refetch managers when modal opens to ensure fresh data
    fetchManagers();
  };

  const handleEdit = (project: Project) => {
    setEditingProject({ ...project });
    setDescription(project.description || '');
    setValidationErrors({ name: '', client: '', startDate: '', dueDate: '', description: '' });
    setIsNew(false);
    setIsModalOpen(true);
    // refetch managers when modal opens
    fetchManagers();
  };

  // Validation Functions
  const validateProjectName = (name: string): string => {
    if (!name?.trim()) {
      return 'Project name is required';
    }
    return '';
  };

  const validateClientId = (clientId: string): string => {
    if (!clientId?.trim()) {
      return 'Stakeholder/Client ID is required';
    }
    if (!/^\d+$/.test(clientId)) {
      return 'Client ID must contain only numbers';
    }
    return '';
  };

  const validateStartDate = (startDate: string): string => {
    if (!startDate?.trim()) {
      return 'Start date is required';
    }
    return '';
  };

  const validateDueDate = (dueDate: string): string => {
    if (!dueDate?.trim()) {
      return 'Target completion date is required';
    }
    return '';
  };

  const validateDescription = (desc: string): string => {
    if (!desc?.trim()) {
      return 'Project description/scope is required';
    }
    return '';
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    errors.name = validateProjectName(editingProject.name || '');
    errors.client = validateClientId(editingProject.client || '');
    errors.startDate = validateStartDate(editingProject.startDate || '');
    errors.dueDate = validateDueDate(editingProject.dueDate || '');
    errors.description = validateDescription(description);

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSave = async () => {
    // Validate form before submission
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting');
      return;
    }

    // build minimal payload for the backend. most fields are optional in the
    // UI so we supply reasonable defaults.
    const payload: any = {
      projectCode: editingProject?.projectCode || editingProject?.id,
      name: editingProject?.name,
      description: description,
      clientId: Number(editingProject?.client) || editingProject?.clientId || 0,
      status: (editingProject?.status || 'planning').toUpperCase(),
      priority: (editingProject?.priority || 'MEDIUM').toUpperCase(),
      startDate: editingProject?.startDate || editingProject?.dueDate || '',
      endDate: editingProject?.dueDate || editingProject?.endDate || '',
      budget: editingProject?.budget || 0,
      currency: editingProject?.currency || 'USD',
      createdBy: editingProject?.createdBy || 1,
      projectManagerId: editingProject?.projectManagerId || 0,
      documents: [],
    };

    try {
      if (isNew) {
        const created = await projectsApi.createProject(payload);
        // convert and insert
        const local = {
          id: created.projectCode,
          projectCode: created.projectCode,
          name: created.name,
          status: created.status.toLowerCase().replace('_', '-'),
          progress: created.progress || 0,
          description: created.description,
          client: created.clientId != null ? String(created.clientId) : '',
          dueDate: created.endDate ? created.endDate.split('T')[0] : '',
          clientId: created.clientId,
          priority: created.priority,
          startDate: created.startDate ? created.startDate.split('T')[0] : '',
          endDate: created.endDate ? created.endDate.split('T')[0] : '',
          budget: created.budget,
          currency: created.currency,
          projectManagerId: created.projectManagerId,
        } as Project;
        setProjects([local, ...projects]);
      } else {
        // determine code to send in URL – prefer the original projectCode if
        // present since `id` might have been mutated locally.
        const codeToPatch = editingProject.projectCode || editingProject.id || '';
        console.log('patching project code', codeToPatch, 'payload', payload);
        await projectsApi.patchProject(codeToPatch, payload);
        await fetchProjects(); // re-sync with server
      }
    } catch (err) {
      console.error('save project failed', err);
    }

    setIsModalOpen(false);
    setEditingProject(EMPTY_PROJECT);
    setDescription('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this project?')) {
      try {
        await projectsApi.deleteProject(id);
        setProjects(projects.filter((p) => p.id !== id));
      } catch (err) {
        console.error('delete failed', err);
      }
    }
  };

  const handlePatch = async (id: string, update: any) => {
    try {
      await projectsApi.patchProject(id, update);
      await fetchProjects();
    } catch (err) {
      console.error('patch failed', err);
    }
  };

  // load data when component mounts
  useEffect(() => {
    fetchProjects();
    fetchManagers();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Active Projects"
        description="Track progress across all client and internal initiatives."
        actions={
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 bg-blue-600 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl shadow-blue-200 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 transition-all transform hover:scale-[1.05] active:scale-[0.95] w-full sm:w-auto text-white"
          >
            <Plus size={18} />
            <span>Add Project</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 transition-all shadow-xl group relative overflow-hidden">
            {/* Subtle Gradient Accent */}
            <div className={`absolute top-0 left-0 w-1 h-full ${project.status === 'completed' ? 'bg-emerald-500' : project.status === 'delayed' ? 'bg-rose-500' : 'bg-blue-600'}`} />

            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">{project.name}</h3>
                <p className="text-xs text-gray-500 font-medium truncate">{project.client}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge color={project.status === 'completed' ? 'green' : project.status === 'delayed' ? 'red' : 'blue'}>
                  {project.status.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-all focus:ring-4 focus:ring-blue-500/50"
                    title="Edit Project"
                  >
                    <Pencil size={14} />
                  </button>
                  {project.status !== 'completed' && (
                    <button
                      onClick={() => handlePatch(project.id, { status: 'COMPLETED' })}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-green-600 transition-all"
                      title="Mark Completed"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-rose-400 transition-all"
                    title="Archive Project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-blue-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Users size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{(project.team || []).length} Members</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Due {project.dueDate}</span>
                </div>
                {project.projectManagerId && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">PM #{project.projectManagerId}</span>
                  </div>
                )}
                {project.priority && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Type size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{project.priority}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {(project.team || []).slice(0, 4).map((name, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-white flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-lg" title={name}>
                      {name[0]}
                    </div>
                  ))}
                  {(project.team || []).length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-lg">
                      +{(project.team || []).length - 4}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleEdit(project)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-blue-600 transition-colors focus:ring-4 focus:ring-blue-500/50"
                >
                  Manage Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isNew ? "Initiate New Project" : "Modify Project Core"}
        onSave={handleSave}
      >
        <div className="space-y-8 pb-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-blue-50 to-white rounded-[2rem] border border-gray-200 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] border border-blue-100 shadow-inner">
              <Layout size={32} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-xl font-black text-gray-900 tracking-tight mb-1">{editingProject.name || 'Project Untitled'}</h4>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                <Target size={12} className="text-blue-600" /> Global Operations Pipeline
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2">
              <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-blue-200"></span>
                Strategic Parameters
              </h5>
            </div>

            <div className="space-y-2 w-full">
              <FormInput
                label="Project Designation"
                value={editingProject.name || ''}
                onChange={(val) => {
                  setEditingProject({ ...editingProject, name: val });
                  if (validationErrors.name) {
                    setValidationErrors(prev => ({ ...prev, name: '' }));
                  }
                }}
                placeholder="e.g. NextGen Mobile Core"
              />
              {validationErrors.name && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span> {validationErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <FormInput
                label="Stakeholder / Client (ID)"
                value={editingProject.client || ''}
                onChange={(val) => {
                  const cleanedValue = val.replace(/\D/g, '');
                  setEditingProject({ ...editingProject, client: cleanedValue });
                  if (validationErrors.client) {
                    setValidationErrors(prev => ({ ...prev, client: '' }));
                  }
                }}
                placeholder="e.g. 10"
              />
              <p className="text-xs text-gray-500 font-medium">Numbers only</p>
              {validationErrors.client && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span> {validationErrors.client}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <FormInput
                label="Start Date"
                type="date"
                value={editingProject.startDate || ''}
                onChange={(val) => {
                  setEditingProject({ ...editingProject, startDate: val });
                  if (validationErrors.startDate) {
                    setValidationErrors(prev => ({ ...prev, startDate: '' }));
                  }
                }}
              />
              {validationErrors.startDate && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span> {validationErrors.startDate}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <FormInput
                label="Target Completion Date"
                type="date"
                value={editingProject.dueDate || ''}
                onChange={(val) => {
                  setEditingProject({ ...editingProject, dueDate: val });
                  if (validationErrors.dueDate) {
                    setValidationErrors(prev => ({ ...prev, dueDate: '' }));
                  }
                }}
              />
              {validationErrors.dueDate && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span> {validationErrors.dueDate}
                </p>
              )}
            </div>

              <FormSelect
                label="Current Roadmap Status"
                value={editingProject.status || 'planning'}
                onChange={(val) => setEditingProject({ ...editingProject, status: val as any })}
                options={['planning', 'in-progress', 'completed', 'delayed', 'new']}
              />

              <FormSelect
                label="Priority"
                value={editingProject.priority || 'MEDIUM'}
                onChange={(val) => setEditingProject({ ...editingProject, priority: val })}
                options={['LOW', 'MEDIUM', 'HIGH']}
              />

              <FormInput
                label="Budget"
                type="text"
                value={editingProject.budget || ''}
                onChange={(val) => {
                  const cleanedValue = val.replace(/[^0-9.]/g, '');
                  const numValue = cleanedValue ? parseFloat(cleanedValue) : '';
                  setEditingProject({ ...editingProject, budget: numValue as any });
                }}
                placeholder="e.g. 500000"
              />

              <FormInput
                label="Currency"
                value={editingProject.currency || 'USD'}
                onChange={(val) => setEditingProject({ ...editingProject, currency: val })}
                placeholder="USD"
              />

              {managersError && (
                <div className="md:col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700 font-medium">⚠️ {managersError}</p>
                </div>
              )}

              {managersLoading && (
                <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">Loading project managers...</p>
                </div>
              )}

              <FormSelect
                label="Project Manager"
                value={editingProject.projectManagerId != null ? String(editingProject.projectManagerId) : ''}
                onChange={(val) => {
                  setEditingProject({ ...editingProject, projectManagerId: val || undefined });
                }}
                options={(() => {
                  const opts = [
                    '',
                    ...projectManagers.map((m) => `${m.employeeId}`),
                  ];
                  console.log('Project Manager dropdown options:', opts);
                  console.log('projectManagers state:', projectManagers);
                  console.log('Current selected value:', editingProject.projectManagerId);
                  return opts;
                })()}
                renderOption={(opt) => {
                  if (!opt) return '-- Select --';
                  const manager = projectManagers.find(m => m.employeeId === opt);
                  return manager ? `${manager.firstName} ${manager.lastName}` : opt;
                }}
              />

            <FormInput
              label="Completion Velocity"
              type="range"
              min={0}
              max={100}
              value={editingProject.progress || 0}
              onChange={(val) => setEditingProject({ ...editingProject, progress: parseInt(val) })}
            />

            <FormInput
              label="Project Schematic Image"
              type="file"
              value=""
              onChange={() => { }}
            />
            <div className="md:col-span-2 mt-4 space-y-2">
              <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-blue-200"></span>
                Core Objectives & Scope
              </h5>
              <FormTextArea
                label=""
                value={description}
                onChange={(val) => {
                  setDescription(val);
                  if (validationErrors.description) {
                    setValidationErrors(prev => ({ ...prev, description: '' }));
                  }
                }}
                placeholder="Detail the technical requirements, strategic objectives, and operational milestones defining this project..."
              />
              {validationErrors.description && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span> {validationErrors.description}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-gray-200 rounded-xl flex gap-3 items-center">
            {/* Using Shield icon which is now correctly imported */}
            <Shield size={18} className="text-blue-600 shrink-0" />
            <p className="text-[10px] text-gray-500 font-medium leading-tight">
              Project status updates and team reallocations are synchronized across all department heads automatically.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
