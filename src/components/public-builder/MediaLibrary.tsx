/**
 * MediaLibrary Component
 * Gallery of uploaded images for reuse
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Search,
    Trash2,
    Check,
    Image as ImageIcon,
    FolderOpen,
    Upload,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MediaItem {
    id: string;
    url: string;
    filename: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    category: string;
    alt_text?: string;
    caption?: string;
    created_at: string;
}

interface MediaLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    establishmentId: string;
    category?: string;
}

export const MediaLibrary = ({
    isOpen,
    onClose,
    onSelect,
    establishmentId,
    category: defaultCategory,
}: MediaLibraryProps) => {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState(defaultCategory || 'all');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen, category]);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            let url = `/api/db/establishments/${establishmentId}/media`;
            if (category && category !== 'all') {
                url += `?category=${category}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                setMedia(await response.json());
            }
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette image ?')) return;

        try {
            const response = await fetch(`/api/db/media/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setMedia(prev => prev.filter(m => m.id !== id));
                toast.success('Image supprimée');
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleSelect = () => {
        const selected = media.find(m => m.id === selectedId);
        if (selected) {
            onSelect(selected.url);
            onClose();
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', category !== 'all' ? category : 'general');

        try {
            const response = await fetch(`/api/db/establishments/${establishmentId}/media`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const newMedia = await response.json();
                setMedia(prev => [newMedia, ...prev]);
                toast.success('Image uploadée avec succès');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Erreur lors de l\'upload');
            }
        } catch (error) {
            toast.error('Erreur lors de l\'upload');
            console.error('Upload failed:', error);
        }

        // Reset input
        e.target.value = '';
    };

    const filteredMedia = media.filter(m =>
        m.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        Bibliothèque de médias
                    </DialogTitle>
                </DialogHeader>

                {/* Filters */}
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            <SelectItem value="hero">Héros</SelectItem>
                            <SelectItem value="gallery">Galerie</SelectItem>
                            <SelectItem value="team">Équipe</SelectItem>
                            <SelectItem value="general">Général</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Upload Button */}
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                        />
                        <GlassButton variant="primary" type="button" asChild>
                            <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Uploader
                            </span>
                        </GlassButton>
                    </label>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                            <p>Aucune image</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredMedia.map((item) => (
                                <div
                                    key={item.id}
                                    className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedId === item.id
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-transparent hover:border-muted-foreground/30'
                                        }`}
                                    onClick={() => setSelectedId(item.id)}
                                >
                                    <div className="aspect-square">
                                        <img
                                            src={item.url}
                                            alt={item.alt_text || item.original_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Selection indicator */}
                                    {selectedId === item.id && (
                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                    )}

                                    {/* Info overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-xs text-white truncate">{item.original_name}</p>
                                        <p className="text-xs text-white/70">{formatFileSize(item.file_size)}</p>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                        className="absolute top-2 left-2 p-1 rounded bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                        {filteredMedia.length} image{filteredMedia.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2">
                        <GlassButton variant="outline" onClick={onClose}>
                            Annuler
                        </GlassButton>
                        <GlassButton
                            variant="primary"
                            onClick={handleSelect}
                            disabled={!selectedId}
                        >
                            Sélectionner
                        </GlassButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MediaLibrary;
