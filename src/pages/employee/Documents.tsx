import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Download, Search, Filter, Loader2,
  CheckCircle, X, File, FileImage, ExternalLink,
  Folder, MoreVertical, Share2, Info, Lock, Eye, Edit3, Building,
  ChevronRight, HardDrive, ShieldCheck, Briefcase, CreditCard, BookOpen,
  AlertCircle, Unlock, User, Check, History, Layers,
  LayoutGrid, List, LockKeyhole, EyeOff, ShieldAlert, FileUp, Database,
  ArrowRight, CheckCircle2, MoreHorizontal, Calendar as CalendarIcon,
  Tag as TagIcon, Clock, Sparkles, Command, SlidersHorizontal, Shield, Wand2, BrainCircuit,
  Mail, Inbox, FileCheck, Receipt, BadgeCheck, Globe, Key, FileCode,
  Star, TrendingUp, PieChart, ArrowUpRight, ArrowDownLeft, Bell, Settings,
  Grid3x3, PanelLeft, PanelRight, PanelTop, SearchX, Plus, Menu, AlertTriangle
} from 'lucide-react';
import { getUserSpecificKey } from '../../utils/storage.ts';
import { getMyDocuments, uploadDocument } from '../../api/documents.js';
import { useAuth } from '../../context/AuthContext.tsx';
import { GoogleGenAI, Type } from "@google/genai";

interface DocumentRecord {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  type: string;
  size: string;
  uploaded: string;
  status: 'Verified' | 'Pending' | 'Flagged';
  access: 'Private' | 'HR' | 'Manager' | 'Public';
  notes?: string;
  color: string;
  isLocked?: boolean;
  aiSummary?: string;
  starred?: boolean;
  tags?: string[];
  fileUrl?: string;
  fileType?: string;
}

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [activeFolder, setActiveFolder] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Verified' | 'Pending' | 'Flagged' | 'PDF' | 'Image' | 'Contract'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('Personal');
  const [uploadSubCategory, setUploadSubCategory] = useState('Aadhar Card');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Preview States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>('');

  // AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Reset state when user changes
  useEffect(() => {
    setActiveFolder('All');
    setSearchQuery('');
    setActiveFilter('All');
    setViewMode('grid');
    setSelectedDoc(null);
    setShowDocModal(false);
    setDocuments([]);
    setIsAnalyzing(false);
    setIsSummarizing(false);
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadError('');
    setUploadSuccess(false);
  }, [user?.id]);

  const librarySchema = [
    { id: 'Personal', name: 'Personal Documents', icon: User, subs: ['Aadhar Card', 'PAN Card', 'Passport', 'Driving License', 'Voter ID'], color: 'violet', count: 0 },
    { id: 'Employment', name: 'Employment Letters', icon: Briefcase, subs: ['Offer Letters', 'Appointment Letters', 'Promotion Letters', 'Experience Letters', 'Relieving Letters'], color: 'blue', count: 0 },
    { id: 'Financial', name: 'Financial Documents', icon: CreditCard, subs: ['Salary Certificates', 'Pay Slips', 'Form 16', 'Investment Proofs', 'Bonus Letters'], color: 'emerald', count: 0 },
    { id: 'Legal', name: 'Legal Documents', icon: ShieldCheck, subs: ['NDA Agreements', 'Non-Compete', 'Contract Agreements', 'Service Agreements', 'Legal Notices'], color: 'amber', count: 0 },
    { id: 'IT', name: 'IT & Access', icon: Key, subs: ['VPN Letters', 'Software Licenses', 'Access Credentials', 'Hardware Requests', 'IT Approvals'], color: 'indigo', count: 0 },
    { id: 'Company', name: 'Company Policy', icon: Building, subs: ['Employee Handbook', 'Policy Documents', 'Procedure Manuals', 'Code of Conduct', 'Compliance Docs'], color: 'rose', count: 0 },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiDocs: any = await getMyDocuments();
        if (Array.isArray(apiDocs) && apiDocs.length > 0) {
          const mapped: DocumentRecord[] = apiDocs.map((d: any, index: number) => {
            const fileType = (d.fileType || '').toLowerCase();
            const extType = fileType.includes('pdf') ? 'PDF' : fileType.includes('image') ? 'JPG' : 'FILE';
            const mapDocType: Record<string, string> = {
              'AADHAAR': 'Aadhar Card',
              'PAN': 'PAN Card',
              'CERTIFICATES': 'Certificates',
              'OFFER_LETTER': 'Offer Letters'
            };
            return {
              id: String(d.id),
              name: d.fileName || `document_${d.id}`,
              category: 'Personal',
              subCategory: mapDocType[d.documentType] || d.documentType || 'General',
              type: extType,
              size: d.fileSize ? `${Math.round(d.fileSize / 1024)} KB` : 'N/A',
              uploaded: d.uploadedAt ? d.uploadedAt.split('T')[0] : '',
              status: d.uploadedAt ? 'Verified' : 'Pending',
              access: 'Private',
              notes: '',
              color: getColorForCategory('Personal'),
              starred: index % 3 === 0,
              tags: [],
              fileUrl: d.fileUrl || '',
              fileType: d.fileType || ''
            } as DocumentRecord;
          });
          setDocuments(mapped);
          localStorage.setItem(getUserSpecificKey('user_documents_v8'), JSON.stringify(mapped));
          return;
        }
      } catch (err) {
        console.warn('Failed to load documents from API, falling back to local data', err);
      }

      // Fallback to existing local mock if API returns nothing or fails
      const saved = JSON.parse(localStorage.getItem(getUserSpecificKey('user_documents_v8')) || '[]');
      if (saved.length) {
        setDocuments(saved.map((doc: DocumentRecord, index: number) => ({
          ...doc,
          starred: index % 3 === 0
        })));
      }
    };

    loadData();

    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const getColorForCategory = (category: string): string => {
    const colors: Record<string, string> = {
      'Personal': 'from-violet-500/20 to-violet-600/10 border-violet-500/20',
      'Employment': 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
      'Financial': 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
      'Legal': 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
      'IT': 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/20',
      'Company': 'from-rose-500/20 to-rose-600/10 border-rose-500/20',
    };
    return `bg-gradient-to-br ${colors[category] || colors.Personal}`;
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
    setUploadError('');
    setUploadSuccess(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB limit');
        return;
      }
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('File type not supported. Please upload PDF, image, or document files.');
        return;
      }
      setUploadFile(file);
      setUploadError('');
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    if (!user?.id) {
      setUploadError('User information not available');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const result = await uploadDocument(uploadFile, {
        employeeId: user.id,
        documentType: uploadSubCategory
      });

      // Create a local URL for preview
      const localUrl = URL.createObjectURL(uploadFile);

      // Add new document to the list
      const newDoc: DocumentRecord = {
        id: String(result.id || Date.now()),
        name: uploadFile.name,
        category: uploadCategory,
        subCategory: uploadSubCategory,
        type: uploadFile.type.includes('pdf') ? 'PDF' : uploadFile.type.includes('image') ? 'JPG' : 'FILE',
        size: `${Math.round(uploadFile.size / 1024)} KB`,
        uploaded: new Date().toISOString().split('T')[0],
        status: 'Pending',
        access: 'Private',
        notes: '',
        color: getColorForCategory(uploadCategory),
        starred: false,
        tags: [],
        fileUrl: localUrl,
        fileType: uploadFile.type
      };

      setDocuments(prev => [newDoc, ...prev]);
      const updated = [newDoc, ...documents];
      localStorage.setItem(getUserSpecificKey('user_documents_v8'), JSON.stringify(updated));

      setUploadSuccess(true);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadCategory('Personal');
        setUploadSubCategory('Aadhar Card');
        setUploadSuccess(false);
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setUploadError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentClick = (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setShowDocModal(true);
    setRecentlyViewed(prev => [doc.id, ...prev.filter(id => id !== doc.id)].slice(0, 5));
  };

  const handleDownload = (doc: DocumentRecord, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (doc.fileUrl) {
      // If we have a file URL, create a link and click it
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback: create a dummy download
      alert(`Downloading ${doc.name}`);
    }
  };

  const handlePreview = (doc: DocumentRecord, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (doc.fileUrl) {
      setPreviewUrl(doc.fileUrl);
      setPreviewType(doc.fileType || '');
      setShowPreviewModal(true);
    } else {
      // If no file URL, try to open in new tab with blob data
      alert(`Preview not available for ${doc.name}`);
    }
  };

  const toggleStarred = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, starred: !doc.starred } : doc
    ));
  };

  const summarizeDocumentWithAI = async (doc: DocumentRecord) => {
    if (!doc) return;
    setIsSummarizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a professional, concise executive summary for a document named "${doc.name}" filed under ${doc.category}/${doc.subCategory}. The summary should explain its likely purpose and importance in an HR/Employee context. Mention its status is ${doc.status}.`,
      });

      const summary = response.text?.trim() || "No summary available.";
      const updated = documents.map(d => d.id === doc.id ? { ...d, aiSummary: summary } : d);
      setDocuments(updated);
      setSelectedDoc({ ...doc, aiSummary: summary });
      localStorage.setItem(getUserSpecificKey('user_documents_v7'), JSON.stringify(updated));
    } catch (error) {
      console.error("AI Summarization failed:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesFolder = activeFolder === 'All' || doc.category === activeFolder;

    const matchesSearch = searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesQuickFilter = true;
    if (activeFilter !== 'All') {
      switch (activeFilter) {
        case 'Verified':
          matchesQuickFilter = doc.status === 'Verified';
          break;
        case 'Pending':
          matchesQuickFilter = doc.status === 'Pending';
          break;
        case 'Flagged':
          matchesQuickFilter = doc.status === 'Flagged';
          break;
        case 'PDF':
          matchesQuickFilter = doc.type === 'PDF';
          break;
        case 'Image':
          matchesQuickFilter = doc.type === 'JPG' || doc.type === 'PNG' || doc.type === 'JPEG';
          break;
        case 'Contract':
          matchesQuickFilter = doc.subCategory.toLowerCase().includes('contract') ||
            doc.name.toLowerCase().includes('contract');
          break;
        default:
          matchesQuickFilter = true;
      }
    }

    return matchesFolder && matchesSearch && matchesQuickFilter;
  });

  // Calculate stats
  const verifiedCount = documents.filter(d => d.status === 'Verified').length;
  const pendingCount = documents.filter(d => d.status === 'Pending').length;
  const starredCount = documents.filter(d => d.starred).length;

  // Update category counts
  librarySchema.forEach(cat => {
    cat.count = documents.filter(d => d.category === cat.id).length;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header - Only visible on mobile */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 truncate">Documents</h1>
          </div>
          {/* Mobile Upload Button */}
          <button
            onClick={handleUploadClick}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
            aria-label="Upload document"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 w-64 block lg:hidden' : 'hidden lg:block lg:relative lg:w-64'
          }`}>
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              {/* Close button for mobile */}
              {isMobileMenuOpen && (
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg"
                  aria-label="Close sidebar menu"
                >
                  <X size={20} />
                </button>
              )}

              {/* Quick Actions - Desktop */}
              <button
                onClick={handleUploadClick}
                className="hidden lg:flex w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-3 items-center justify-center gap-2 mb-4 hover:shadow-lg transition-all">
                <Plus size={20} />
                <span className="text-sm font-medium">Upload Document</span>
              </button>

              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveFolder('All');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeFolder === 'All' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Mail size={20} />
                  <span className="flex-1 text-sm font-medium text-left">All Letters</span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">{documents.length}</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-100"
                >
                  <Star size={20} />
                  <span className="flex-1 text-sm font-medium text-left">Starred</span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">{starredCount}</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-100"
                >
                  <History size={20} />
                  <span className="flex-1 text-sm font-medium text-left">Recent</span>
                </button>

                <div className="h-px bg-slate-200 my-3"></div>

                {librarySchema.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setActiveFolder(folder.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeFolder === folder.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <folder.icon size={20} />
                    <span className="flex-1 text-sm font-medium text-left truncate">{folder.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full bg-${folder.color}-100 text-${folder.color}-700`}>
                      {folder.count}
                    </span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles size={16} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">AI Assistant</p>
                      <p className="text-xs text-slate-600">Smart analysis enabled</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-hidden">
          {/* Search and Filters Bar */}
          <div className="bg-white border-b border-slate-200 sticky top-14 lg:top-0 z-20">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-all ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <SlidersHorizontal size={18} />
                </button>
                <div className="hidden sm:flex gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Verified', 'Pending', 'Flagged', 'PDF', 'Image', 'Contract'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => {
                          setActiveFilter(filter as any);
                          setSearchQuery('');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFilter === filter
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4">
            {/* Header with stats */}
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {activeFolder === 'All' ? 'All Documents' : librarySchema.find(f => f.id === activeFolder)?.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'} found
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">{verifiedCount}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">{pendingCount}</span>
                </div>
              </div>
            </div>

            {/* Documents Grid/List */}
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <SearchX size={24} className="text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">No documents found</h3>
                <p className="text-xs text-slate-500 mb-4">
                  {activeFilter !== 'All'
                    ? `No ${activeFilter.toLowerCase()} documents match your criteria`
                    : 'No documents available in this category'}
                </p>
                <button
                  onClick={() => {
                    setActiveFilter('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredDocs.map(doc => {
                  const folder = librarySchema.find(f => f.id === doc.category);
                  const colorMap = {
                    violet: 'border-violet-200 bg-violet-50',
                    blue: 'border-blue-200 bg-blue-50',
                    emerald: 'border-emerald-200 bg-emerald-50',
                    amber: 'border-amber-200 bg-amber-50',
                    indigo: 'border-indigo-200 bg-indigo-50',
                    rose: 'border-rose-200 bg-rose-50',
                  };
                  const colorClass = colorMap[folder?.color as keyof typeof colorMap] || 'border-slate-200 bg-slate-50';

                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className="bg-white rounded-xl border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-all relative"
                    >
                      {/* Star button */}
                      <button
                        onClick={(e) => toggleStarred(doc.id, e)}
                        className={`absolute top-2 right-2 p-1 rounded-lg ${doc.starred ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star size={14} fill={doc.starred ? 'currentColor' : 'none'} />
                      </button>

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${colorClass}`}>
                        {doc.type === 'PDF' ? (
                          <FileText size={18} className="text-blue-600" />
                        ) : doc.type === 'JPG' || doc.type === 'PNG' ? (
                          <FileImage size={18} className="text-purple-600" />
                        ) : (
                          <File size={18} className="text-emerald-600" />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xs font-semibold text-slate-900 mb-1 line-clamp-1">{doc.name}</h3>

                      {/* Category */}
                      <div className="flex items-center gap-1 mb-2">
                        {folder && <folder.icon size={10} className="text-slate-400" />}
                        <span className="text-[10px] text-slate-600 line-clamp-1">{doc.subCategory}</span>
                      </div>

                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium
                        ${doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' :
                          doc.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'}`}>
                        {doc.status === 'Verified' && <CheckCircle size={8} />}
                        {doc.status}
                      </span>

                      {/* Quick action buttons for grid view */}
                      <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={(e) => handlePreview(doc, e)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye size={14} className="text-slate-600" />
                        </button>
                        <button
                          onClick={(e) => handleDownload(doc, e)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={14} className="text-slate-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View - Mobile Optimized */
              <div className="space-y-2">
                {filteredDocs.map(doc => {
                  const folder = librarySchema.find(f => f.id === doc.category);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className="bg-white rounded-xl border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => toggleStarred(doc.id, e)}
                          className={`p-1 rounded-lg mt-0.5 ${doc.starred ? 'text-amber-500' : 'text-slate-300'}`}
                        >
                          <Star size={14} fill={doc.starred ? 'currentColor' : 'none'} />
                        </button>

                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.color}`}>
                          {doc.type === 'PDF' ? (
                            <FileText size={18} className="text-blue-600" />
                          ) : doc.type === 'JPG' || doc.type === 'PNG' ? (
                            <FileImage size={18} className="text-purple-600" />
                          ) : (
                            <File size={18} className="text-emerald-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{doc.name}</h4>
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap
                              ${doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' :
                                doc.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                  'bg-rose-100 text-rose-700'}`}>
                              {doc.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            {folder && <folder.icon size={10} className="text-slate-400" />}
                            <span className="text-[10px] text-slate-500 line-clamp-1">{doc.subCategory}</span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10px] text-slate-500">{doc.size}</span>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]
                              ${doc.access === 'Private' ? 'bg-slate-100 text-slate-700' :
                                doc.access === 'HR' ? 'bg-blue-100 text-blue-700' :
                                  doc.access === 'Manager' ? 'bg-purple-100 text-purple-700' :
                                    'bg-emerald-100 text-emerald-700'}`}>
                              {doc.access === 'Private' && <Lock size={8} />}
                              {doc.access}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => handlePreview(doc, e)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye size={14} className="text-slate-600" />
                              </button>
                              <button
                                onClick={(e) => handleDownload(doc, e)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download size={14} className="text-slate-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileUp size={20} className="text-blue-600" />
                Upload Document
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadError('');
                  setUploadSuccess(false);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Upload Successful!</h3>
                <p className="text-sm text-slate-500">Your document has been uploaded and is pending verification.</p>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {uploadError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                    <AlertTriangle size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-rose-700">{uploadError}</p>
                  </div>
                )}

                {/* File Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-900 mb-2">Select File</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${uploadFile
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-300 bg-slate-50 hover:border-blue-400'
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      aria-label="Upload document file"
                    />
                    {uploadFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileCheck size={20} className="text-emerald-600" />
                        <div>
                          <p className="font-medium text-slate-900">{uploadFile.name}</p>
                          <p className="text-xs text-slate-500">{Math.round(uploadFile.size / 1024)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <FileUp size={24} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-slate-900">Click to browse or drag file</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-900 mb-2">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => {
                      setUploadCategory(e.target.value);
                      const folder = librarySchema.find(f => f.id === e.target.value);
                      setUploadSubCategory(folder?.subs[0] || '');
                    }}
                    aria-label="Select document category"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 bg-white"
                  >
                    {librarySchema.map(folder => (
                      <option key={folder.id} value={folder.id} className="text-slate-900">{folder.name}</option>
                    ))}
                  </select>
                </div>

                {/* SubCategory Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-900 mb-2">Document Type</label>
                  <select
                    value={uploadSubCategory}
                    onChange={(e) => setUploadSubCategory(e.target.value)}
                    aria-label="Select document type"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 bg-white"
                  >
                    {librarySchema
                      .find(f => f.id === uploadCategory)
                      ?.subs.map(sub => (
                        <option key={sub} value={sub} className="text-slate-900">{sub}</option>
                      ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadError('');
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={!uploadFile || isUploading}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FileUp size={16} />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Document Details Modal */}
      {showDocModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="w-full bg-white rounded-t-xl max-h-[90vh] overflow-y-auto sm:max-w-lg sm:rounded-xl">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-start justify-between sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedDoc.color}`}>
                  {selectedDoc.type === 'PDF' ? (
                    <FileText size={20} className="text-blue-600" />
                  ) : selectedDoc.type === 'JPG' || selectedDoc.type === 'PNG' ? (
                    <FileImage size={20} className="text-purple-600" />
                  ) : (
                    <File size={20} className="text-emerald-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 mb-0.5 line-clamp-1">{selectedDoc.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{selectedDoc.type}</span>
                    <span>•</span>
                    <span>{selectedDoc.size}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDocModal(false);
                  setSelectedDoc(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {/* Status and Access */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                  ${selectedDoc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' :
                    selectedDoc.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'}`}>
                  {selectedDoc.status === 'Verified' && <CheckCircle size={12} />}
                  {selectedDoc.status}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                  ${selectedDoc.access === 'Private' ? 'bg-slate-100 text-slate-700' :
                    selectedDoc.access === 'HR' ? 'bg-blue-100 text-blue-700' :
                      selectedDoc.access === 'Manager' ? 'bg-purple-100 text-purple-700' :
                        'bg-emerald-100 text-emerald-700'}`}>
                  {selectedDoc.access === 'Private' && <Lock size={10} />}
                  {selectedDoc.access} Access
                </span>
              </div>

              {/* AI Summary */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                    <Sparkles size={12} className="text-blue-600" />
                    AI Summary
                  </h3>
                  {!selectedDoc.aiSummary && (
                    <button
                      onClick={() => summarizeDocumentWithAI(selectedDoc)}
                      disabled={isSummarizing}
                      className="text-[10px] font-medium text-blue-600 flex items-center gap-1"
                    >
                      {isSummarizing ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                      {isSummarizing ? 'Analyzing...' : 'Generate'}
                    </button>
                  )}
                </div>
                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                  {isSummarizing ? (
                    <div className="flex items-center gap-2 py-1">
                      <BrainCircuit size={14} className="text-blue-600 animate-pulse" />
                      <p className="text-xs text-blue-700">Analyzing document content...</p>
                    </div>
                  ) : selectedDoc.aiSummary ? (
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedDoc.aiSummary}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-1">
                      Click generate for AI summary
                    </p>
                  )}
                </div>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <label className="text-[10px] text-slate-500 mb-1 block">Category</label>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium text-slate-900">{selectedDoc.category}</span>
                    <ChevronRight size={8} className="text-slate-400" />
                    <span className="text-slate-600">{selectedDoc.subCategory}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <label className="text-[10px] text-slate-500 mb-1 block">Upload Date</label>
                  <div className="flex items-center gap-1 text-xs">
                    <CalendarIcon size={10} className="text-slate-400" />
                    <span className="font-medium text-slate-900">{selectedDoc.uploaded}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => {
                    handlePreview(selectedDoc);
                    setShowDocModal(false);
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                >
                  <Eye size={16} />
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden">
            {/* Preview Header */}
            <div className="absolute top-0 left-0 right-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
              <h3 className="text-sm font-semibold text-slate-900">Document Preview</h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewUrl(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="w-full h-full pt-16 pb-4 px-4 overflow-auto">
              {previewType.includes('image') ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain mx-auto"
                />
              ) : previewType.includes('pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px]"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600">Preview not available for this file type</p>
                    <button
                      onClick={() => {
                        setShowPreviewModal(false);
                        setShowDocModal(true);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Back to Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;