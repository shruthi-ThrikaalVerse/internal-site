
import React, { useState } from 'react';
import { MOCK_PROJECTS, MOCK_EMPLOYEES } from '../../constants';
import { SectionHeader, Badge } from '../../components/super_admin/UI';
/* Added Shield to lucide-react imports to fix error on line 302 */
import { Calendar, Users, Plus, Layout, Type, Target, Image as ImageIcon, FileText, Check, Pencil, Trash2, Shield } from 'lucide-react';
import { Modal } from '../../components/super_admin/Modal';
/* Added FormSelect to FormFields imports to fix error on line 223 */
import { FormInput, FormTextArea, FormSelect } from '../../components/super_admin/FormFields';
import { Project } from '../../types';

const EMPTY_PROJECT: Partial<Project> = {
  name: '',
  client: '',
  progress: 0,
  status: 'planning',
  team: [],
  dueDate: new Date().toISOString().split('T')[0]
};

export const ProjectsView = () => {
  const [projects, setProjects] = useState<Project[]>([...MOCK_PROJECTS]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project>>(EMPTY_PROJECT);
  const [description, setDescription] = useState('');
  const [isNew, setIsNew] = useState(true);

  const toggleTeamMember = (name: string) => {
    const currentTeam = editingProject.team || [];
    if (currentTeam.includes(name)) {
      setEditingProject({ ...editingProject, team: currentTeam.filter(n => n !== name) });
    } else {
      setEditingProject({ ...editingProject, team: [...currentTeam, name] });
    }
  };

  const handleAddNew = () => {
    setEditingProject(EMPTY_PROJECT);
    setDescription('');
    setIsNew(true);
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject({ ...project });
    setDescription(''); // Assuming description isn't in mock data but could be
    setIsNew(false);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (isNew) {
      const newId = `p${projects.length + 1}`;
      const projectToAdd = {
        ...editingProject,
        id: newId,
        status: editingProject.status || 'planning',
      } as Project;
      setProjects([projectToAdd, ...projects]);
    } else {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...editingProject } as Project : p));
    }

    setIsModalOpen(false);
    setEditingProject(EMPTY_PROJECT);
    setDescription('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to archive this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Active Projects"
        description="Track progress across all client and internal initiatives."
        actions={
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 bg-[#f37321] px-5 py-3 rounded-xl text-sm font-bold shadow-2xl shadow-[#f37321]/20 hover:bg-[#e06410] transition-all transform hover:scale-[1.05] active:scale-[0.95] w-full sm:w-auto text-white"
          >
            <Plus size={18} />
            <span>Add Project</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-[#0b1220] border border-[#1f2937] rounded-2xl p-6 hover:border-[#f37321]/40 transition-all shadow-xl group relative overflow-hidden">
            {/* Subtle Gradient Accent */}
            <div className={`absolute top-0 left-0 w-1 h-full ${project.status === 'completed' ? 'bg-emerald-500' : project.status === 'delayed' ? 'bg-rose-500' : 'bg-[#f37321]'}`} />

            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-lg text-[#e6eef8] group-hover:text-[#f37321] transition-colors truncate">{project.name}</h3>
                <p className="text-xs text-[#9aa8bd] font-medium truncate">{project.client}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge color={project.status === 'completed' ? 'green' : project.status === 'delayed' ? 'red' : 'blue'}>
                  {project.status.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-1.5 hover:bg-[#1f2937] rounded-lg text-[#9aa8bd] hover:text-[#f37321] transition-all"
                    title="Edit Project"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 hover:bg-[#1f2937] rounded-lg text-[#9aa8bd] hover:text-rose-400 transition-all"
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
                  <span className="text-[#9aa8bd]">Progress</span>
                  <span className="text-[#f37321]">{project.progress}%</span>
                </div>
                <div className="w-full bg-[#1f2937] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#f37321] h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(243,115,33,0.4)]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[#9aa8bd]">
                  <Users size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{(project.team || []).length} Members</span>
                </div>
                <div className="flex items-center gap-2 text-[#9aa8bd]">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Due {project.dueDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {(project.team || []).slice(0, 4).map((name, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0b1220] bg-gradient-to-br from-[#1f2937] to-[#0b1220] flex items-center justify-center text-[10px] font-bold text-[#e6eef8] shadow-lg" title={name}>
                      {name[0]}
                    </div>
                  ))}
                  {(project.team || []).length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-[#0b1220] bg-[#1f2937] flex items-center justify-center text-[10px] font-bold text-[#9aa8bd] shadow-lg">
                      +{(project.team || []).length - 4}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleEdit(project)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9aa8bd] hover:text-[#f37321] transition-colors"
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
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-[#0f172a] to-[#0b1220] rounded-[2rem] border border-[#1f2937] relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#f37321]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <div className="p-5 bg-[#f37321]/10 text-[#f37321] rounded-[1.5rem] border border-[#f37321]/20 shadow-inner">
              <Layout size={32} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-xl font-black text-[#e6eef8] tracking-tight mb-1">{editingProject.name || 'Project Untitled'}</h4>
              <p className="text-[#9aa8bd] text-xs font-bold uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                <Target size={12} className="text-[#f37321]" /> Global Operations Pipeline
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2">
              <h5 className="text-[10px] font-black text-[#f37321] uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#f37321]/30"></span>
                Strategic Parameters
              </h5>
            </div>

            <FormInput
              label="Project Designation"
              value={editingProject.name || ''}
              onChange={(val) => setEditingProject({ ...editingProject, name: val })}
              placeholder="e.g. NextGen Mobile Core"
            />

            <FormInput
              label="Stakeholder / Client"
              value={editingProject.client || ''}
              onChange={(val) => setEditingProject({ ...editingProject, client: val })}
              placeholder="e.g. Corporate Infrastructure"
            />

            <FormInput
              label="Target Completion Date"
              type="date"
              value={editingProject.dueDate || ''}
              onChange={(val) => setEditingProject({ ...editingProject, dueDate: val })}
            />

            <FormSelect
              label="Current Roadmap Status"
              value={editingProject.status || 'planning'}
              onChange={(val) => setEditingProject({ ...editingProject, status: val as any })}
              options={['planning', 'in-progress', 'completed', 'delayed']}
            />

            <div className="md:col-span-2 mt-4">
              <h5 className="text-[10px] font-black text-[#f37321] uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#f37321]/30"></span>
                Progress & Visualization
              </h5>
            </div>

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

            <div className="md:col-span-2 mt-4">
              <h5 className="text-[10px] font-black text-[#f37321] uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#f37321]/30"></span>
                Personnel Allocation
              </h5>

              <div className="bg-[#0f172a] border border-[#1f2937] rounded-2xl p-4 max-h-48 overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-2 shadow-inner">
                {MOCK_EMPLOYEES.map((employee) => {
                  const isSelected = editingProject.team?.includes(employee.name);
                  return (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => toggleTeamMember(employee.name)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-xs font-bold ${isSelected
                        ? 'bg-[#f37321]/10 border-[#f37321] text-[#f37321] shadow-[0_0_12px_rgba(243,115,33,0.1)]'
                        : 'bg-[#0b1220] border-[#1f2937] text-[#9aa8bd] hover:border-[#f37321]/30'
                        }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={employee.avatar} className="w-6 h-6 rounded-lg border border-[#1f2937] shadow-sm" alt="" />
                        <span className="truncate">{employee.name}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#f37321] border-[#f37321]' : 'border-[#1f2937]'}`}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] text-[#9aa8bd] italic font-medium px-1">Selected: {editingProject.team?.length || 0} specialists assigned to project.</p>
            </div>

            <div className="md:col-span-2 mt-4">
              <h5 className="text-[10px] font-black text-[#f37321] uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-[#f37321]/30"></span>
                Core Objectives & Scope
              </h5>
              <FormTextArea
                label=""
                value={description}
                onChange={setDescription}
                placeholder="Detail the technical requirements, strategic objectives, and operational milestones defining this project..."
              />
            </div>
          </div>

          <div className="p-4 bg-[#f37321]/5 border border-[#1f2937]/10 rounded-xl flex gap-3 items-center">
            {/* Using Shield icon which is now correctly imported */}
            <Shield size={18} className="text-[#f37321] shrink-0" />
            <p className="text-[10px] text-[#9aa8bd] font-medium leading-tight">
              Project status updates and team reallocations are synchronized across all department heads automatically.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
