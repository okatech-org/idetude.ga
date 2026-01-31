/**
 * GallerySection Component
 * Photo gallery with grid/masonry layout
 */

import { useState } from "react";
import { Plus, Trash2, X, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { GalleryContent, ColorPalette } from "../types";

interface GallerySectionProps {
    content: GalleryContent;
    palette: ColorPalette['colors'];
    isEditing?: boolean;
    onContentChange?: (content: GalleryContent) => void;
}

export const GallerySection = ({
    content,
    palette,
    isEditing = false,
    onContentChange,
}: GallerySectionProps) => {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    const handleChange = (field: keyof GalleryContent, value: any) => {
        onContentChange?.({ ...content, [field]: value });
    };

    const handleImageChange = (index: number, field: string, value: string) => {
        const newImages = [...(content.images || [])];
        newImages[index] = { ...newImages[index], [field]: value };
        handleChange('images', newImages);
    };

    const handleAddImage = () => {
        const newImages = [...(content.images || []), { url: '', caption: '' }];
        handleChange('images', newImages);
    };

    const handleRemoveImage = (index: number) => {
        const newImages = content.images.filter((_, i) => i !== index);
        handleChange('images', newImages);
    };

    const gridClasses = {
        grid: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
        masonry: 'columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4',
        carousel: 'flex gap-4 overflow-x-auto pb-4',
    };

    return (
        <section
            className="py-16 px-4"
            style={{ backgroundColor: `${palette.primary}05` }}
        >
            <div className="container mx-auto max-w-6xl">
                {/* Title */}
                {isEditing ? (
                    <input
                        type="text"
                        value={content.title || 'Galerie'}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="text-3xl md:text-4xl font-bold text-center w-full mb-8 bg-transparent border-b border-dashed focus:outline-none focus:border-primary"
                        style={{ color: palette.text }}
                    />
                ) : (
                    <h2
                        className="text-3xl md:text-4xl font-bold text-center mb-8"
                        style={{ color: palette.text }}
                    >
                        {content.title || 'Galerie'}
                    </h2>
                )}

                {/* Layout selector (editing only) */}
                {isEditing && (
                    <div className="flex justify-center gap-2 mb-6">
                        {(['grid', 'masonry', 'carousel'] as const).map((layout) => (
                            <button
                                key={layout}
                                onClick={() => handleChange('layout', layout)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${content.layout === layout
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted hover:bg-muted/80'
                                    }`}
                            >
                                {layout === 'grid' ? 'Grille' : layout === 'masonry' ? 'Mosaïque' : 'Carrousel'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Gallery Grid */}
                <div className={content.layout === 'carousel' ? gridClasses.carousel : gridClasses[content.layout || 'grid']}>
                    {(content.images || []).map((image, index) => (
                        <div
                            key={index}
                            className={`relative group overflow-hidden rounded-xl cursor-pointer ${content.layout === 'masonry' ? 'break-inside-avoid mb-4' : ''
                                } ${content.layout === 'carousel' ? 'flex-shrink-0 w-72' : ''}`}
                            onClick={() => !isEditing && setSelectedImage(index)}
                        >
                            {image.url ? (
                                <img
                                    src={image.url}
                                    alt={image.caption || `Image ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    style={{
                                        aspectRatio: content.layout === 'masonry' ? 'auto' : '1',
                                        minHeight: content.layout === 'masonry' ? '150px' : undefined,
                                    }}
                                />
                            ) : (
                                <div
                                    className="aspect-square flex items-center justify-center"
                                    style={{ backgroundColor: `${palette.muted}20` }}
                                >
                                    <ImageIcon className="w-12 h-12" style={{ color: palette.muted }} />
                                </div>
                            )}

                            {/* Caption overlay */}
                            {image.caption && !isEditing && (
                                <div
                                    className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <p className="text-white text-sm">{image.caption}</p>
                                </div>
                            )}

                            {/* Editing controls */}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                    <input
                                        type="text"
                                        value={image.url}
                                        onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                                        className="w-full text-xs p-2 rounded bg-white/90 text-gray-800 mb-2"
                                        placeholder="URL de l'image"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <input
                                        type="text"
                                        value={image.caption || ''}
                                        onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                                        className="w-full text-xs p-2 rounded bg-white/90 text-gray-800"
                                        placeholder="Légende (optionnel)"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                                        className="mt-2 p-2 rounded bg-destructive text-white hover:bg-destructive/90"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Image Button */}
                    {isEditing && (
                        <button
                            onClick={handleAddImage}
                            className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center hover:border-primary transition-colors ${content.layout === 'carousel' ? 'flex-shrink-0 w-72 h-72' : 'aspect-square'
                                }`}
                            style={{ borderColor: `${palette.muted}50` }}
                        >
                            <Plus className="w-8 h-8 mb-2" style={{ color: palette.muted }} />
                            <span className="text-sm" style={{ color: palette.muted }}>Ajouter une image</span>
                        </button>
                    )}
                </div>

                {!isEditing && content.images.length === 0 && (
                    <p className="text-center py-8" style={{ color: palette.muted }}>
                        Aucune image ajoutée
                    </p>
                )}
            </div>

            {/* Lightbox */}
            <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
                    {selectedImage !== null && content.images[selectedImage] && (
                        <div className="relative">
                            <img
                                src={content.images[selectedImage].url}
                                alt={content.images[selectedImage].caption || ''}
                                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                            />
                            {content.images[selectedImage].caption && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                                    <p className="text-white">{content.images[selectedImage].caption}</p>
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default GallerySection;
