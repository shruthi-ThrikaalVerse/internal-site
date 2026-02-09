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
  Mail, Inbox, FileCheck, Receipt, BadgeCheck, Globe, Key, FileCode
} from 'lucide-react';
import { getUserSpecificKey } from '../../utils/storage.ts';
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
}

const Documents: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Verified' | 'Pending' | 'Flagged' | 'PDF' | 'Image' | 'Contract'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  // AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const librarySchema = [
    { id: 'Personal', name: 'Personal Documents', icon: User, subs: ['Aadhar Card', 'PAN Card', 'Passport', 'Driving License', 'Voter ID'], color: 'from-purple-500 to-purple-700' },
    { id: 'Employment', name: 'Employment Letters', icon: Briefcase, subs: ['Offer Letters', 'Appointment Letters', 'Promotion Letters', 'Experience Letters', 'Relieving Letters'], color: 'from-blue-500 to-blue-700' },
    { id: 'Financial', name: 'Financial Documents', icon: CreditCard, subs: ['Salary Certificates', 'Pay Slips', 'Form 16', 'Investment Proofs', 'Bonus Letters'], color: 'from-emerald-500 to-emerald-700' },
    { id: 'Legal', name: 'Legal Documents', icon: ShieldCheck, subs: ['NDA Agreements', 'Non-Compete', 'Contract Agreements', 'Service Agreements', 'Legal Notices'], color: 'from-amber-500 to-amber-700' },
    { id: 'IT', name: 'IT & Access', icon: Key, subs: ['VPN Letters', 'Software Licenses', 'Access Credentials', 'Hardware Requests', 'IT Approvals'], color: 'from-indigo-500 to-indigo-700' },
    { id: 'Company', name: 'Company Policy', icon: Building, subs: ['Employee Handbook', 'Policy Documents', 'Procedure Manuals', 'Code of Conduct', 'Compliance Docs'], color: 'from-red-500 to-red-700' },
  ];

  useEffect(() => {
    const loadData = () => {
      const saved = JSON.parse(localStorage.getItem(getUserSpecificKey('user_documents_v8')) || '[]');
      if (saved.length === 0) {
        const initial: DocumentRecord[] = [
          // Personal Documents (Aadhar, PAN, etc.)
          {
            id: 'doc-1',
            name: 'Aadhar_Card_Sarah_Kumar.pdf',
            category: 'Personal',
            subCategory: 'Aadhar Card',
            type: 'PDF',
            size: '1.5 MB',
            uploaded: '2024-01-15',
            status: 'Verified',
            access: 'Private',
            notes: 'Government issued identity proof with photo and biometric details.',
            color: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20'
          },
          {
            id: 'doc-2',
            name: 'PAN_Card_Sarah_Kumar.jpg',
            category: 'Personal',
            subCategory: 'PAN Card',
            type: 'JPG',
            size: '980 KB',
            uploaded: '2024-01-15',
            status: 'Verified',
            access: 'Private',
            notes: 'Permanent Account Number card for tax purposes.',
            color: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20',
            isLocked: true
          },
          {
            id: 'doc-3',
            name: 'Passport_Sarah_Kumar.pdf',
            category: 'Personal',
            subCategory: 'Passport',
            type: 'PDF',
            size: '2.8 MB',
            uploaded: '2024-02-10',
            status: 'Verified',
            access: 'Private',
            color: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20'
          },
          {
            id: 'doc-4',
            name: 'Driving_License_Sarah_Kumar.pdf',
            category: 'Personal',
            subCategory: 'Driving License',
            type: 'PDF',
            size: '1.2 MB',
            uploaded: '2024-02-15',
            status: 'Pending',
            access: 'Private',
            notes: 'Awaiting verification by HR department.',
            color: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20'
          },
          
          // Employment Letters
          {
            id: 'doc-5',
            name: 'Offer_Letter_Sarah_March_2024.pdf',
            category: 'Employment',
            subCategory: 'Offer Letters',
            type: 'PDF',
            size: '1.8 MB',
            uploaded: '2024-03-15',
            status: 'Verified',
            access: 'Private',
            notes: 'Signed offer letter with position details and compensation.',
            color: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20'
          },
          {
            id: 'doc-6',
            name: 'Promotion_Letter_Dec_2023.pdf',
            category: 'Employment',
            subCategory: 'Promotion Letters',
            type: 'PDF',
            size: '1.2 MB',
            uploaded: '2023-12-10',
            status: 'Verified',
            access: 'Private',
            color: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20'
          },
          {
            id: 'doc-7',
            name: 'Experience_Certificate_2022-2024.pdf',
            category: 'Employment',
            subCategory: 'Experience Letters',
            type: 'PDF',
            size: '2.1 MB',
            uploaded: '2024-03-28',
            status: 'Verified',
            access: 'HR',
            notes: 'Detailed experience certificate for previous employment period.',
            color: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20'
          },
          
          // Financial Documents
          {
            id: 'doc-8',
            name: 'Salary_Certificate_March_2024.pdf',
            category: 'Financial',
            subCategory: 'Salary Certificates',
            type: 'PDF',
            size: '850 KB',
            uploaded: '2024-03-31',
            status: 'Pending',
            access: 'Private',
            notes: 'Awaiting HR approval. Expected clearance: 48 hours.',
            color: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20'
          },
          {
            id: 'doc-9',
            name: 'Form_16_2023_2024.pdf',
            category: 'Financial',
            subCategory: 'Form 16',
            type: 'PDF',
            size: '1.5 MB',
            uploaded: '2024-04-01',
            status: 'Verified',
            access: 'Private',
            notes: 'Tax deduction certificate for financial year 2023-24.',
            color: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20'
          },
          
          // Legal Documents
          {
            id: 'doc-10',
            name: 'NDA_Agreement_Signed.pdf',
            category: 'Legal',
            subCategory: 'NDA Agreements',
            type: 'PDF',
            size: '3.2 MB',
            uploaded: '2024-03-25',
            status: 'Flagged',
            access: 'HR',
            notes: 'Requires re-signature. Expiry date approaching.',
            color: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20'
          },
          
          // IT & Access
          {
            id: 'doc-11',
            name: 'VPN_Access_Approval.pdf',
            category: 'IT',
            subCategory: 'VPN Letters',
            type: 'PDF',
            size: '1.1 MB',
            uploaded: '2024-03-20',
            status: 'Verified',
            access: 'Manager',
            color: 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/20'
          },
          
          // Company Policy
          {
            id: 'doc-12',
            name: 'Employee_Handbook_2024.pdf',
            category: 'Company',
            subCategory: 'Employee Handbook',
            type: 'PDF',
            size: '8.7 MB',
            uploaded: '2024-01-05',
            status: 'Verified',
            access: 'Public',
            notes: 'Updated company policies and procedures.',
            color: 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20'
          },
          
          // More Personal Documents
          {
            id: 'doc-13',
            name: 'Voter_ID_Sarah_Kumar.jpg',
            category: 'Personal',
            subCategory: 'Voter ID',
            type: 'JPG',
            size: '1.1 MB',
            uploaded: '2024-02-20',
            status: 'Verified',
            access: 'Private',
            color: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20'
          },
          
          // Additional Financial Documents
          {
            id: 'doc-14',
            name: 'Investment_Proof_2023_24.pdf',
            category: 'Financial',
            subCategory: 'Investment Proofs',
            type: 'PDF',
            size: '2.3 MB',
            uploaded: '2024-03-15',
            status: 'Verified',
            access: 'Private',
            color: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20'
          },
          
          // More Employment Documents
          {
            id: 'doc-15',
            name: 'Appointment_Letter_Project_Lead.pdf',
            category: 'Employment',
            subCategory: 'Appointment Letters',
            type: 'PDF',
            size: '1.9 MB',
            uploaded: '2024-03-10',
            status: 'Verified',
            access: 'Private',
            notes: 'Appointment as Project Lead for Q2 initiatives.',
            color: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20'
          },
        ];
        setDocuments(initial);
        localStorage.setItem(getUserSpecificKey('user_documents_v8'), JSON.stringify(initial));
      } else {
        setDocuments(saved);
      }
    };

    loadData();

    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleDocumentClick = (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setShowDocModal(true);
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

    // Text search filter
    const matchesSearch = searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Quick filter logic
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">E-Letters</h1>
          <p className="text-gray-600 text-sm mt-1">Official letters and documents management system</p>
        </div>

        {/* Stats */}
        <div className="flex gap-4 md:gap-6">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900">{documents.length}</div>
            <div className="text-xs text-gray-600">Total Letters</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600">{verifiedCount}</div>
            <div className="text-xs text-gray-600">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Left Sidebar - Responsive */}
        <div className="lg:w-64 xl:w-72 flex-shrink-0">
          {/* Categories */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Letter Categories</h2>
              <Inbox className="text-blue-600" size={18} />
            </div>

            <nav className="space-y-1 md:space-y-2">
              <button
                onClick={() => {
                  setActiveFolder('All');
                  setActiveFilter('All');
                  setSearchQuery('');
                }}
                className={`w-full flex items-center justify-between px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all text-sm md:text-base ${activeFolder === 'All'
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <Mail size={16} />
                  <span className="font-medium">E-Letters</span>
                </div>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{documents.length}</span>
              </button>

              {librarySchema.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolder(folder.id);
                    setActiveFilter('All');
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all text-sm md:text-base ${activeFolder === folder.id
                    ? 'bg-blue-50 border border-blue-200 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <folder.icon size={16} />
                    <span className="font-medium truncate">{folder.name}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {documents.filter(d => d.category === folder.id).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* AI Info Panel */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-5 border border-blue-100">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">AI Assistant</p>
                <p className="text-sm font-bold text-gray-900">Smart Document Analysis</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              AI-powered classification and summarization enabled for all your official letters.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Sticky Filter Section - Only on lg screens and above */}
          <div className="lg:sticky lg:top-6 lg:z-40 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search letters, categories, or keywords..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActiveFilter('All');
                    }}
                    className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    title="Grid view"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 md:p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    title="List view"
                    onClick={() => setViewMode('list')}
                    className={`p-2 md:p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-1 md:gap-2">
                {['All', 'Verified', 'Pending', 'Flagged', 'PDF', 'Image', 'Contract'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter as any);
                      setSearchQuery('');
                    }}
                    className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${activeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Section with Custom Scrollbar */}
          <div className="flex-1 overflow-hidden">
            {/* Document Count Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-5 gap-2">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                {activeFolder === 'All' ? 'All E-Letters' : librarySchema.find(f => f.id === activeFolder)?.name}
                {activeFilter !== 'All' && (
                  <span className="ml-2 text-xs md:text-sm font-normal text-blue-600">
                    • Filtered by: {activeFilter}
                  </span>
                )}
                <span className="text-gray-600 ml-2 text-xs md:text-sm">({filteredDocs.length} letters)</span>
              </h2>
            </div>

            {/* Documents Grid/List - Scrollable Area */}
            <div className="h-[calc(100vh-350px)] lg:h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
              {filteredDocs.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No letters found</h3>
                  <p className="text-gray-600 mb-6 text-sm md:text-base">
                    {activeFilter !== 'All'
                      ? `No ${activeFilter.toLowerCase()} letters found. Try a different filter.`
                      : 'No letters available'}
                  </p>
                  <button
                    onClick={() => {
                      setActiveFilter('All');
                      setSearchQuery('');
                    }}
                    className="bg-gray-200 text-gray-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm md:text-base"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6 pb-6`}>
                  {filteredDocs.map(doc => {
                    const folder = librarySchema.find(f => f.id === doc.category);

                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleDocumentClick(doc)}
                        className={`group relative bg-white rounded-xl border p-4 md:p-5 cursor-pointer transition-all hover:shadow-lg min-h-[220px] ${selectedDoc?.id === doc.id && showDocModal
                          ? 'ring-2 ring-blue-500/50 border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                          }`}
                      >
                        {/* Letter Icon */}
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center mb-4 ${doc.color}`}>
                          {doc.type === 'PDF' ? (
                            <FileText size={22} className="text-blue-600" />
                          ) : doc.type === 'JPG' || doc.type === 'PNG' ? (
                            <FileImage size={22} className="text-purple-600" />
                          ) : (
                            <File size={22} className="text-emerald-600" />
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-4 md:top-5 right-4 md:right-5">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'Verified' ? 'bg-green-100 text-green-800 border border-green-200' :
                            doc.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            {doc.status === 'Verified' && <CheckCircle size={10} />}
                            {doc.status === 'Pending' && <AlertCircle size={10} />}
                            {doc.status === 'Flagged' && <ShieldAlert size={10} />}
                            <span className="truncate">{doc.status}</span>
                          </div>
                        </div>

                        {/* Letter Name */}
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 truncate">{doc.name}</h3>

                        {/* Category */}
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                          {folder && <folder.icon size={14} className="text-gray-500" />}
                          <span className="text-gray-700 text-xs md:text-sm truncate">{doc.subCategory}</span>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm">
                          <div className="flex items-center gap-2 md:gap-4">
                            <span className="text-gray-600">{doc.size}</span>
                            <span className="text-gray-400 hidden sm:inline">•</span>
                            <span className="text-gray-600">{doc.type}</span>
                          </div>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${doc.access === 'Private' ? 'bg-gray-100 text-gray-800' :
                            doc.access === 'HR' ? 'bg-blue-100 text-blue-800' :
                              doc.access === 'Manager' ? 'bg-purple-100 text-purple-800' :
                                'bg-emerald-100 text-emerald-800'
                            }`}>
                            {doc.access === 'Private' && <Lock size={10} />}
                            {doc.access === 'HR' && <User size={10} />}
                            <span className="truncate">{doc.access}</span>
                          </div>
                        </div>

                        {/* Upload Date */}
                        <div className="flex items-center gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 text-gray-500 text-xs md:text-sm">
                          <CalendarIcon size={12} />
                          {doc.uploaded}
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute bottom-4 md:bottom-5 right-4 md:right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1 md:gap-2">
                          <button
                            title="View document"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentClick(doc);
                            }}
                            className="w-8 h-8 md:w-10 md:h-8 bg-gray-100 hover:bg-blue-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all"
                          >
                            <Eye size={16} />
                          </button>
                          <button title="Download document" className="w-8 h-8 md:w-10 md:h-8 bg-gray-100 hover:bg-green-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-green-600 transition-all">
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View - Responsive */
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="text-left py-3 px-4 text-gray-700 font-medium text-xs md:text-sm">Letter Name</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-medium text-xs md:text-sm hidden md:table-cell">Category</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-medium text-xs md:text-sm">Size</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-medium text-xs md:text-sm">Status</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-medium text-xs md:text-sm hidden lg:table-cell">Access</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-medium text-xs md:text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocs.map(doc => {
                          const folder = librarySchema.find(f => f.id === doc.category);

                          return (
                            <tr
                              key={doc.id}
                              onClick={() => handleDocumentClick(doc)}
                              className={`border-t border-gray-200 hover:bg-gray-50 cursor-pointer transition-all ${selectedDoc?.id === doc.id && showDocModal ? 'bg-blue-50' : ''
                                }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.color}`}>
                                    {doc.type === 'PDF' ? (
                                      <FileText size={16} className="text-blue-600" />
                                    ) : doc.type === 'JPG' || doc.type === 'PNG' ? (
                                      <FileImage size={16} className="text-purple-600" />
                                    ) : (
                                      <File size={16} className="text-emerald-600" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm truncate max-w-[150px] md:max-w-xs">{doc.name}</div>
                                    <div className="text-gray-600 text-xs">{doc.type}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                  {folder && <folder.icon size={14} className="text-gray-500" />}
                                  <span className="text-gray-700 text-sm truncate max-w-[100px]">{doc.subCategory}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-700 text-sm">{doc.size}</td>
                              <td className="py-3 px-4">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'Verified' ? 'bg-green-100 text-green-800' :
                                  doc.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                  <span className="truncate">{doc.status}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 hidden lg:table-cell">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${doc.access === 'Private' ? 'bg-gray-100 text-gray-800' :
                                  doc.access === 'HR' ? 'bg-blue-100 text-blue-800' :
                                    doc.access === 'Manager' ? 'bg-purple-100 text-purple-800' :
                                      'bg-emerald-100 text-emerald-800'
                                  }`}>
                                  {doc.access === 'Private' && <Lock size={10} />}
                                  {doc.access === 'HR' && <User size={10} />}
                                  <span className="truncate">{doc.access}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    title="View document"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDocumentClick(doc);
                                    }}
                                    className="w-7 h-7 md:w-8 md:h-8 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button title="Download document" className="w-7 h-7 md:w-8 md:h-8 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600">
                                    <Download size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Details Modal - Responsive */}
      {showDocModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${selectedDoc.color}`}>
                  {selectedDoc.type === 'PDF' ? (
                    <FileText size={22} className="text-blue-600" />
                  ) : selectedDoc.type === 'JPG' || selectedDoc.type === 'PNG' ? (
                    <FileImage size={22} className="text-purple-600" />
                  ) : (
                    <File size={22} className="text-emerald-600" />
                  )}
                </div>
                <div className="max-w-[200px] md:max-w-md">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1 truncate">{selectedDoc.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-xs md:text-sm">{selectedDoc.type} • {selectedDoc.size}</span>
                  </div>
                </div>
              </div>
              <button
                title="Close modal"
                onClick={() => {
                  setShowDocModal(false);
                  setSelectedDoc(null);
                }}
                className="w-8 h-8 md:w-10 md:h-10 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Status and Access */}
              <div className="flex flex-wrap gap-2 md:gap-4">
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium ${selectedDoc.status === 'Verified' ? 'bg-green-100 text-green-800 border border-green-200' :
                  selectedDoc.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                  {selectedDoc.status === 'Verified' && <CheckCircle size={12} />}
                  {selectedDoc.status}
                </div>
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs md:text-sm ${selectedDoc.access === 'Private' ? 'bg-gray-100 text-gray-800' :
                  selectedDoc.access === 'HR' ? 'bg-blue-100 text-blue-800' :
                    selectedDoc.access === 'Manager' ? 'bg-purple-100 text-purple-800' :
                      'bg-emerald-100 text-emerald-800'
                  }`}>
                  {selectedDoc.access === 'Private' && <Lock size={12} />}
                  {selectedDoc.access === 'HR' && <User size={12} />}
                  {selectedDoc.access} Access
                </div>
              </div>

              {/* AI Summary Panel */}
              <div className="space-y-2 md:space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-600" /> AI Summary
                  </h5>
                  {!selectedDoc.aiSummary && (
                    <button
                      onClick={() => summarizeDocumentWithAI(selectedDoc)}
                      disabled={isSummarizing}
                      className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      {isSummarizing ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                      {isSummarizing ? "Processing..." : "Generate"}
                    </button>
                  )}
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  {isSummarizing ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-3">
                      <BrainCircuit size={24} className="text-blue-600 animate-pulse" />
                      <p className="text-sm font-medium text-blue-700">Analyzing document...</p>
                    </div>
                  ) : selectedDoc.aiSummary ? (
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      "{selectedDoc.aiSummary}"
                    </p>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">No summary available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2 md:space-y-3">
                  <div>
                    <label className="block text-gray-600 text-xs md:text-sm font-medium mb-1">Category</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-bold text-sm md:text-base">{selectedDoc.category}</span>
                      <ChevronRight size={12} className="text-gray-400" />
                      <span className="text-gray-700 text-sm md:text-base">{selectedDoc.subCategory}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-xs md:text-sm font-medium mb-1">Upload Date</label>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <CalendarIcon size={12} className="text-gray-400" />
                      <span className="text-sm md:text-base">{selectedDoc.uploaded}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  <div>
                    <label className="block text-gray-600 text-xs md:text-sm font-medium mb-1">File Type</label>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <FileText size={12} className="text-gray-400" />
                      <span className="text-sm md:text-base">{selectedDoc.type} ({selectedDoc.size})</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-xs md:text-sm font-medium mb-1">Security</label>
                    <div className="flex items-center gap-2">
                      {selectedDoc.isLocked ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg text-xs md:text-sm">
                          <LockKeyhole size={12} /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs md:text-sm">
                          <Unlock size={12} /> Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedDoc.notes && (
                <div>
                  <label className="block text-gray-600 text-xs md:text-sm font-medium mb-2">Notes</label>
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-xs md:text-sm italic">"{selectedDoc.notes}"</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 md:pt-6 border-t border-gray-200 space-y-2 md:space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 md:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base">
                  <Download size={16} />
                  Download Letter
                </button>
                <button
                  onClick={() => setShowDocModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 md:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-gray-300 text-sm md:text-base"
                >
                  <X size={16} />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;