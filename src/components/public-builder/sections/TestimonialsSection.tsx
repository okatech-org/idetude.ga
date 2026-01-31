/**
 * TestimonialsSection Component
 * Displays testimonials/quotes from parents and students
 */

import { useState } from "react";
import { Plus, Trash2, Quote, User } from "lucide-react";
import type { TestimonialsContent, ColorPalette } from "../types";

interface TestimonialsSectionProps {
    content: TestimonialsContent;
    palette: ColorPalette['colors'];
    isEditing?: boolean;
    onContentChange?: (content: TestimonialsContent) => void;
}

export const TestimonialsSection = ({
    content,
    palette,
    isEditing = false,
    onContentChange,
}: TestimonialsSectionProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleChange = (field: keyof TestimonialsContent, value: any) => {
        onContentChange?.({ ...content, [field]: value });
    };

    const handleItemChange = (index: number, field: string, value: string) => {
        const newItems = [...(content.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleChange('items', newItems);
    };

    const handleAddItem = () => {
        const newItems = [...(content.items || []), {
            quote: 'Témoignage ici...',
            author: 'Nom',
            role: 'Parent d\'élève',
            avatar: ''
        }];
        handleChange('items', newItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = content.items.filter((_, i) => i !== index);
        handleChange('items', newItems);
        if (activeIndex >= newItems.length) {
            setActiveIndex(Math.max(0, newItems.length - 1));
        }
    };

    return (
        <section
            className="py-16 px-4"
            style={{ backgroundColor: `${palette.secondary}08` }}
        >
            <div className="container mx-auto max-w-4xl">
                {/* Title */}
                {isEditing ? (
                    <input
                        type="text"
                        value={content.title || 'Témoignages'}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="text-3xl md:text-4xl font-bold text-center w-full mb-12 bg-transparent border-b border-dashed focus:outline-none focus:border-primary"
                        style={{ color: palette.text }}
                    />
                ) : (
                    <h2
                        className="text-3xl md:text-4xl font-bold text-center mb-12"
                        style={{ color: palette.text }}
                    >
                        {content.title || 'Témoignages'}
                    </h2>
                )}

                {/* Testimonials */}
                {isEditing ? (
                    // Grid layout for editing
                    <div className="grid gap-6">
                        {(content.items || []).map((item, index) => (
                            <div
                                key={index}
                                className="rounded-xl p-6 relative group"
                                style={{
                                    backgroundColor: palette.background,
                                    boxShadow: `0 4px 20px ${palette.muted}20`,
                                }}
                            >
                                <Quote
                                    className="w-8 h-8 mb-4 opacity-20"
                                    style={{ color: palette.primary }}
                                />

                                <textarea
                                    value={item.quote}
                                    onChange={(e) => handleItemChange(index, 'quote', e.target.value)}
                                    className="text-lg w-full bg-transparent border-b border-dashed focus:outline-none resize-none mb-4"
                                    style={{ color: palette.text }}
                                    rows={3}
                                    placeholder="Texte du témoignage..."
                                />

                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                                        style={{ backgroundColor: `${palette.muted}30` }}
                                    >
                                        {item.avatar ? (
                                            <img src={item.avatar} alt={item.author} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6" style={{ color: palette.muted }} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={item.author}
                                            onChange={(e) => handleItemChange(index, 'author', e.target.value)}
                                            className="font-semibold w-full bg-transparent border-b border-dashed focus:outline-none"
                                            style={{ color: palette.text }}
                                            placeholder="Nom de l'auteur"
                                        />
                                        <input
                                            type="text"
                                            value={item.role || ''}
                                            onChange={(e) => handleItemChange(index, 'role', e.target.value)}
                                            className="text-sm w-full bg-transparent border-b border-dashed focus:outline-none mt-1"
                                            style={{ color: palette.muted }}
                                            placeholder="Rôle (parent, élève...)"
                                        />
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    value={item.avatar || ''}
                                    onChange={(e) => handleItemChange(index, 'avatar', e.target.value)}
                                    className="text-xs w-full bg-transparent border-b border-dashed focus:outline-none mt-3"
                                    style={{ color: palette.muted }}
                                    placeholder="URL de l'avatar (optionnel)"
                                />

                                <button
                                    onClick={() => handleRemoveItem(index)}
                                    className="absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={handleAddItem}
                            className="rounded-xl p-6 border-2 border-dashed flex items-center justify-center gap-2 hover:border-primary transition-colors"
                            style={{ borderColor: `${palette.muted}50` }}
                        >
                            <Plus className="w-5 h-5" style={{ color: palette.muted }} />
                            <span style={{ color: palette.muted }}>Ajouter un témoignage</span>
                        </button>
                    </div>
                ) : (
                    // Carousel layout for viewing
                    content.items.length > 0 ? (
                        <div className="relative">
                            <div
                                className="rounded-xl p-8 md:p-12 text-center"
                                style={{
                                    backgroundColor: palette.background,
                                    boxShadow: `0 4px 30px ${palette.muted}20`,
                                }}
                            >
                                <Quote
                                    className="w-12 h-12 mx-auto mb-6 opacity-20"
                                    style={{ color: palette.primary }}
                                />

                                <p
                                    className="text-xl md:text-2xl italic mb-8"
                                    style={{ color: palette.text }}
                                >
                                    "{content.items[activeIndex]?.quote}"
                                </p>

                                <div className="flex items-center justify-center gap-4">
                                    <div
                                        className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
                                        style={{ backgroundColor: `${palette.muted}30` }}
                                    >
                                        {content.items[activeIndex]?.avatar ? (
                                            <img
                                                src={content.items[activeIndex].avatar}
                                                alt={content.items[activeIndex].author}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-7 h-7" style={{ color: palette.muted }} />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold" style={{ color: palette.text }}>
                                            {content.items[activeIndex]?.author}
                                        </p>
                                        {content.items[activeIndex]?.role && (
                                            <p className="text-sm" style={{ color: palette.muted }}>
                                                {content.items[activeIndex].role}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Navigation dots */}
                            {content.items.length > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {content.items.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveIndex(index)}
                                            className={`w-3 h-3 rounded-full transition-colors ${index === activeIndex ? 'scale-125' : 'opacity-50'
                                                }`}
                                            style={{
                                                backgroundColor: index === activeIndex ? palette.primary : palette.muted
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-center py-8" style={{ color: palette.muted }}>
                            Aucun témoignage ajouté
                        </p>
                    )
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;
