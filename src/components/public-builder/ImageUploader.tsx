/**
 * ImageUploader Component
 * Upload images with size/position customization
 */

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
    Upload,
    X,
    Image as ImageIcon,
    Settings2,
    Maximize2,
    Move,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export interface ImageConfig {
    url: string;
    width?: string;
    height?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
    objectPosition?: string;
    borderRadius?: string;
    overlay?: boolean;
    overlayColor?: string;
    overlayOpacity?: number;
}

interface ImageUploaderProps {
    value?: ImageConfig;
    onChange?: (config: ImageConfig) => void;
    establishmentId: string;
    category?: string;
    aspectRatio?: string;
    maxHeight?: string;
    label?: string;
}

export const ImageUploader = ({
    value,
    onChange,
    establishmentId,
    category = 'general',
    aspectRatio,
    maxHeight = '400px',
    label = 'Image',
}: ImageUploaderProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [config, setConfig] = useState<ImageConfig>(value || { url: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith('image/')) {
            uploadFile(file);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('category', category);

            const response = await fetch(`/api/db/establishments/${establishmentId}/media`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const media = await response.json();
            const newConfig = { ...config, url: media.url };
            setConfig(newConfig);
            onChange?.(newConfig);
            toast.success('Image uploadée');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("Erreur lors de l'upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleConfigChange = (key: keyof ImageConfig, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        onChange?.(newConfig);
    };

    const handleRemove = () => {
        const newConfig = { url: '' };
        setConfig(newConfig);
        onChange?.(newConfig);
    };

    return (
        <div className="space-y-2">
            {label && (
                <Label className="text-sm font-medium">{label}</Label>
            )}

            {config.url ? (
                <div
                    className="relative group rounded-lg overflow-hidden"
                    style={{
                        maxHeight,
                        aspectRatio,
                    }}
                >
                    <img
                        src={config.url}
                        alt="Uploaded"
                        className="w-full h-full transition-transform"
                        style={{
                            objectFit: config.objectFit || 'cover',
                            objectPosition: config.objectPosition || 'center',
                            borderRadius: config.borderRadius || '0.5rem',
                        }}
                    />

                    {/* Overlay preview */}
                    {config.overlay && (
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundColor: config.overlayColor || '#000000',
                                opacity: config.overlayOpacity || 0.5,
                            }}
                        />
                    )}

                    {/* Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <GlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => setShowSettings(true)}
                        >
                            <Settings2 className="w-4 h-4 mr-1" />
                            Paramètres
                        </GlassButton>
                        <GlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-4 h-4 mr-1" />
                            Changer
                        </GlassButton>
                        <GlassButton
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={handleRemove}
                        >
                            <X className="w-4 h-4" />
                        </GlassButton>
                    </div>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                    style={{ minHeight: '150px' }}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            <p className="text-sm text-muted-foreground">Upload en cours...</p>
                        </div>
                    ) : (
                        <>
                            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Glissez une image ou cliquez pour sélectionner
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                PNG, JPG, GIF, WebP (max 10MB)
                            </p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Settings Dialog */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Paramètres de l'image</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Size */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">Largeur</Label>
                                <Input
                                    value={config.width || '100%'}
                                    onChange={(e) => handleConfigChange('width', e.target.value)}
                                    placeholder="100%, 500px, auto"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Hauteur</Label>
                                <Input
                                    value={config.height || 'auto'}
                                    onChange={(e) => handleConfigChange('height', e.target.value)}
                                    placeholder="400px, 50vh, auto"
                                />
                            </div>
                        </div>

                        {/* Object Fit */}
                        <div className="space-y-2">
                            <Label className="text-sm flex items-center gap-2">
                                <Maximize2 className="w-4 h-4" />
                                Ajustement
                            </Label>
                            <Select
                                value={config.objectFit || 'cover'}
                                onValueChange={(v) => handleConfigChange('objectFit', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cover">Couvrir (recadrage)</SelectItem>
                                    <SelectItem value="contain">Contenir (entier)</SelectItem>
                                    <SelectItem value="fill">Remplir (déformé)</SelectItem>
                                    <SelectItem value="none">Taille originale</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Object Position */}
                        <div className="space-y-2">
                            <Label className="text-sm flex items-center gap-2">
                                <Move className="w-4 h-4" />
                                Position
                            </Label>
                            <Select
                                value={config.objectPosition || 'center'}
                                onValueChange={(v) => handleConfigChange('objectPosition', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="center">Centre</SelectItem>
                                    <SelectItem value="top">Haut</SelectItem>
                                    <SelectItem value="bottom">Bas</SelectItem>
                                    <SelectItem value="left">Gauche</SelectItem>
                                    <SelectItem value="right">Droite</SelectItem>
                                    <SelectItem value="top left">Haut gauche</SelectItem>
                                    <SelectItem value="top right">Haut droite</SelectItem>
                                    <SelectItem value="bottom left">Bas gauche</SelectItem>
                                    <SelectItem value="bottom right">Bas droite</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Border Radius */}
                        <div className="space-y-2">
                            <Label className="text-sm">Coins arrondis</Label>
                            <Select
                                value={config.borderRadius || '0.5rem'}
                                onValueChange={(v) => handleConfigChange('borderRadius', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Aucun</SelectItem>
                                    <SelectItem value="0.25rem">Petit</SelectItem>
                                    <SelectItem value="0.5rem">Moyen</SelectItem>
                                    <SelectItem value="1rem">Grand</SelectItem>
                                    <SelectItem value="1.5rem">Très grand</SelectItem>
                                    <SelectItem value="50%">Cercle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Overlay */}
                        <GlassCard className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Superposition</Label>
                                <input
                                    type="checkbox"
                                    checked={config.overlay || false}
                                    onChange={(e) => handleConfigChange('overlay', e.target.checked)}
                                    className="rounded"
                                />
                            </div>

                            {config.overlay && (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Couleur</Label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={config.overlayColor || '#000000'}
                                                onChange={(e) => handleConfigChange('overlayColor', e.target.value)}
                                                className="w-10 h-10 rounded cursor-pointer"
                                            />
                                            <Input
                                                value={config.overlayColor || '#000000'}
                                                onChange={(e) => handleConfigChange('overlayColor', e.target.value)}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">
                                            Opacité: {Math.round((config.overlayOpacity || 0.5) * 100)}%
                                        </Label>
                                        <Slider
                                            value={[(config.overlayOpacity || 0.5) * 100]}
                                            onValueChange={([v]) => handleConfigChange('overlayOpacity', v / 100)}
                                            max={100}
                                            step={5}
                                        />
                                    </div>
                                </>
                            )}
                        </GlassCard>
                    </div>

                    <div className="flex justify-end mt-4">
                        <GlassButton onClick={() => setShowSettings(false)}>
                            Terminé
                        </GlassButton>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ImageUploader;
