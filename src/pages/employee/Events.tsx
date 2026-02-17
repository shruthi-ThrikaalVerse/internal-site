// src/pages/Events.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDays, Users, MapPin, Clock, Tag,
    Filter, Search, Calendar, ChevronRight,
    Award, Briefcase, Cake, Heart, GraduationCap,
    Mic, Users2, Star, Bell, ExternalLink,
    CheckCircle, XCircle, AlertCircle, Plus, X
} from 'lucide-react';
import { Event, EventType } from '../../types.ts';

// Sample events data
const SAMPLE_EVENTS: Event[] = [
    {
        id: '1',
        title: 'Annual Tech Conference 2026',
        description: 'Annual technology innovation conference with keynote speakers and workshops on emerging technologies like AI, Blockchain, and Cloud Computing.',
        date: '2026-03-15',
        startTime: '09:00',
        endTime: '17:00',
        location: 'Main Auditorium, 3rd Floor',
        type: 'conference',
        organizer: 'IT Department',
        participants: ['All Employees'],
        isMandatory: true,
        status: 'upcoming',
        createdAt: '2026-01-10',
        updatedAt: '2026-01-10'
    },
    {
        id: '2',
        title: 'Team Building Workshop',
        description: 'Enhance team collaboration and communication skills through interactive activities and group exercises.',
        date: '2026-02-20',
        startTime: '10:00',
        endTime: '16:00',
        location: 'Training Room A',
        type: 'workshop',
        organizer: 'HR Department',
        participants: ['Department Heads', 'Team Leads'],
        isMandatory: false,
        status: 'upcoming',
        createdAt: '2026-01-15',
        updatedAt: '2026-01-15'
    },
    {
        id: '3',
        title: 'Company Anniversary Celebration',
        description: 'Celebrating 10 years of success and innovation with dinner, awards, and entertainment.',
        date: '2026-04-10',
        startTime: '18:00',
        endTime: '22:00',
        location: 'Grand Ballroom, Downtown Hotel',
        type: 'anniversary',
        organizer: 'Management',
        participants: ['All Employees', 'Partners'],
        isMandatory: false,
        status: 'upcoming',
        createdAt: '2026-01-05',
        updatedAt: '2026-01-05'
    },
    {
        id: '4',
        title: 'Quarterly Review Meeting',
        description: 'Review Q1 performance metrics and set strategic goals for Q2. Department heads will present their achievements.',
        date: '2026-01-25',
        startTime: '14:00',
        endTime: '16:00',
        location: 'Conference Room 1',
        type: 'meeting',
        organizer: 'CEO Office',
        participants: ['Department Managers'],
        isMandatory: true,
        status: 'upcoming',
        createdAt: '2026-01-08',
        updatedAt: '2026-01-08'
    },
    {
        id: '5',
        title: 'Health & Wellness Checkup',
        description: 'Free annual health screening including BP, sugar, cholesterol tests and doctor consultation.',
        date: '2026-02-05',
        startTime: '09:00',
        endTime: '17:00',
        location: 'Health Center, Ground Floor',
        type: 'health_checkup',
        organizer: 'Admin Department',
        participants: ['All Employees'],
        isMandatory: false,
        status: 'upcoming',
        createdAt: '2026-01-12',
        updatedAt: '2026-01-12'
    },
    {
        id: '6',
        title: 'New Year Party',
        description: 'Celebrate the new year with colleagues, food, music, and fun activities.',
        date: '2026-01-01',
        startTime: '19:00',
        endTime: '23:59',
        location: 'Rooftop Terrace',
        type: 'party',
        organizer: 'Social Committee',
        participants: ['All Employees'],
        isMandatory: false,
        status: 'completed',
        createdAt: '2025-12-15',
        updatedAt: '2026-01-02'
    },
    {
        id: '7',
        title: 'Leadership Training Program',
        description: 'Advanced leadership skills development program for senior managers and directors.',
        date: '2026-02-15',
        startTime: '09:00',
        endTime: '13:00',
        location: 'Training Center',
        type: 'training',
        organizer: 'Learning & Development',
        participants: ['Senior Managers', 'Directors'],
        isMandatory: true,
        status: 'upcoming',
        createdAt: '2026-01-10',
        updatedAt: '2026-01-10'
    },
    {
        id: '8',
        title: 'Annual Awards Ceremony',
        description: 'Recognizing outstanding employee contributions with awards in various categories.',
        date: '2026-12-15',
        startTime: '18:30',
        endTime: '21:30',
        location: 'Convention Center',
        type: 'awards',
        organizer: 'HR Department',
        participants: ['All Employees', 'Award Nominees'],
        isMandatory: false,
        status: 'upcoming',
        createdAt: '2026-01-05',
        updatedAt: '2026-01-05'
    },
    {
        id: '9',
        title: 'Annual Tech Conference 2026',
        description: 'Annual technology innovation conference with keynote speakers and workshops on emerging technologies like AI, Blockchain, and Cloud Computing.',
        date: '2026-01-30',
        startTime: '09:00',
        endTime: '17:00',
        location: 'Main Auditorium, 3rd Floor',
        type: 'conference',
        organizer: 'IT Department',
        participants: ['All Employees'],
        isMandatory: true,
        status: 'upcoming',
        createdAt: '2026-01-10',
        updatedAt: '2026-01-10'
    },
];

const EVENTS_PER_PAGE = 6;

interface CalendarEvent {
    id: number;
    eventId: string | number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    type: EventType;
    addedAt: string;
}

const Events: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>(SAMPLE_EVENTS);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(SAMPLE_EVENTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [showCalendarSection, setShowCalendarSection] = useState(false);

    // Get current user from localStorage
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        // Load calendar events from localStorage
        const savedCalendarEvents = localStorage.getItem('calendarEvents');
        if (savedCalendarEvents) {
            try {
                const parsedEvents = JSON.parse(savedCalendarEvents);
                // Ensure we have an array
                setCalendarEvents(Array.isArray(parsedEvents) ? parsedEvents : []);
            } catch (error) {
                console.error('Error loading calendar events:', error);
                setCalendarEvents([]);
            }
        }
    }, []);

    // Listen for calendar events updates from other components
    useEffect(() => {
        const handleCalendarUpdate = () => {
            const savedCalendarEvents = localStorage.getItem('calendarEvents');
            if (savedCalendarEvents) {
                try {
                    const parsedEvents = JSON.parse(savedCalendarEvents);
                    setCalendarEvents(Array.isArray(parsedEvents) ? parsedEvents : []);
                } catch (error) {
                    console.error('Error loading calendar events:', error);
                    setCalendarEvents([]);
                }
            }
        };

        // Listen for custom events
        window.addEventListener('calendarEventsUpdated', handleCalendarUpdate);
        
        // Also check localStorage periodically for changes from other tabs
        const interval = setInterval(() => {
            const savedCalendarEvents = localStorage.getItem('calendarEvents');
            if (savedCalendarEvents) {
                const parsedEvents = JSON.parse(savedCalendarEvents);
                if (JSON.stringify(parsedEvents) !== JSON.stringify(calendarEvents)) {
                    setCalendarEvents(Array.isArray(parsedEvents) ? parsedEvents : []);
                }
            }
        }, 1000); // Check every second

        return () => {
            window.removeEventListener('calendarEventsUpdated', handleCalendarUpdate);
            clearInterval(interval);
        };
    }, [calendarEvents]);

    // Save calendar events to localStorage whenever they change
    useEffect(() => {
        if (calendarEvents.length > 0) {
            localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
        }
    }, [calendarEvents]);

    // Get icon for event type
    const getEventTypeIcon = (type: EventType) => {
        switch (type) {
            case 'meeting': return <Briefcase className="w-4 h-4" />;
            case 'workshop': return <GraduationCap className="w-4 h-4" />;
            case 'training': return <GraduationCap className="w-4 h-4" />;
            case 'conference': return <Mic className="w-4 h-4" />;
            case 'team_building': return <Users2 className="w-4 h-4" />;
            case 'celebration': return <Cake className="w-4 h-4" />;
            case 'anniversary': return <Cake className="w-4 h-4" />;
            case 'party': return <Heart className="w-4 h-4" />;
            case 'health_checkup': return <Heart className="w-4 h-4" />;
            case 'awards': return <Award className="w-4 h-4" />;
            case 'webinar': return <Mic className="w-4 h-4" />;
            case 'social': return <Users className="w-4 h-4" />;
            default: return <CalendarDays className="w-4 h-4" />;
        }
    };

    // Get color for event type
    const getEventTypeColor = (type: EventType) => {
        switch (type) {
            case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'workshop': return 'bg-green-100 text-green-700 border-green-200';
            case 'training': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'conference': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'team_building': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'celebration': return 'bg-pink-100 text-pink-700 border-pink-200';
            case 'anniversary': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'party': return 'bg-red-100 text-red-700 border-red-200';
            case 'health_checkup': return 'bg-teal-100 text-teal-700 border-teal-200';
            case 'awards': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'webinar': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'social': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // Get status badge - Fixed with whitespace-nowrap
    const getStatusBadge = (status: Event['status']) => {
        switch (status) {
            case 'upcoming':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full whitespace-nowrap">Upcoming</span>;
            case 'ongoing':
                return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap">Live</span>;
            case 'completed':
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full whitespace-nowrap">Completed</span>;
            case 'cancelled':
                return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full whitespace-nowrap">Cancelled</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full whitespace-nowrap">{status}</span>;
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format date for calendar display
    const formatCalendarDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Format time
    const formatTime = (timeString?: string) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Format time range
    const formatTimeRange = (startTime?: string, endTime?: string) => {
        if (!startTime) return '';
        if (!endTime) return formatTime(startTime);
        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    };

    // Get days until event
    const getDaysUntil = (dateString: string) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays > 1) return `In ${diffDays} days`;
        if (diffDays < 0) return 'Completed';
        return '';
    };

    // Check if event is in calendar - Accept string or number ids
    const isEventInCalendar = (eventId: string | number) => {
        try {
            const savedCalendarEvents = localStorage.getItem('calendarEvents');
            if (savedCalendarEvents) {
                const parsedEvents = JSON.parse(savedCalendarEvents);
                return Array.isArray(parsedEvents) && parsedEvents.some((calEvent: CalendarEvent) => String(calEvent.eventId) === String(eventId));
            }
        } catch (error) {
            console.error('Error checking calendar events:', error);
        }
        return false;
    };

    // Add event to calendar - FIXED: Sync with localStorage
    const addToCalendar = (event: Event) => {
        if (isEventInCalendar(event.id)) return;

        const calendarEvent: CalendarEvent = {
            id: Date.now(),
            eventId: event.id,
            title: event.title,
            date: event.date,
            startTime: event.startTime || '',
            endTime: event.endTime || '',
            location: event.location || '',
            type: event.type,
            addedAt: new Date().toISOString()
        };

        // Get existing events from localStorage
        const savedCalendarEvents = localStorage.getItem('calendarEvents');
        const existingEvents = savedCalendarEvents ? JSON.parse(savedCalendarEvents) : [];
        
        // Add new event
        const updatedEvents = [...existingEvents, calendarEvent];
        
        // Update both state and localStorage
        setCalendarEvents(updatedEvents);
        localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
        setShowCalendarSection(true);
        
        // Trigger custom event to notify Calendar component and other instances
        window.dispatchEvent(new CustomEvent('calendarEventsUpdated'));
    };

    // Remove event from calendar - Accept string or number ids
    const removeFromCalendar = (eventId: string | number) => {
        // Get existing events from localStorage
        const savedCalendarEvents = localStorage.getItem('calendarEvents');
        if (!savedCalendarEvents) return;
        
        const existingEvents = JSON.parse(savedCalendarEvents);
        const updatedEvents = existingEvents.filter((event: CalendarEvent) => String(event.eventId) !== String(eventId));
        
        // Update both state and localStorage
        setCalendarEvents(updatedEvents);
        localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
        
        // Trigger custom event to notify Calendar component and other instances
        window.dispatchEvent(new CustomEvent('calendarEventsUpdated'));
    };

    // Clear all calendar events
    const clearAllCalendarEvents = () => {
        setCalendarEvents([]);
        localStorage.removeItem('calendarEvents');
        window.dispatchEvent(new CustomEvent('calendarEventsUpdated'));
    };

    // Filter events
    useEffect(() => {
        let filtered = [...events];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(term) ||
                event.description.toLowerCase().includes(term) ||
                event.location?.toLowerCase().includes(term)
            );
        }

        // Type filter
        if (selectedType !== 'all') {
            filtered = filtered.filter(event => event.type === selectedType);
        }

        setFilteredEvents(filtered);
        setCurrentPage(1);
    }, [searchTerm, selectedType, events]);

    // Pagination
    const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
    const indexOfLastEvent = currentPage * EVENTS_PER_PAGE;
    const indexOfFirstEvent = indexOfLastEvent - EVENTS_PER_PAGE;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Event type options (simplified)
    const eventTypes = [
        { value: 'all', label: 'All Events', icon: <CalendarDays className="w-4 h-4" /> },
        { value: 'meeting', label: 'Meetings', icon: <Briefcase className="w-4 h-4" /> },
        { value: 'workshop', label: 'Workshops', icon: <GraduationCap className="w-4 h-4" /> },
        { value: 'training', label: 'Training', icon: <GraduationCap className="w-4 h-4" /> },
        { value: 'conference', label: 'Conferences', icon: <Mic className="w-4 h-4" /> },
        { value: 'celebration', label: 'Celebrations', icon: <Cake className="w-4 h-4" /> },
    ];

    // Calculate upcoming events count
    const upcomingEventsCount = events.filter(e => e.status === 'upcoming').length;
    const mandatoryEventsCount = events.filter(e => e.isMandatory).length;

    // Get event type count
    const getEventTypeCount = (type: EventType | 'all') => {
        if (type === 'all') return events.length;
        return events.filter(e => e.type === type).length;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Company Events
                            </h1>
                        </div>
                        <p className="text-gray-600 text-sm md:text-base">
                            View upcoming events, meetings, and celebrations
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowCalendarSection(!showCalendarSection)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            My Calendar ({calendarEvents.length})
                        </button>
                        <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-700">
                                    {upcomingEventsCount} Upcoming Events
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Total Events */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Events</p>
                            <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                        </div>
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Upcoming</p>
                            <p className="text-2xl font-bold text-gray-900">{upcomingEventsCount}</p>
                        </div>
                    </div>
                </div>

                {/* Mandatory Events */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Mandatory</p>
                            <p className="text-2xl font-bold text-gray-900">{mandatoryEventsCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 flex flex-col">
                    {/* Sticky Filter Section - Similar to Documents */}
                    <div className="lg:sticky lg:top-6 lg:z-40 mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-5">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search events by name, description, or location..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
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
                                        <div className="grid grid-cols-2 gap-1 w-5 h-5">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="bg-current rounded-sm"></div>
                                            ))}
                                        </div>
                                    </button>
                                    <button
                                        title="List view"
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 md:p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                                    >
                                        <div className="space-y-1 w-5 h-5">
                                            <div className="h-1 bg-current rounded-full"></div>
                                            <div className="h-1 bg-current rounded-full"></div>
                                            <div className="h-1 bg-current rounded-full"></div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Event Type Filters */}
                            <div className="mt-4">
                                <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {eventTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => setSelectedType(type.value as EventType | 'all')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0 ${selectedType === type.value
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                                                }`}
                                        >
                                            {type.icon}
                                            {type.label}
                                            <span className="text-xs opacity-70">({getEventTypeCount(type.value as EventType | 'all')})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 overflow-hidden">
                        {/* Events Count Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-5 gap-2">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                                {selectedType === 'all' ? 'All Events' : eventTypes.find(t => t.value === selectedType)?.label}
                                <span className="text-gray-600 ml-2 text-xs md:text-sm">({filteredEvents.length} events)</span>
                            </h2>
                            
                            {/* Pagination Info */}
                            {filteredEvents.length > EVENTS_PER_PAGE && (
                                <div className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </div>
                            )}
                        </div>

                        {/* Events Grid/List - Scrollable Area */}
                        <div className="h-[calc(100vh-350px)] lg:h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                            {currentEvents.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
                                    <CalendarDays className="mx-auto text-gray-400 mb-4" size={48} />
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                                    <p className="text-gray-600 mb-6 text-sm md:text-base">
                                        {selectedType !== 'all'
                                            ? `No ${eventTypes.find(t => t.value === selectedType)?.label?.toLowerCase()} events found. Try a different filter.`
                                            : 'No events available'}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSelectedType('all');
                                            setSearchTerm('');
                                        }}
                                        className="bg-gray-200 text-gray-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm md:text-base"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-6`}>
                                    {currentEvents.map((event) => {
                                        const inCalendar = isEventInCalendar(event.id);
                                        return (
                                            <div
                                                key={event.id}
                                                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all hover:border-blue-300 group relative"
                                            >
                                                {/* Calendar Button - Shows X when in calendar */}
                                                <button
                                                    onClick={() => inCalendar ? removeFromCalendar(event.id) : addToCalendar(event)}
                                                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${inCalendar
                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                        }`}
                                                    title={inCalendar ? 'Remove from calendar' : 'Add to calendar'}
                                                >
                                                    {inCalendar ? (
                                                        <X className="w-4 h-4" />
                                                    ) : (
                                                        <Calendar className="w-4 h-4" />
                                                    )}
                                                </button>

                                                {/* Event Header */}
                                                <div className="flex justify-between items-start mb-4 pr-12">
                                                    <div className={`p-2 rounded-lg text-black ${getEventTypeColor(event.type).split(' ')[0]}`}>
                                                        {getEventTypeIcon(event.type)}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex gap-1 flex-wrap justify-end">
                                                            {event.isMandatory && (
                                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full whitespace-nowrap">
                                                                    Required
                                                                </span>
                                                            )}
                                                            {getStatusBadge(event.status)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                                    {event.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                                                <div className="space-y-3 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <span className="font-medium">{formatDate(event.date)}</span>
                                                        <span className="text-xs font-semibold text-blue-600 ml-auto bg-blue-50 px-2 py-1 rounded whitespace-nowrap">
                                                            {getDaysUntil(event.date)}
                                                        </span>
                                                    </div>

                                                    {event.startTime && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="whitespace-nowrap">{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                                                        </div>
                                                    )}

                                                    {event.location && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="truncate">{event.location}</span>
                                                        </div>
                                                    )}

                                                    {event.organizer && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="truncate">Organized by {event.organizer}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.type)} whitespace-nowrap`}>
                                                        {event.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                                        For: {event.participants?.join(', ').length > 20
                                                            ? event.participants?.join(', ').substring(0, 20) + '...'
                                                            : event.participants?.join(', ')}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* List View */
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    {currentEvents.map((event, index) => {
                                        const inCalendar = isEventInCalendar(event.id);
                                        return (
                                            <div
                                                key={event.id}
                                                className={`p-5 hover:bg-gray-50 transition-colors relative ${index !== currentEvents.length - 1 ? 'border-b border-gray-100' : ''
                                                    }`}
                                            >
                                                {/* Calendar Button for List View */}
                                                <button
                                                    onClick={() => inCalendar ? removeFromCalendar(event.id) : addToCalendar(event)}
                                                    className={`absolute top-5 right-5 p-2 rounded-lg transition-colors ${inCalendar
                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                        }`}
                                                    title={inCalendar ? 'Remove from calendar' : 'Add to calendar'}
                                                >
                                                    {inCalendar ? (
                                                        <X className="w-4 h-4" />
                                                    ) : (
                                                        <Calendar className="w-4 h-4" />
                                                    )}
                                                </button>

                                                <div className="flex items-start gap-4 pr-12">
                                                    <div className={`p-3 rounded-lg ${getEventTypeColor(event.type).split(' ')[0]}`}>
                                                        {getEventTypeIcon(event.type)}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                                                            <div className="flex flex-col items-end gap-2">
                                                                <div className="flex gap-2">
                                                                    {event.isMandatory && (
                                                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full whitespace-nowrap">
                                                                            Required
                                                                        </span>
                                                                    )}
                                                                    {getStatusBadge(event.status)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>

                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays className="w-4 h-4 text-gray-400" />
                                                                <span className="font-medium">{formatDate(event.date)}</span>
                                                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">
                                                                    {getDaysUntil(event.date)}
                                                                </span>
                                                            </div>

                                                            {event.startTime && (
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                                    <span className="whitespace-nowrap">{formatTime(event.startTime)}</span>
                                                                </div>
                                                            )}

                                                            {event.location && (
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                                    <span>{event.location}</span>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-2">
                                                                <Users className="w-4 h-4 text-gray-400" />
                                                                <span>For: {event.participants?.join(', ')}</span>
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
                    </div>

                    {/* Pagination */}
                    {filteredEvents.length > EVENTS_PER_PAGE && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-black"
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => paginate(page)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-black"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add custom CSS for scrollbar hiding */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Events;