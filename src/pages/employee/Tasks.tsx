import React, { useState, useEffect, useRef } from 'react';
import { getTasks as apiGetTasks, getMyTasks as apiGetMyTasks, getSelfTasks as apiGetSelfTasks, createSelfTask, deleteSelfTask } from '../../api/tasks.ts';
import {
  CheckCircle, Clock, MoreVertical, Plus, Filter, Grid, List,
  X, Trash2, Loader2, AlertCircle, User, Tag,
  Circle, TrendingUp, FileText, Calendar,
  Download, Zap, AlertTriangle, Search, AlertOctagon, AlertCircle as AlertCircleIcon,
  ChevronDown, ChevronUp, Building2, Users
} from 'lucide-react';

interface TaskComment {
  id: string;
  text: string;
  author: string;
  date: string;
  avatar?: string;
}

interface TimeLog {
  id: string;
  duration: number;
  date: string;
  note?: string;
}

interface Task {
  id: string;
  title: string;
  project: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate: string;
  estimatedHours: number;
  timeLogged: number;
  description: string;
  tags: string[];
  assignee?: string;
  assignedBy?: string;
  createdAt: string;
  comments: TaskComment[];
  attachments: string[];
  logs: TimeLog[];
  taskType?: 'team' | 'individual' | 'work' | 'self' | 'department';
  memberCount?: number;
  teamMembers?: Array<{ employeeId: string; name: string; email: string }>;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<{ [key: string]: Task[] }>({
    my: [],
    team: [],
    individual: [],
    self: [],
    department: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<'my' | 'team' | 'individual' | 'self' | 'department'>('my');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'files'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [selectedCardFilter, setSelectedCardFilter] = useState<{ type: string, value: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBreachedSection, setShowBreachedSection] = useState(true);
  const [showStatusSections, setShowStatusSections] = useState({
    todo: true,
    in_progress: true,
    review: true,
    completed: true
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Track whether the tasks scroll container has a vertical scrollbar
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [scrollbarWidth, setScrollbarWidth] = useState<number>(0);

  useEffect(() => {
    const checkScroll = () => {
      const el = scrollRef.current;
      const doc = document.documentElement;
      if (!el) return;

      const elHasScroll = el.scrollHeight > el.clientHeight;
      const docHasScroll = doc.scrollHeight > doc.clientHeight;

      // if either the tasks container or the whole document is scrollable, treat as having vertical scroll
      setHasVerticalScroll(elHasScroll || docHasScroll);

      // compute scrollbar widths from both element and document and use the larger one
      const elScrollbarWidth = el.offsetWidth - el.clientWidth;
      const docScrollbarWidth = window.innerWidth - doc.clientWidth;
      const computedScrollbarWidth = Math.max(elScrollbarWidth || 0, docScrollbarWidth || 0);

      // fallback for overlay scrollbars (which report 0 width) - use a small safe offset when scroll exists
      setScrollbarWidth(computedScrollbarWidth || (elHasScroll || docHasScroll ? 12 : 0));
    }; 

    checkScroll();

    const ro = (window as any).ResizeObserver ? new (window as any).ResizeObserver(checkScroll) : null;
    if (ro && scrollRef.current) ro.observe(scrollRef.current);

    const mo = new MutationObserver(checkScroll);
    if (scrollRef.current) mo.observe(scrollRef.current, { childList: true, subtree: true, characterData: true });

    const onResize = () => {
      setWindowWidth(window.innerWidth);
      checkScroll();
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (ro && scrollRef.current) ro.disconnect();
      mo.disconnect();
    };
  }, []);


  const statuses = [
    { id: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800', icon: Circle },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock },
    { id: 'review', label: 'On Review', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  ];

  const priorities = [
    { id: 'urgent', label: 'P1-High', color: 'bg-red-500 text-white', borderColor: 'border-l-red-500', icon: AlertCircle },
    { id: 'high', label: 'P2-Medium', color: 'bg-orange-500 text-white', borderColor: 'border-l-orange-500', icon: TrendingUp },
    { id: 'medium', label: 'P3-Medium', color: 'bg-yellow-500 text-white', borderColor: 'border-l-yellow-500', icon: Circle },
    { id: 'low', label: 'P4-Low', color: 'bg-green-500 text-white', borderColor: 'border-l-green-500', icon: Circle }
  ];

  useEffect(() => {
    loadTasks();
  }, []);

  const mapTaskData = (item: any): Task => {
    const priorityMap: { [key: string]: Task['priority'] } = {
      'P1': 'urgent',
      'P2': 'high',
      'P3': 'medium',
      'P4': 'low',
      'URGENT': 'urgent',
      'HIGH': 'high',
      'MEDIUM': 'medium',
      'LOW': 'low',
    };
    
    const statusMap: { [key: string]: Task['status'] } = {
      'PENDING': 'todo',
      'TODO': 'todo',
      'IN_PROGRESS': 'in_progress',
      'REVIEW': 'review',
      'COMPLETED': 'completed',
      'DONE': 'completed',
    };

    // Determine taskType based on assigneeType from backend
    let taskType: Task['taskType'] = 'work';
    if (item.assigneeType === 'TEAM') {
      taskType = 'team';
    } else if (item.assigneeType === 'EMPLOYEE') {
      taskType = 'individual';
    } else if (item.assigneeType === 'DEPARTMENT') {
      taskType = 'department';
    } else if (item.taskType) {
      taskType = item.taskType;
    }
    
    return {
      id: item.taskId || String(Math.random()),
      title: item.title || 'Task',
      project: item.department || item.project || 'General',
      status: statusMap[(item.status || 'PENDING').toUpperCase()] || 'todo',
      priority: priorityMap[(item.priority || 'P3').toUpperCase()] || 'medium',
      dueDate: item.deadlineAt ? new Date(item.deadlineAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      estimatedHours: item.estimatedHours || 0,
      timeLogged: item.timeLogged || 0,
      description: item.description || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      assignee: item.assigneeName || `EMP: ${item.employeeId}`,
      assignedBy: item.assignedBy || '',
      createdAt: item.createdAt || new Date().toISOString(),
      comments: Array.isArray(item.comments) ? item.comments : [],
      attachments: Array.isArray(item.attachments) ? item.attachments : [],
      logs: Array.isArray(item.logs) ? item.logs : [],
      taskType: taskType,
      memberCount: item.totalTasksCreated || 0,
      teamMembers: Array.isArray(item.teamMembers) ? item.teamMembers : [],
    };
  };

  const loadTasks = () => {
    (async () => {
      try {
        // Fetch tasks from multiple categories
        const [myTasksData, selfTasksData] = await Promise.all([
          apiGetMyTasks().catch(() => []),
          apiGetSelfTasks().catch(() => []),
        ]);

        const myTasks = (Array.isArray(myTasksData) && myTasksData.length > 0) 
          ? myTasksData.map(mapTaskData) 
          : [];
        
        const selfTasks = (Array.isArray(selfTasksData) && selfTasksData.length > 0) 
          ? selfTasksData.map(mapTaskData).map(t => ({ ...t, taskType: 'self' as Task['taskType'] })) 
          : [];

        // Categorize tasks by assigneeType (now captured in mapTaskData)
        // Team tasks: assigneeType === 'TEAM' (mapped to taskType 'team')
        // Individual tasks: assigneeType === 'EMPLOYEE' (mapped to taskType 'individual')
        // Department tasks: assigneeType === 'DEPARTMENT' (mapped to taskType 'department')
        // Exclude self-tasks to avoid duplicates
        const teamTasks = myTasks.filter((t) => t.taskType === 'team' && !selfTasks.some(st => st.id === t.id));
        const individualTasks = myTasks.filter((t) => t.taskType === 'individual' && !selfTasks.some(st => st.id === t.id));
        const departmentTasks = myTasks.filter((t) => t.taskType === 'department' && !selfTasks.some(st => st.id === t.id));

        setAllTasks({
          my: myTasks,
          self: selfTasks,
          team: teamTasks,
          individual: individualTasks,
          department: departmentTasks,
        });

        // Set displayed tasks based on selected category
        setTasks(myTasks);
        return;
      } catch (err) {
        console.warn('Failed to load tasks from API, falling back to mock tasks.', err);
      }

      const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Update Design System Components',
        project: 'Design System',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2024-03-25',
        estimatedHours: 8,
        timeLogged: 14400,
        description: 'Update button components with new variants and add documentation for developers.',
        tags: ['design', 'components', 'documentation'],
        assignee: 'Alex Chen',
        assignedBy: 'Project Manager',
        createdAt: '2024-03-10',
        comments: [
          { id: 'c1', text: 'Please add hover states to all variants', author: 'Design Lead', date: '2024-03-15', avatar: 'DC' }
        ],
        attachments: [],
        logs: [{ id: 'l1', duration: 7200, date: '2024-03-18', note: 'Initial component updates' }]
      },
      {
        id: '2',
        title: 'Fix Authentication Bug',
        project: 'Platform',
        status: 'review',
        priority: 'urgent',
        dueDate: '2024-03-20',
        estimatedHours: 4,
        timeLogged: 14400,
        description: 'Fix OAuth token expiration issue affecting user sessions.',
        tags: ['backend', 'security', 'bug'],
        assignee: 'Sam Wilson',
        assignedBy: 'Tech Lead',
        createdAt: '2024-03-12',
        comments: [],
        attachments: [],
        logs: [{ id: 'l2', duration: 14400, date: '2024-03-17', note: 'Debug session' }]
      },
      {
        id: '3',
        title: 'Write API Documentation',
        project: 'Developer Platform',
        status: 'todo',
        priority: 'medium',
        dueDate: '2024-04-01',
        estimatedHours: 12,
        timeLogged: 0,
        description: 'Create comprehensive API documentation for new endpoints.',
        tags: ['documentation', 'api', 'backend'],
        assignee: 'Taylor Reed',
        assignedBy: 'Project Manager',
        createdAt: '2024-03-15',
        comments: [],
        attachments: [],
        logs: []
      },
      {
        id: '4',
        title: 'Mobile App UI Redesign',
        project: 'Mobile App',
        status: 'in_progress',
        priority: 'low',
        dueDate: '2024-04-10',
        estimatedHours: 20,
        timeLogged: 18000,
        description: 'Redesign the mobile app UI for better user experience.',
        tags: ['mobile', 'ui', 'design'],
        assignee: 'Jordan Lee',
        assignedBy: 'UX Lead',
        createdAt: '2024-03-01',
        comments: [],
        attachments: [],
        logs: []
      },
      {
        id: '5',
        title: 'Fix Payment Gateway Issue',
        project: 'E-commerce',
        status: 'todo',
        priority: 'urgent',
        dueDate: '2024-03-15',
        estimatedHours: 6,
        timeLogged: 0,
        description: 'Payment gateway integration is failing for certain cards.',
        tags: ['payment', 'bug', 'critical'],
        assignee: 'Chris Brown',
        assignedBy: 'Operations',
        createdAt: '2024-03-05',
        comments: [],
        attachments: [],
        logs: []
      },
      {
        id: '6',
        title: 'Update User Dashboard',
        project: 'Web Platform',
        status: 'completed',
        priority: 'low',
        dueDate: '2024-03-30',
        estimatedHours: 10,
        timeLogged: 36000,
        description: 'Add new widgets to user dashboard.',
        tags: ['frontend', 'dashboard', 'ui'],
        assignee: 'Morgan Taylor',
        assignedBy: 'Product Manager',
        createdAt: '2024-02-28',
        comments: [],
        attachments: [],
        logs: []
      },
      {
        id: '7',
        title: 'Security Audit Report',
        project: 'Platform',
        status: 'todo',
        priority: 'high',
        dueDate: '2024-03-18',
        estimatedHours: 16,
        timeLogged: 7200,
        description: 'Complete security audit and generate report.',
        tags: ['security', 'audit', 'report'],
        assignee: 'Security Team',
        assignedBy: 'CISO',
        createdAt: '2024-03-01',
        comments: [],
        attachments: [],
        logs: []
      },
      {
        id: '8',
        title: 'Database Migration',
        project: 'Backend',
        status: 'in_progress',
        priority: 'medium',
        dueDate: '2024-03-22',
        estimatedHours: 24,
        timeLogged: 43200,
        description: 'Migrate database to new version with zero downtime.',
        tags: ['database', 'migration', 'backend'],
        assignee: 'Database Team',
        assignedBy: 'Tech Lead',
        createdAt: '2024-02-20',
        comments: [],
        attachments: [],
        logs: []
      }
    ];
      
      const teamTasks = mockTasks.filter((t) => t.taskType === 'team' || t.assignee?.includes('Team'));
      const selfTasks = mockTasks.filter((t) => t.id.startsWith('self-'));
      const individualTasks = mockTasks.filter((t) => !t.assignee?.includes('Team'));

      setAllTasks({
        my: mockTasks,
        self: selfTasks,
        team: teamTasks,
        individual: individualTasks,
      });
      
      setTasks(mockTasks);
    })();
  };

  // Handle category and filter changes
  useEffect(() => {
    const categoryTasks = allTasks[selectedCategory] || [];
    
    // Apply status and priority filters
    let filteredTasks = categoryTasks;
    
    if (selectedStatus !== 'all') {
      filteredTasks = filteredTasks.filter((t) => t.status === selectedStatus);
    }
    
    if (selectedPriority !== 'all') {
      filteredTasks = filteredTasks.filter((t) => t.priority === selectedPriority);
    }
    
    setTasks(filteredTasks);
  }, [selectedCategory, selectedStatus, selectedPriority, allTasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Call API to create self-task
    (async () => {
      try {
        const payload = { title, description };
        const response = await createSelfTask(payload);
        console.log('Self-task created:', response);

        // Create local task object for UI - use taskId from response (matches mapTaskData)
        const newTask: Task = {
          id: response?.taskId || response?.id || String(Math.random()),
          title: title,
          project: 'Self-Assigned',
          status: 'todo',
          priority: 'medium',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estimatedHours: 0,
          timeLogged: 0,
          description: description,
          tags: [],
          assignee: 'You',
          assignedBy: undefined,
          createdAt: new Date().toISOString(),
          comments: [],
          attachments: [],
          logs: [],
          taskType: 'self',
        };

        // Add to self-tasks category
        setAllTasks(prev => ({
          ...prev,
          self: [newTask, ...prev.self],
        }));

        setShowAddModal(false);
      } catch (err) {
        console.error('Error creating self-task:', err);
        alert('Failed to create self-task. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const isTaskBreached = (task: Task) => {
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedCardFilter) {
      if (selectedCardFilter.type === 'status' && task.status !== selectedCardFilter.value) return false;
      if (selectedCardFilter.type === 'priority' && task.priority !== selectedCardFilter.value) return false;
      if (selectedCardFilter.type === 'breached') {
        return isTaskBreached(task);
      }
      if (selectedCardFilter.type === 'all') {
        // Do nothing, show all tasks
      }
    }

    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterProject !== 'all' && task.project !== filterProject) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.project.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (task.assignee && task.assignee.toLowerCase().includes(query)) ||
        (task.assignedBy && task.assignedBy.toLowerCase().includes(query))
      );
    }

    return true;
  });

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const clearAllFilters = () => {
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterProject('all');
    setSelectedCardFilter(null);
    setSearchQuery('');
  };

  const getPriorityBorder = (priority: Task['priority']) => {
    const priorityConfig = priorities.find(p => p.id === priority);
    return priorityConfig?.borderColor || 'border-l-gray-200';
  };

  const getSlaLabel = (priority: Task['priority']) => {
    return priorities.find(p => p.id === priority)?.label || '';
  };

  const getProjects = () => {
    return Array.from(new Set(tasks.map(task => task.project)));
  };

  const getBreachedTasks = () => {
    return filteredTasks.filter(task => isTaskBreached(task));
  };

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Title', 'Project', 'Status', 'Priority', 'Due Date', 'Time Logged', 'Assignee', 'Assigned By', 'SLA', 'Breached'],
      ...tasks.map(task => [
        task.title,
        task.project,
        task.status,
        task.priority,
        task.dueDate,
        formatDuration(task.timeLogged),
        task.assignee || '',
        task.assignedBy || '',
        getSlaLabel(task.priority),
        isTaskBreached(task) ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCardClick = (type: string, value: string) => {
    if (selectedCardFilter?.type === type && selectedCardFilter?.value === value) {
      setSelectedCardFilter(null);
    } else {
      setSelectedCardFilter({ type, value });

      if (type !== 'all') {
        setFilterStatus('all');
        setFilterPriority('all');
        setFilterProject('all');
        setSearchQuery('');
      }
    }
  };

  const getCardFilterStyle = (type: string, value: string) => {
    if (selectedCardFilter?.type === type && selectedCardFilter?.value === value) {
      return 'ring-2 ring-blue-500 ring-offset-2';
    }
    return '';
  };

  const toggleStatusSection = (status: keyof typeof showStatusSections) => {
    setShowStatusSections(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const StatusSection: React.FC<{ status: typeof statuses[0] }> = ({ status }) => {
    let tasks = getTasksByStatus(status.id);

    if (selectedCardFilter?.type === 'breached') {
      tasks = tasks.filter(task => isTaskBreached(task));
    }

    if (filterStatus !== 'all' && filterStatus !== status.id) {
      return null;
    }

    if (tasks.length === 0 && filterStatus === 'all') {
      return null;
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status.color}`}>
              <status.icon size={20} />
            </div>
            <div>
              {(() => {
                let displayLabel = status.label;
                if (status.id === 'todo') {
                  if (selectedCategory === 'individual') displayLabel = 'Individual Tasks';
                  else if (selectedCategory === 'self') displayLabel = 'Self Assign Tasks';
                  else displayLabel = 'To Do';
                }
                return (
                  <>
                    <h3 className="font-semibold text-gray-900">{displayLabel}</h3>
                    <p className="text-sm text-gray-600">{tasks.length} tasks</p>
                  </>
                );
              })()}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>
              {tasks.length}
            </span>
            <button
              type="button"
              onClick={() => toggleStatusSection(status.id as keyof typeof showStatusSections)}
              className="text-black p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showStatusSections[status.id as keyof typeof showStatusSections] ? (
                <X size={20} />
              ) : (
                <Plus size={20} />
              )}
            </button>
          </div>
        </div>

        {showStatusSections[status.id as keyof typeof showStatusSections] && (
          <div className="p-4">
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No tasks in this status</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const priority = priorities.find(p => p.id === task.priority);
    const isBreached = isTaskBreached(task);
    const status = statuses.find(s => s.id === task.status);

    return (
      <div
        onClick={() => setSelectedTask(task)}
        className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer ${getPriorityBorder(task.priority)} border-l-4 ${isBreached ? 'border-t-2 border-t-red-500' : ''}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {priority && (
              <span className={`px-2 py-1 text-xs font-medium rounded ${priority.color}`}>
                {priority.label}
              </span>
            )}
          </div>
          {status && (
            <span className={`px-2 py-1 text-xs font-medium rounded ${status.color}`}>
              {status.label}
            </span>
          )}
        </div>

        <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{task.title}</h4>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="font-medium text-gray-700">{task.project}</span>
          <div className="flex items-center gap-2">
            {task.memberCount && task.memberCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                <Users size={12} />
                <span className="font-medium">{task.memberCount}</span>
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>{task.assignee.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </div>

        {task.assignedBy && (
          <div className="text-xs text-gray-500 mb-3">
            <span className="font-medium">By: </span>
            {task.assignedBy}
          </div>
        )}

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className={`flex items-center gap-1 ${isBreached ? 'text-red-600 font-medium' : ''}`}>
            <Calendar size={12} />
            <span>{formatDate(task.dueDate)}</span>
            {isBreached && <AlertTriangle size={12} className="text-red-500" />}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatDuration(task.timeLogged)}</span>
          </div>
        </div>

        {isBreached && (
          <div className="mt-3">
            <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" />
                <span className="text-xs font-medium text-red-700">Task deadline breached</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTaskList = () => {
    return (
      <div className="space-y-4">
        {filteredTasks.map(task => {
          const priority = priorities.find(p => p.id === task.priority);
          const status = statuses.find(s => s.id === task.status);
          const isBreached = isTaskBreached(task);

          return (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer ${getPriorityBorder(task.priority)} border-l-4 ${isBreached ? 'border-t-2 border-t-red-500' : ''}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`px-2 py-1 text-xs font-medium rounded ${priority?.color}`}>
                      {priority?.label}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{task.project}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {task.assignee || 'Unassigned'}
                        </span>
                        {task.memberCount && task.memberCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              <Users size={12} />
                              {task.memberCount} members
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>By: {task.assignedBy || '-'}</span>
                        {isBreached && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Breached
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <div className={`flex items-center gap-1 ${isBreached ? 'text-red-600 font-medium' : ''}`}>
                    <Calendar size={14} />
                    <span className="text-sm">{formatDate(task.dueDate)}</span>
                    {isBreached && <AlertTriangle size={14} className="text-red-500 ml-1" />}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{formatDuration(task.timeLogged)}</span>
                  </div>

                  {status && (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  )}

                  {task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500">Try adjusting your filters or create a new task.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Task Management</h1>
            <p className="text-gray-600 text-sm">Track and manage your team's tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              <Download size={16} />
              <span className="font-medium hidden md:inline">Export</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={16} />
              <span className="font-medium">Self-Assign Task</span>
            </button>
          </div>
        </div>

        {/* Task Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 md:mb-8">
          {[
            { id: 'my' as const, label: 'My Tasks', icon: CheckCircle, color: 'blue' },
            { id: 'team' as const, label: 'Team Tasks', icon: Users, color: 'purple' },
            { id: 'individual' as const, label: 'Individual Tasks', icon: User, color: 'green' },
            { id: 'department' as const, label: 'Dept Tasks', icon: Building2, color: 'red' },
            { id: 'self' as const, label: 'Self Assign Tasks', icon: Zap, color: 'orange' },
          ].map((category) => {
            const Icon = category.icon;
            const categoryCount = allTasks[category.id]?.length || 0;
            const isSelected = selectedCategory === category.id;
            const colorClasses = {
              blue: isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-blue-50',
              purple: isSelected ? 'bg-purple-50 border-purple-300' : 'bg-white hover:bg-purple-50',
              green: isSelected ? 'bg-green-50 border-green-300' : 'bg-white hover:bg-green-50',
              red: isSelected ? 'bg-red-50 border-red-300' : 'bg-white hover:bg-red-50',
              orange: isSelected ? 'bg-orange-50 border-orange-300' : 'bg-white hover:bg-orange-50',
            };

            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                }}
                className={`p-4 rounded-lg border border-gray-200 transition-all cursor-pointer ${colorClasses[category.color]}`}
              >
                <Icon size={24} className="mb-2" />
                <h3 className="font-semibold text-gray-900 text-sm">{category.label}</h3>
                <p className="text-lg font-bold text-gray-900 mt-1">{categoryCount}</p>
              </button>
            );
          })}
        </div>

        {/* Status Filter Bar */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Status</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {[
              { id: 'todo', label: 'To Do' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'review', label: 'On Review' },
              { id: 'completed', label: 'Completed' },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedStatus === status.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter Bar */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Priority</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPriority('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPriority === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {[
              { id: 'urgent', label: 'P1-Urgent' },
              { id: 'high', label: 'P2-High' },
              { id: 'medium', label: 'P3-Medium' },
              { id: 'low', label: 'P4-Low' },
            ].map((priority) => (
              <button
                key={priority.id}
                onClick={() => setSelectedPriority(priority.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPriority === priority.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 md:mb-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Total Tasks */}
          <div
            onClick={() => handleCardClick('all', 'all')}
            className={`bg-white rounded-lg border border-gray-200 p-3 md:p-4 cursor-pointer transition-all hover:shadow-md min-w-[120px] ${getCardFilterStyle('all', 'all')}`}
          >
            <div className="text-lg md:text-2xl font-bold text-gray-900">{tasks.length}</div>
            <div className="text-xs md:text-sm text-gray-600">Total Tasks</div>
          </div>

          {/* Self-assign Tasks */}
          <div
            onClick={() => handleCardClick('status', 'todo')}
            className={`bg-white rounded-lg border border-gray-200 p-3 md:p-4 cursor-pointer transition-all hover:shadow-md min-w-[120px] ${getCardFilterStyle('status', 'todo')}`}
          >
            <div className="text-lg md:text-2xl font-bold text-gray-600">
              {tasks.filter(t => t.status === 'todo').length}
            </div>
            <div className="text-xs md:text-sm text-gray-600">To Do</div>
          </div>

          {/* In Progress */}
          <div
            onClick={() => handleCardClick('status', 'in_progress')}
            className={`bg-white rounded-lg border border-gray-200 p-3 md:p-4 cursor-pointer transition-all hover:shadow-md min-w-[120px] ${getCardFilterStyle('status', 'in_progress')}`}
          >
            <div className="text-lg md:text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.status === 'in_progress').length}
            </div>
            <div className="text-xs md:text-sm text-gray-600">In Progress</div>
          </div>

          {/* On Review */}
          <div
            onClick={() => handleCardClick('status', 'review')}
            className={`bg-white rounded-lg border border-gray-200 p-3 md:p-4 cursor-pointer transition-all hover:shadow-md min-w-[120px] ${getCardFilterStyle('status', 'review')}`}
          >
            <div className="text-lg md:text-2xl font-bold text-yellow-600">
              {tasks.filter(t => t.status === 'review').length}
            </div>
            <div className="text-xs md:text-sm text-gray-600">On Review</div>
          </div>

          {/* Breached */}
          <div
            onClick={() => handleCardClick('breached', 'true')}
            className={`bg-white rounded-lg border border-red-200 p-3 md:p-4 cursor-pointer transition-all hover:shadow-md min-w-[120px] ${getCardFilterStyle('breached', 'true')}`}
          >
            <div className="text-lg md:text-2xl font-bold text-red-600">
              {tasks.filter(isTaskBreached).length}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Breached</div>
          </div>

          {/* Low Priority */}
          <div
            onClick={() => handleCardClick('priority', 'low')}
            className={`bg-white rounded-lg border border-gray-200 p-3 md:p-4 cursor-pointer transition-all hover:shadow-md min-w-[120px] ${getCardFilterStyle('priority', 'low')}`}
          >
            <div className="text-lg md:text-2xl font-bold text-green-500">
              {tasks.filter(t => t.priority === 'low').length}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Low</div>
          </div>

          {/* Medium Priority */}
          <div
            onClick={() => handleCardClick('priority', 'medium')}
            className={`bg-white rounded-lg border border-gray-200 p-3 md:p-4 cursor-pointer transition-all hover:shadow-md min-w-[120px] ${getCardFilterStyle('priority', 'medium')}`}
          >
            <div className="text-lg md:text-2xl font-bold text-yellow-500">
              {tasks.filter(t => t.priority === 'medium').length}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Medium</div>
          </div>

          {/* High Priority */}
          <div
            onClick={() => handleCardClick('priority', 'high')}
            className={`bg-white rounded-lg border border-gray-200 p-3 md:p-4 cursor-pointer transition-all hover:shadow-md min-w-[120px] ${getCardFilterStyle('priority', 'high')}`}
          >
            <div className="text-lg md:text-2xl font-bold text-orange-500">
              {tasks.filter(t => t.priority === 'high').length}
            </div>
            <div className="text-xs md:text-sm text-gray-600">High</div>
          </div>
        </div>
      </div>

      {/* Main Container with Fixed Header and Scrollable Content */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
          {/* FIXED: Scrollable Tasks Area with Hidden Scrollbar */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto mt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ scrollbarGutter: windowWidth < 1024 ? 'stable' : undefined }}>
          <div className="sticky top-0 z-10 bg-gray-50 pt-2 pb-4" style={{ paddingRight: hasVerticalScroll && windowWidth < 1024 ? `${scrollbarWidth + 8}px` : undefined }}>
            {/* Mobile Filters Toggle */}
            <div className="md:hidden mb-4">
              <button
                type="button"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl"
                style={{ paddingRight: hasVerticalScroll && windowWidth < 1024 ? `${scrollbarWidth + 8}px` : undefined }}
              >
                <div className="flex items-center gap-3">
                  <Filter size={20} />
                  <span className="font-medium">Filters</span>
                  {selectedCardFilter || filterStatus !== 'all' || filterPriority !== 'all' || filterProject !== 'all' || searchQuery ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  ) : null}
                </div>
                {showMobileFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {/* Desktop Filters */}
            <div className={`${showMobileFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex flex-wrap gap-3 w-full">
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-gray-400" />
                      <select
                        aria-label="Filter by status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-auto text-black"
                      >
                        <option value="all">All Status</option>
                        {statuses.map(status => (
                          <option key={status.id} value={status.id}>{status.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-gray-400" />
                      <select
                        aria-label="Filter by priority"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-auto text-black"
                      >
                        <option value="all">All Priority</option>
                        {priorities.map(priority => (
                          <option key={priority.id} value={priority.id}>{priority.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      <select
                        aria-label="Filter by project"
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-auto text-black"
                      >
                        <option value="all">All Projects</option>
                        {getProjects().map(project => (
                          <option key={project} value={project}>{project}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                      <Search size={16} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-black"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-normal">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode('board')}
                        className={`p-2 rounded-lg ${viewMode === 'board' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-500 hover:bg-gray-100 border border-transparent'}`}
                        title="Board view"
                        aria-label="Switch to board view"
                      >
                        <Grid size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-500 hover:bg-gray-100 border border-transparent'}`}
                        title="List view"
                        aria-label="Switch to list view"
                      >
                        <List size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks Info Header */}
              <div className="flex items-center justify-between mt-2 px-1">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  Tasks ({filteredTasks.length})
                  {selectedCardFilter?.type === 'breached' && ' • Breached Tasks'}
                  {filterStatus !== 'all' && ` • Filtered: ${statuses.find(s => s.id === filterStatus)?.label}`}
                  {filterPriority !== 'all' && ` • ${priorities.find(p => p.id === filterPriority)?.label}`}
                  {filterProject !== 'all' && ` • ${filterProject}`}
                  {searchQuery && ` • Search: "${searchQuery}"`}
                </h2>
                <div className="text-sm text-gray-500 hidden md:block">
                  Showing {filteredTasks.length} of {tasks.length} tasks
                </div>
              </div>
            </div>
          {viewMode === 'board' ? (
            filteredTasks.length > 0 || selectedCardFilter?.type === 'breached' ? (
              <div className="space-y-6 pb-6">
                {/* Breached Section */}
                {selectedCardFilter?.type === 'breached' && (
                  <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100">
                          <AlertOctagon size={20} className="text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-900">Breached Tasks</h3>
                          <p className="text-sm text-red-600">{filteredTasks.length} overdue tasks</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                          {filteredTasks.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowBreachedSection(!showBreachedSection)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {showBreachedSection ? <X size={20} /> : <Plus size={20} />}
                        </button>
                      </div>
                    </div>

                    {showBreachedSection && (
                      <div className="p-4">
                        {filteredTasks.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTasks.map(task => (
                              <div
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                className={`bg-white rounded-lg border border-red-300 p-4 hover:shadow-md transition-all cursor-pointer ${getPriorityBorder(task.priority)} border-l-4 border-t-2 border-t-red-500`}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-red-500" />
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                      Breached
                                    </span>
                                  </div>
                                  <span className={`px-2 py-1 text-xs font-medium rounded ${priorities.find(p => p.id === task.priority)?.color}`}>
                                    {getSlaLabel(task.priority)}
                                  </span>
                                </div>
                                <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{task.title}</h4>
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                  <span className="font-medium text-gray-700">{task.project}</span>
                                  <div className="flex items-center gap-2">
                                    {task.memberCount && task.memberCount > 0 && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                        <Users size={12} />
                                        <span className="font-medium">{task.memberCount}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <User size={12} />
                                      <span>{task.assignee?.split(' ')[0] || 'Unassigned'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-red-600 font-medium">
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>Due: {formatDate(task.dueDate)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>{formatDuration(task.timeLogged)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <AlertOctagon size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No breached tasks found with current filters</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Status Sections */}
                {selectedCardFilter?.type !== 'breached' && (
                  <>
                    {statuses.map(status => (
                      <StatusSection key={status.id} status={status} />
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matching tasks found</h3>
                <p className="text-gray-500">Try adjusting your filters or create a new task.</p>
              </div>
            )
          ) : (
            <div className="pb-6">
              {renderTaskList()}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Selected Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedTask(null)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row h-full">
                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                  <div className="flex items-start justify-between mb-6 md:mb-8">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">{selectedTask.project}</span>
                        <span className="text-sm text-gray-400 hidden md:inline">•</span>
                        <span className="text-sm text-gray-600">
                          Created {formatDate(selectedTask.createdAt)}
                        </span>
                        {isTaskBreached(selectedTask) && (
                          <>
                            <span className="text-sm text-gray-400 hidden md:inline">•</span>
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                              Breached
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTask(null)}
                      className="text-black p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Close task details"
                      aria-label="Close task details"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="border-b border-gray-200 mb-6 md:mb-8">
                    <div className="flex space-x-4 md:space-x-8 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                      {(['overview', 'comments', 'files'] as const).map(tab => (
                        <button
                          type="button"
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${activeTab === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 md:space-y-8">
                    {activeTab === 'overview' && (
                      <>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Description</h3>
                          <p className="text-gray-700 text-sm md:text-base">{selectedTask.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Status</div>
                            <div className="font-medium text-gray-900 mt-1 text-sm md:text-base capitalize">
                              {selectedTask.status === 'todo' ? 'To Do' : selectedTask.status.replace('_', ' ')}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                            <div className="text-sm text-gray-600">SLA</div>
                            <div className="font-medium text-gray-900 mt-1 text-sm md:text-base">
                              {getSlaLabel(selectedTask.priority)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Due Date</div>
                            <div className="font-medium text-gray-900 mt-1 text-sm md:text-base">
                              {formatDate(selectedTask.dueDate)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Estimated</div>
                            <div className="font-medium text-gray-900 mt-1 text-sm md:text-base">
                              {selectedTask.estimatedHours}h
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Assigned To</div>
                            <div className="font-medium text-gray-900 mt-1 text-sm md:text-base">
                              {selectedTask.assignee || 'Unassigned'}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Assigned By</div>
                            <div className="font-medium text-gray-900 mt-1 text-sm md:text-base">
                              {selectedTask.assignedBy || '-'}
                            </div>
                          </div>
                        </div>

                        {selectedTask.tags.length > 0 && (
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedTask.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 md:px-3 py-1 bg-blue-100 text-blue-800 text-xs md:text-sm rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Manual Status Update</h3>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {statuses.map(status => (
                              <button
                                type="button"
                                key={status.id}
                                onClick={() => updateTaskStatus(selectedTask.id, status.id as Task['status'])}
                                className={`px-3 md:px-4 py-2 md:py-3 rounded-lg border transition-colors text-sm ${selectedTask.status === status.id
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300'
                                  }`}
                              >
                                {status.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-80 border-t md:border-l md:border-t-0 border-gray-200 p-4 md:p-8">
                  <div className="space-y-4 md:space-y-6">
                    {(selectedTask.taskType === 'self' || allTasks.self.some(t => t.id === selectedTask.id)) && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">Quick Actions</h3>
                        <div className="space-y-2 md:space-y-3">
                          <button
                            type="button"
                            onClick={() => {
                              updateTaskStatus(selectedTask.id, 'in_progress');
                            }}
                            className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            <Zap size={16} />
                            <span>Start Task</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!window.confirm('Delete this self-assigned task? This action cannot be undone.')) return;
                              (async () => {
                                try {
                                  console.log('Deleting task - selectedTask:', selectedTask);
                                  console.log('Task ID being sent:', selectedTask.id, 'Type:', typeof selectedTask.id);
                                  await deleteSelfTask(selectedTask.id);
                                  console.log('Delete successful');

                                  // Remove task from displayed lists
                                  setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
                                  setAllTasks(prev => ({
                                    my: prev.my.filter(t => t.id !== selectedTask.id),
                                    self: prev.self.filter(t => t.id !== selectedTask.id),
                                    team: prev.team.filter(t => t.id !== selectedTask.id),
                                    individual: prev.individual.filter(t => t.id !== selectedTask.id),
                                    department: prev.department.filter(t => t.id !== selectedTask.id),
                                  }));
                                  setSelectedTask(null);
                                } catch (err: any) {
                                  console.error('Failed to delete self-task', err);
                                  alert('Failed to delete task. Please try again.');
                                }
                              })();
                            }}
                            className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm"
                          >
                            <Trash2 size={16} />
                            <span>Delete Task</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedTask.teamMembers && selectedTask.teamMembers.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">Team Members</h3>
                        <div className="space-y-2">
                          {selectedTask.teamMembers.map((member, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-medium text-sm text-gray-900">{member.name}</div>
                                  <div className="text-xs text-gray-600 mt-1">{member.employeeId}</div>
                                  <div className="text-xs text-gray-600">{member.email}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">Progress</h3>
                      <div className="space-y-3 md:space-y-4">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Time Logged</span>
                            <span>{formatDuration(selectedTask.timeLogged)}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${selectedTask.status === 'completed' ? 'bg-green-500' : selectedTask.status === 'review' ? 'bg-amber-500' : 'bg-blue-500'}`}
                              style={{
                                width: `${Math.min(100, Math.max(0, (selectedTask.timeLogged / (selectedTask.estimatedHours * 3600 || 1)) * 100))}%`
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedTask.estimatedHours > 0 && (
                            <>
                              {Math.min(100, Math.max(0, (selectedTask.timeLogged / (selectedTask.estimatedHours * 3600)) * 100)).toFixed(1)}%
                              of {selectedTask.estimatedHours}h estimated
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 md:pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Task Information</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">ID:</span>
                          <span className="font-medium text-sm">{selectedTask.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">Created:</span>
                          <span className="font-medium text-sm">{formatDate(selectedTask.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">Breached:</span>
                          <span className={`font-medium text-sm ${isTaskBreached(selectedTask) ? 'text-red-500' : 'text-green-500'}`}>
                            {isTaskBreached(selectedTask) ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
                <h2 className="text-xl font-semibold text-gray-900">Create New Self-Assigned Task</h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-black p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close modal"
                  aria-label="Close create task modal"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddTask} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="title"
                      type="text"
                      required
                      placeholder="Enter task title"
                      className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      required
                      placeholder="Describe the task..."
                      className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm md:text-base"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm md:text-base"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    Create Self-Assigned Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;