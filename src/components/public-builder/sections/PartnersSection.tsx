/**
 * PartnersSection Component
 * Displays partner logos with links
 */

import { Plus, Trash2, Building2 } from "lucide-react";
import type { PartnersContent, ColorPalette } from "../types";

interface PartnersSectionProps {
    content: PartnersContent;
    palette: ColorPalette['colors'];
    isEditing?: boolean;
    onContentChange?: (content: PartnersContent) => void;
}

export const PartnersSection = ({
    content,
    palette,
    isEditing = false,
    onContentChange,
}: PartnersSectionProps) => {
    const handleChange = (field: keyof PartnersContent, value: any) => {
        onContentChange?.({ ...content, [field]: value });
    };

    const handleLogoChange = (index: number, field: string, value: string) => {
        const newLogos = [...(content.logos || [])];
        newLogos[index] = { ...newLogos[index], [field]: value };
        handleChange('logos', newLogos);
    };

    const handleAddLogo = () => {
        const newLogos = [...(content.logos || []), { name: 'Partenaire', image: '', url: '' }];
        handleChange('logos', newLogos);
    };

    const handleRemoveLogo = (index: number) => {
        const newLogos = content.logos.filter((_, i) => i !== index);
        handleChange('logos', newLogos);
    };

    return (
        <section
            className="py-16 px-4"
            style={{ backgroundColor: palette.background }}
        >
            <div className="container mx-auto max-w-6xl">
                {/* Title */}
                {isEditing ? (
                    <input
                        type="text"
                        value={content.title || 'Nos partenaires'}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="text-3xl md:text-4xl font-bold text-center w-full mb-12 bg-transparent border-b border-dashed focus:outline-none focus:border-primary"
                        style={{ color: palette.text }}
                    />
                ) : (
                    <h2
                        className="text-3xl md:text-4xl font-bold text-center mb-12"
                        style={{ color: palette.text }}
                    >
                        {content.title || 'Nos partenaires'}
                    </h2>
                )}

                {/* Logos Grid */}
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                    {(content.logos || []).map((logo, index) => (
                        <div
                            key={index}
                            className="relative group"
                        >
                            {isEditing ? (
                                <div
                                    className="w-32 h-24 rounded-lg flex flex-col items-center justify-center p-2 border-2 border-dashed"
                                    style={{ borderColor: `${palette.muted}40` }}
                                >
                                    {logo.image ? (
                                        <img
                                            src={logo.image}
                                            alt={logo.name}
                                            className="max-w-full max-h-12 object-contain mb-2"
                                        />
                                    ) : (
                                        <Building2 className="w-8 h-8 mb-2" style={{ color: palette.muted }} />
                                    )}

                                    <input
                                        type="text"
                                        value={logo.name}
                                        onChange={(e) => handleLogoChange(index, 'name', e.target.value)}
                                        className="text-xs w-full text-center bg-transparent focus:outline-none"
                                        style={{ color: palette.muted }}
                                    />
                                    <input
                                        type="text"
                                        value={logo.image}
                                        onChange={(e) => handleLogoChange(index, 'image', e.target.value)}
                                        className="text-xs w-full text-center bg-transparent focus:outline-none mt-1"
                                        style={{ color: palette.muted }}
                                        placeholder="URL logo"
                                    />
                                    <input
                                        type="text"
                                        value={logo.url || ''}
                                        onChange={(e) => handleLogoChange(index, 'url', e.target.value)}
                                        className="text-xs w-full text-center bg-transparent focus:outline-none mt-1"
                                        style={{ color: palette.muted }}
                                        placeholder="Lien (optionnel)"
                                    />

                                    <button
                                        onClick={() => handleRemoveLogo(index)}
                                        className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : logo.url ? (
                                <a
                                    href={logo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
                                    title={logo.name}
                                >
                                    {logo.image ? (
                                        <img
                                            src={logo.image}
                                            alt={logo.name}
                                            className="h-12 md:h-16 w-auto object-contain"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: `${palette.muted}20` }}>
                                            <Building2 className="w-6 h-6" style={{ color: palette.muted }} />
                                            <span style={{ color: palette.text }}>{logo.name}</span>
                                        </div>
                                    )}
                                </a>
                            ) : (
                                <div
                                    className="grayscale opacity-60"
                                    title={logo.name}
                                >
                                    {logo.image ? (
                                        <img
                                            src={logo.image}
                                            alt={logo.name}
                                            className="h-12 md:h-16 w-auto object-contain"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: `${palette.muted}20` }}>
                                            <Building2 className="w-6 h-6" style={{ color: palette.muted }} />
                                            <span style={{ color: palette.text }}>{logo.name}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Logo Button */}
                    {isEditing && (
                        <button
                            onClick={handleAddLogo}
                            className="w-32 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center hover:border-primary transition-colors"
                            style={{ borderColor: `${palette.muted}50` }}
                        >
                            <Plus className="w-6 h-6 mb-1" style={{ color: palette.muted }} />
                            <span className="text-xs" style={{ color: palette.muted }}>Ajouter</span>
                        </button>
                    )}
                </div>

                {!isEditing && content.logos.length === 0 && (
                    <p className="text-center py-8" style={{ color: palette.muted }}>
                        Aucun partenaire ajouté
                    </p>
                )}
            </div>
        </section>
    );
};

export default PartnersSection;
