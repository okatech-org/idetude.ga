/**
 * EventsSection Component
 * Displays upcoming events calendar
 */

import { Calendar, Clock, MapPin, ArrowRight, CalendarDays } from "lucide-react";
import type { EventsContent, ColorPalette } from "../types";

interface EventsSectionProps {
    content: EventsContent;
    palette: ColorPalette['colors'];
    isEditing?: boolean;
    onContentChange?: (content: EventsContent) => void;
}

// Mock events data for demo
const DEMO_EVENTS = [
    {
        id: '1',
        title: 'Journée portes ouvertes',
        date: '2026-03-15',
        time: '09:00 - 17:00',
        location: 'Campus principal',
        description: 'Venez découvrir notre établissement et rencontrer nos équipes.',
        type: 'open-day',
    },
    {
        id: '2',
        title: 'Conseil de classe T1',
        date: '2026-01-20',
        time: '14:00',
        location: 'Salle de réunion',
        description: 'Premier conseil de classe du trimestre.',
        type: 'meeting',
    },
    {
        id: '3',
        title: 'Remise des diplômes',
        date: '2026-06-25',
        time: '18:00',
        location: 'Amphithéâtre',
        description: 'Cérémonie de remise des diplômes pour les lauréats.',
        type: 'ceremony',
    },
    {
        id: '4',
        title: 'Fête de fin d\'année',
        date: '2026-06-30',
        time: '15:00 - 20:00',
        location: 'Cour de l\'établissement',
        description: 'Célébrons ensemble la fin de l\'année scolaire !',
        type: 'celebration',
    },
    {
        id: '5',
        title: 'Course solidaire',
        date: '2026-04-10',
        time: '10:00',
        location: 'Stade',
        description: 'Course au profit d\'associations caritatives.',
        type: 'sport',
    },
];

const eventTypeColors: Record<string, string> = {
    'open-day': '#10b981',
    'meeting': '#3b82f6',
    'ceremony': '#f59e0b',
    'celebration': '#ec4899',
    'sport': '#8b5cf6',
};

export const EventsSection = ({
    content,
    palette,
    isEditing = false,
    onContentChange,
}: EventsSectionProps) => {
    const handleChange = (field: keyof EventsContent, value: any) => {
        onContentChange?.({ ...content, [field]: value });
    };

    const now = new Date();
    const filteredEvents = content.showPast
        ? DEMO_EVENTS
        : DEMO_EVENTS.filter(e => new Date(e.date) >= now);
    const displayedEvents = filteredEvents.slice(0, content.maxItems || 5);

    return (
        <section
            className="py-16 px-4"
            style={{ backgroundColor: palette.background }}
        >
            <div className="container mx-auto max-w-4xl">
                {/* Title */}
                {isEditing ? (
                    <input
                        type="text"
                        value={content.title || 'Événements'}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="text-3xl md:text-4xl font-bold text-center w-full mb-12 bg-transparent border-b border-dashed focus:outline-none focus:border-primary"
                        style={{ color: palette.text }}
                    />
                ) : (
                    <h2
                        className="text-3xl md:text-4xl font-bold text-center mb-12"
                        style={{ color: palette.text }}
                    >
                        {content.title || 'Événements'}
                    </h2>
                )}

                {/* Settings (editing only) */}
                {isEditing && (
                    <div className="flex justify-center gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <label className="text-sm" style={{ color: palette.muted }}>Événements affichés:</label>
                            <select
                                value={content.maxItems || 5}
                                onChange={(e) => handleChange('maxItems', parseInt(e.target.value))}
                                className="px-3 py-1 rounded border text-sm"
                            >
                                {[3, 5, 10].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm" style={{ color: palette.muted }}>
                            <input
                                type="checkbox"
                                checked={content.showPast || false}
                                onChange={(e) => handleChange('showPast', e.target.checked)}
                                className="rounded"
                            />
                            Inclure les passés
                        </label>
                    </div>
                )}

                {/* Events Timeline */}
                <div className="space-y-4">
                    {displayedEvents.map((event) => {
                        const eventDate = new Date(event.date);
                        const isPast = eventDate < now;
                        const typeColor = eventTypeColors[event.type] || palette.primary;

                        return (
                            <div
                                key={event.id}
                                className={`flex gap-4 p-4 rounded-xl transition-all hover:scale-[1.01] cursor-pointer ${isPast ? 'opacity-60' : ''
                                    }`}
                                style={{
                                    backgroundColor: `${palette.primary}05`,
                                    borderLeft: `4px solid ${typeColor}`,
                                }}
                            >
                                {/* Date Badge */}
                                <div
                                    className="flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center"
                                    style={{ backgroundColor: `${typeColor}15` }}
                                >
                                    <span
                                        className="text-2xl font-bold"
                                        style={{ color: typeColor }}
                                    >
                                        {eventDate.getDate()}
                                    </span>
                                    <span
                                        className="text-xs uppercase"
                                        style={{ color: typeColor }}
                                    >
                                        {eventDate.toLocaleDateString('fr-FR', { month: 'short' })}
                                    </span>
                                </div>

                                {/* Event Details */}
                                <div className="flex-1 min-w-0">
                                    <h3
                                        className="font-semibold text-lg truncate"
                                        style={{ color: palette.text }}
                                    >
                                        {event.title}
                                    </h3>
                                    <p
                                        className="text-sm line-clamp-1 mb-2"
                                        style={{ color: palette.muted }}
                                    >
                                        {event.description}
                                    </p>
                                    <div className="flex flex-wrap gap-3 text-sm" style={{ color: palette.muted }}>
                                        {event.time && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {event.time}
                                            </span>
                                        )}
                                        {event.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {event.location}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex-shrink-0 flex items-center">
                                    <ArrowRight className="w-5 h-5" style={{ color: palette.muted }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info message for editing */}
                {isEditing && (
                    <div
                        className="mt-6 p-4 rounded-lg text-center text-sm"
                        style={{ backgroundColor: `${palette.muted}15`, color: palette.muted }}
                    >
                        <CalendarDays className="w-5 h-5 inline-block mr-2" />
                        Les événements sont récupérés automatiquement depuis votre calendrier
                    </div>
                )}

                {/* Empty state */}
                {displayedEvents.length === 0 && !isEditing && (
                    <p className="text-center py-8" style={{ color: palette.muted }}>
                        Aucun événement à venir
                    </p>
                )}
            </div>
        </section>
    );
};

export default EventsSection;
