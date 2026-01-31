/**
 * About Section Component
 * Presentation section with description, mission, vision, and values
 */

import { GlassCard } from "@/components/ui/glass-card";
import { CheckCircle, Target, Eye, Heart } from "lucide-react";
import type { AboutContent, ColorPalette } from "../types";

interface AboutSectionProps {
    content: AboutContent;
    palette: ColorPalette['colors'];
    isEditing?: boolean;
    onContentChange?: (content: AboutContent) => void;
}

export const AboutSection = ({
    content,
    palette,
    isEditing = false,
    onContentChange
}: AboutSectionProps) => {
    const handleTextChange = (field: keyof AboutContent, value: string) => {
        if (onContentChange) {
            onContentChange({ ...content, [field]: value });
        }
    };

    return (
        <section
            className="py-16 md:py-24"
            style={{ backgroundColor: palette.background }}
        >
            <div className="container mx-auto px-4">
                {/* Title */}
                <div className="text-center mb-12">
                    {isEditing ? (
                        <input
                            type="text"
                            value={content.title}
                            onChange={(e) => handleTextChange('title', e.target.value)}
                            className="text-3xl md:text-4xl font-bold mb-4 bg-transparent border-b-2 border-dashed text-center w-full max-w-md mx-auto focus:outline-none"
                            style={{ color: palette.text, borderColor: palette.muted }}
                            placeholder="Titre de la section"
                        />
                    ) : (
                        <h2
                            className="text-3xl md:text-4xl font-bold mb-4"
                            style={{ color: palette.text }}
                        >
                            {content.title}
                        </h2>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <div className="relative">
                        {content.image ? (
                            <img
                                src={content.image}
                                alt={content.title}
                                className="rounded-2xl shadow-xl w-full h-auto object-cover"
                            />
                        ) : (
                            <GlassCard className="aspect-video flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div
                                        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                                        style={{ backgroundColor: `${palette.primary}20` }}
                                    >
                                        <Target className="w-10 h-10" style={{ color: palette.primary }} />
                                    </div>
                                    <p style={{ color: palette.muted }}>
                                        {isEditing ? 'Cliquez pour ajouter une image' : 'Image de présentation'}
                                    </p>
                                </div>
                            </GlassCard>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {isEditing ? (
                            <textarea
                                value={content.description}
                                onChange={(e) => handleTextChange('description', e.target.value)}
                                className="text-lg leading-relaxed w-full resize-none bg-transparent border rounded-lg p-3 focus:outline-none"
                                style={{ color: palette.text, borderColor: palette.muted }}
                                placeholder="Description de l'établissement"
                                rows={4}
                            />
                        ) : (
                            <p
                                className="text-lg leading-relaxed"
                                style={{ color: palette.text }}
                            >
                                {content.description}
                            </p>
                        )}

                        {/* Mission & Vision */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {content.mission && (
                                <GlassCard className="p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Target className="w-5 h-5" style={{ color: palette.primary }} />
                                        <span className="font-semibold" style={{ color: palette.text }}>
                                            Mission
                                        </span>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={content.mission}
                                            onChange={(e) => handleTextChange('mission', e.target.value)}
                                            className="text-sm w-full bg-transparent border-b border-dashed focus:outline-none"
                                            style={{ color: palette.muted, borderColor: palette.muted }}
                                        />
                                    ) : (
                                        <p className="text-sm" style={{ color: palette.muted }}>
                                            {content.mission}
                                        </p>
                                    )}
                                </GlassCard>
                            )}

                            {content.vision && (
                                <GlassCard className="p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Eye className="w-5 h-5" style={{ color: palette.secondary }} />
                                        <span className="font-semibold" style={{ color: palette.text }}>
                                            Vision
                                        </span>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={content.vision}
                                            onChange={(e) => handleTextChange('vision', e.target.value)}
                                            className="text-sm w-full bg-transparent border-b border-dashed focus:outline-none"
                                            style={{ color: palette.muted, borderColor: palette.muted }}
                                        />
                                    ) : (
                                        <p className="text-sm" style={{ color: palette.muted }}>
                                            {content.vision}
                                        </p>
                                    )}
                                </GlassCard>
                            )}
                        </div>

                        {/* Values */}
                        {content.values && content.values.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Heart className="w-5 h-5" style={{ color: palette.accent }} />
                                    <span className="font-semibold" style={{ color: palette.text }}>
                                        Nos valeurs
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {content.values.map((value, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                                            style={{
                                                backgroundColor: `${palette.primary}15`,
                                                color: palette.primary,
                                            }}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {value}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
