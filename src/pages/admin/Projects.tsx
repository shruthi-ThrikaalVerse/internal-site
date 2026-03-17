import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  AlertCircle,
  Clock,
  Briefcase,
  Loader
} from 'lucide-react';

interface Document {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  isActive: boolean;
}

interface Project {
  projectCode: string;
  name: string;
  description: string;
  clientId: number;
  status: 'IN_PROGRESS' | 'PLANNED' | 'COMPLETED' | 'ON_HOLD';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  createdBy: string;
  projectManagerId: string;
  documents: Document[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS':
      return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' };
    case 'PLANNED':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Planned' };
    case 'COMPLETED':
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' };
    case 'ON_HOLD':
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'On Hold' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'MEDIUM':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'LOW':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8085/api/projects/manager', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch projects. Make sure the backend is running on port 8080.');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <p className="text-gray-600 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">Error Loading Projects</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Projects</h1>
          <p className="text-gray-600 text-sm mt-1">Manage and view assigned projects</p>
        </div>
        <div className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm">
          {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Projects Found</h3>
          <p className="text-gray-600">You don't have any assigned projects yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1">
          {projects.map((project) => {
            const statusColor = getStatusColor(project.status);
            const upcomingDate = new Date(project.endDate);
            const isOverdue = upcomingDate < new Date() && project.status !== 'COMPLETED';
            
            return (
              <div
                key={project.projectCode}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header Section */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                        {project.projectCode}
                      </div>
                      <h2 className="text-2xl font-black text-gray-900">{project.name}</h2>
                    </div>
                    <div className={`px-3 py-1 rounded-lg font-bold text-xs ${statusColor.bg} ${statusColor.text} whitespace-nowrap`}>
                      {statusColor.label}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-5">
                  {/* Priority & Status Row */}
                  <div className="flex gap-3">
                    <div className={`px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest flex-1 ${getPriorityColor(project.priority)}`}>
                      ⚡ {project.priority} Priority
                    </div>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-widest">
                      {project.currency}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <DollarSign className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Budget</p>
                      <p className="text-lg font-black text-indigo-900">
                        {formatCurrency(project.budget, project.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Start</p>
                        <p className="text-sm font-bold text-gray-900">{formatDate(project.startDate)}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 p-3 rounded-xl border ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                      <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-gray-600'} flex-shrink-0`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold uppercase tracking-widest ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                          {isOverdue ? '⚠️ Overdue' : 'End'}
                        </p>
                        <p className={`text-sm font-bold ${isOverdue ? 'text-red-900' : 'text-gray-900'}`}>
                          {formatDate(project.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  {project.documents && project.documents.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                          {project.documents.length} Document{project.documents.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {project.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs"
                          >
                            <FileText className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700 font-medium truncate flex-1">{doc.fileName}</span>
                            <span className="text-gray-500 whitespace-nowrap">
                              {(doc.fileSize / 1024).toFixed(0)} KB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                  <span>Manager: <span className="font-bold text-gray-900">{project.projectManagerId}</span></span>
                  <span>Client ID: <span className="font-bold text-gray-900">{project.clientId}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
