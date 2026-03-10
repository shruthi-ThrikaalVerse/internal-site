import React from 'react';

// Example raw data for projects assigned to the admin
const PROJECTS = [
  {
    id: 1,
    name: 'HRMS Dashboard',
    description: 'Enterprise HR management system for employee lifecycle.',
    status: 'Active',
    assignedBy: 'Super Admin',
    startDate: '2026-01-10',
    endDate: '2026-06-30',
  },
  {
    id: 2,
    name: 'Payroll Automation',
    description: 'Automate payroll processing and compliance.',
    status: 'Planning',
    assignedBy: 'Super Admin',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
  },
];

const Projects: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Assigned Projects</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {PROJECTS.map(project => (
          <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-indigo-700 mb-2">{project.name}</h2>
            <p className="text-gray-700 mb-2">{project.description}</p>
            <div className="flex flex-wrap gap-3 text-sm mb-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Status: {project.status}</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Assigned By: {project.assignedBy}</span>
            </div>
            <div className="text-xs text-gray-500">{project.startDate} - {project.endDate}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
