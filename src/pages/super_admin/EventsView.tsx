
import React from 'react';
import { MOCK_EVENTS } from '../../constants';
import { SectionHeader, Badge } from '../../components/super_admin/UI.tsx';
import { Calendar as CalendarIcon, Clock, Users, Video, Coffee, PartyPopper } from 'lucide-react';

export const EventsView = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Video size={18} className="text-blue-400" />;
      case 'holiday': return <PartyPopper size={18} className="text-rose-400" />;
      case 'webinar': return <Coffee size={18} className="text-amber-400" />;
      default: return <CalendarIcon size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Company Events" description="Upcoming meetings, workshops, and organizational milestones." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 transition-all shadow-xl group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gray-100 border border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all`}>
                {getIcon(event.type)}
              </div>
              <Badge color={event.type === 'holiday' ? 'red' : event.type === 'webinar' ? 'yellow' : 'blue'}>
                {event.type.toUpperCase()}
              </Badge>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h3>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarIcon size={14} className="text-blue-600" />
                {event.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={14} className="text-blue-600" />
                {event.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={14} className="text-blue-600" />
                {event.attendees} Registered Attendees
              </div>
            </div>

            <button className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 hover:bg-gray-100 transition-all uppercase tracking-wider focus:ring-4 focus:ring-blue-500/50">
              Manage Guest List
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
