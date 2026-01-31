/**
 * Hero Section Component
 * Full-width banner with background image, title, subtitle, and CTA
 */

import { GlassButton } from "@/components/ui/glass-button";
import type { HeroContent, ColorPalette } from "../types";

interface HeroSectionProps {
    content: HeroContent;
    palette: ColorPalette['colors'];
    isEditing?: boolean;
    onContentChange?: (content: HeroContent) => void;
}

export const HeroSection = ({
    content,
    palette,
    isEditing = false,
    onContentChange
}: HeroSectionProps) => {
    const handleTextChange = (field: keyof HeroContent, value: string) => {
        if (onContentChange) {
            onContentChange({ ...content, [field]: value });
        }
    };

    return (
        <section
            className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
            style={{
                backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: content.backgroundImage ? undefined : palette.primary,
            }}
        >
            {/* Overlay */}
            {content.overlay && (
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                />
            )}

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                {isEditing ? (
                    <input
                        type="text"
                        value={content.title}
                        onChange={(e) => handleTextChange('title', e.target.value)}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 bg-transparent border-b-2 border-dashed border-white/50 text-center w-full focus:outline-none"
                        placeholder="Titre principal"
                    />
                ) : (
                    <h1
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                    >
                        {content.title}
                    </h1>
                )}

                {isEditing ? (
                    <textarea
                        value={content.subtitle}
                        onChange={(e) => handleTextChange('subtitle', e.target.value)}
                        className="text-xl md:text-2xl text-white/90 mb-8 bg-transparent border-b-2 border-dashed border-white/30 text-center w-full resize-none focus:outline-none"
                        placeholder="Sous-titre"
                        rows={2}
                    />
                ) : (
                    <p className="text-xl md:text-2xl text-white/90 mb-8">
                        {content.subtitle}
                    </p>
                )}

                {content.ctaText && (
                    <GlassButton
                        variant="primary"
                        size="lg"
                        href={isEditing ? undefined : content.ctaLink}
                        style={{
                            backgroundColor: palette.accent,
                            borderColor: palette.accent,
                        }}
                    >
                        {content.ctaText}
                    </GlassButton>
                )}
            </div>

            {/* Decorative gradient at bottom */}
            <div
                className="absolute bottom-0 left-0 right-0 h-24"
                style={{
                    background: `linear-gradient(to top, ${palette.background}, transparent)`
                }}
            />
        </section>
    );
};

export default HeroSection;
