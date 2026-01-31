/**
 * NewsSection Component
 * Displays latest news/announcements
 */

import { Calendar, ArrowRight, FileText } from "lucide-react";
import type { NewsContent, ColorPalette } from "../types";

interface NewsSectionProps {
    content: NewsContent;
    palette: ColorPalette['colors'];
    isEditing?: boolean;
    onContentChange?: (content: NewsContent) => void;
}

// Mock news data for demo
const DEMO_NEWS = [
    {
        id: '1',
        title: 'Rentrée scolaire 2025-2026',
        excerpt: 'La rentrée scolaire aura lieu le 2 septembre. Voici les informations importantes pour préparer cette nouvelle année.',
        date: '2025-08-15',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop',
    },
    {
        id: '2',
        title: 'Résultats exceptionnels aux examens',
        excerpt: 'Nous sommes fiers d\'annoncer un taux de réussite de 98% aux examens nationaux cette année.',
        date: '2025-07-20',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
    },
    {
        id: '3',
        title: 'Nouveau laboratoire informatique',
        excerpt: 'Notre établissement vient de se doter d\'un laboratoire informatique moderne avec 30 postes.',
        date: '2025-06-10',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
    },
];

export const NewsSection = ({
    content,
    palette,
    isEditing = false,
    onContentChange,
}: NewsSectionProps) => {
    const handleChange = (field: keyof NewsContent, value: any) => {
        onContentChange?.({ ...content, [field]: value });
    };

    const displayedNews = DEMO_NEWS.slice(0, content.maxItems || 3);

    return (
        <section
            className="py-16 px-4"
            style={{ backgroundColor: `${palette.accent}05` }}
        >
            <div className="container mx-auto max-w-6xl">
                {/* Title */}
                {isEditing ? (
                    <input
                        type="text"
                        value={content.title || 'Actualités'}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="text-3xl md:text-4xl font-bold text-center w-full mb-12 bg-transparent border-b border-dashed focus:outline-none focus:border-primary"
                        style={{ color: palette.text }}
                    />
                ) : (
                    <h2
                        className="text-3xl md:text-4xl font-bold text-center mb-12"
                        style={{ color: palette.text }}
                    >
                        {content.title || 'Actualités'}
                    </h2>
                )}

                {/* Settings (editing only) */}
                {isEditing && (
                    <div className="flex justify-center gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <label className="text-sm" style={{ color: palette.muted }}>Articles affichés:</label>
                            <select
                                value={content.maxItems || 3}
                                onChange={(e) => handleChange('maxItems', parseInt(e.target.value))}
                                className="px-3 py-1 rounded border text-sm"
                            >
                                {[1, 2, 3, 4, 6].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm" style={{ color: palette.muted }}>
                            <input
                                type="checkbox"
                                checked={content.showMore || false}
                                onChange={(e) => handleChange('showMore', e.target.checked)}
                                className="rounded"
                            />
                            Afficher "Voir plus"
                        </label>
                    </div>
                )}

                {/* News Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedNews.map((news) => (
                        <article
                            key={news.id}
                            className="rounded-xl overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer"
                            style={{
                                backgroundColor: palette.background,
                                boxShadow: `0 4px 20px ${palette.muted}15`,
                            }}
                        >
                            {news.image && (
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={news.image}
                                        alt={news.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-5">
                                <div
                                    className="flex items-center gap-2 text-sm mb-3"
                                    style={{ color: palette.muted }}
                                >
                                    <Calendar className="w-4 h-4" />
                                    {new Date(news.date).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </div>
                                <h3
                                    className="font-semibold text-lg mb-2 line-clamp-2"
                                    style={{ color: palette.text }}
                                >
                                    {news.title}
                                </h3>
                                <p
                                    className="text-sm line-clamp-3"
                                    style={{ color: palette.muted }}
                                >
                                    {news.excerpt}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Info message for editing */}
                {isEditing && (
                    <div
                        className="mt-6 p-4 rounded-lg text-center text-sm"
                        style={{ backgroundColor: `${palette.muted}15`, color: palette.muted }}
                    >
                        <FileText className="w-5 h-5 inline-block mr-2" />
                        Les actualités sont récupérées automatiquement depuis votre espace admin
                    </div>
                )}

                {/* See More Button */}
                {content.showMore && !isEditing && (
                    <div className="text-center mt-8">
                        <button
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
                            style={{
                                backgroundColor: palette.primary,
                                color: '#ffffff',
                            }}
                        >
                            Toutes les actualités
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default NewsSection;
