import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EventType } from '../types.tsx';

export interface CalendarEvent {
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

interface CalendarEventsContextType {
    calendarEvents: CalendarEvent[];
    addToCalendar: (event: CalendarEvent) => void;
    removeFromCalendar: (eventId: string | number) => void;
    clearAllCalendarEvents: () => void;
    isEventInCalendar: (eventId: string | number) => boolean;
}

const CalendarEventsContext = createContext<CalendarEventsContextType | undefined>(undefined);

export const CalendarEventsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

    const addToCalendar = (event: CalendarEvent) => {
        setCalendarEvents(prev =>
            prev.some(e => String(e.eventId) === String(event.eventId))
                ? prev
                : [...prev, event]
        );
    };

    const removeFromCalendar = (eventId: string | number) => {
        setCalendarEvents(prev =>
            prev.filter(e => String(e.eventId) !== String(eventId))
        );
    };

    const clearAllCalendarEvents = () => {
        setCalendarEvents([]);
    };

    const isEventInCalendar = (eventId: string | number) => {
        return calendarEvents.some(e => String(e.eventId) === String(eventId));
    };

    return (
        <CalendarEventsContext.Provider
            value={{
                calendarEvents,
                addToCalendar,
                removeFromCalendar,
                clearAllCalendarEvents,
                isEventInCalendar
            }}
        >
            {children}
        </CalendarEventsContext.Provider>
    );
};

export const useCalendarEvents = () => {
    const context = useContext(CalendarEventsContext);
    if (!context) {
        throw new Error('useCalendarEvents must be used within CalendarEventsProvider');
    }
    return context;
};
