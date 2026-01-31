/**
 * Contact Section Component
 * Contact form and information
 */

import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import type { ContactContent, ColorPalette } from "../types";

interface ContactSectionProps {
    content: ContactContent;
    palette: ColorPalette['colors'];
    isEditing?: boolean;
    onContentChange?: (content: ContactContent) => void;
}

export const ContactSection = ({
    content,
    palette,
    isEditing = false,
    onContentChange
}: ContactSectionProps) => {
    const handleTextChange = (field: keyof ContactContent, value: string) => {
        if (onContentChange) {
            onContentChange({ ...content, [field]: value });
        }
    };

    return (
        <section
            id="contact"
            className="py-16 md:py-24"
            style={{ backgroundColor: palette.background }}
        >
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={content.title || ''}
                                onChange={(e) => handleTextChange('title', e.target.value)}
                                className="text-3xl md:text-4xl font-bold mb-4 bg-transparent border-b-2 border-dashed text-center w-full max-w-md mx-auto focus:outline-none"
                                style={{ color: palette.text, borderColor: palette.muted }}
                                placeholder="Titre"
                            />
                            <input
                                type="text"
                                value={content.subtitle || ''}
                                onChange={(e) => handleTextChange('subtitle', e.target.value)}
                                className="text-lg bg-transparent border-b border-dashed text-center w-full max-w-lg mx-auto focus:outline-none"
                                style={{ color: palette.muted, borderColor: palette.muted }}
                                placeholder="Sous-titre"
                            />
                        </>
                    ) : (
                        <>
                            <h2
                                className="text-3xl md:text-4xl font-bold mb-4"
                                style={{ color: palette.text }}
                            >
                                {content.title}
                            </h2>
                            {content.subtitle && (
                                <p style={{ color: palette.muted }}>
                                    {content.subtitle}
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3
                            className="text-xl font-semibold mb-6"
                            style={{ color: palette.text }}
                        >
                            Informations de contact
                        </h3>

                        {content.email && (
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `${palette.primary}15` }}
                                >
                                    <Mail className="w-5 h-5" style={{ color: palette.primary }} />
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: palette.muted }}>Email</p>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={content.email}
                                            onChange={(e) => handleTextChange('email', e.target.value)}
                                            className="font-medium bg-transparent border-b border-dashed focus:outline-none"
                                            style={{ color: palette.text, borderColor: palette.muted }}
                                        />
                                    ) : (
                                        <a
                                            href={`mailto:${content.email}`}
                                            className="font-medium hover:underline"
                                            style={{ color: palette.text }}
                                        >
                                            {content.email}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {content.phone && (
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `${palette.primary}15` }}
                                >
                                    <Phone className="w-5 h-5" style={{ color: palette.primary }} />
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: palette.muted }}>Téléphone</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={content.phone}
                                            onChange={(e) => handleTextChange('phone', e.target.value)}
                                            className="font-medium bg-transparent border-b border-dashed focus:outline-none"
                                            style={{ color: palette.text, borderColor: palette.muted }}
                                        />
                                    ) : (
                                        <a
                                            href={`tel:${content.phone}`}
                                            className="font-medium hover:underline"
                                            style={{ color: palette.text }}
                                        >
                                            {content.phone}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {content.address && (
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${palette.primary}15` }}
                                >
                                    <MapPin className="w-5 h-5" style={{ color: palette.primary }} />
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: palette.muted }}>Adresse</p>
                                    {isEditing ? (
                                        <textarea
                                            value={content.address}
                                            onChange={(e) => handleTextChange('address', e.target.value)}
                                            className="font-medium bg-transparent border-b border-dashed focus:outline-none resize-none w-full"
                                            style={{ color: palette.text, borderColor: palette.muted }}
                                            rows={2}
                                        />
                                    ) : (
                                        <p className="font-medium" style={{ color: palette.text }}>
                                            {content.address}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contact Form */}
                    {content.showForm && (
                        <GlassCard className="p-6">
                            <h3
                                className="text-xl font-semibold mb-6"
                                style={{ color: palette.text }}
                            >
                                Envoyez-nous un message
                            </h3>

                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-1"
                                            style={{ color: palette.text }}
                                        >
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                            style={{
                                                borderColor: palette.muted,
                                                backgroundColor: palette.background,
                                                color: palette.text,
                                            }}
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-1"
                                            style={{ color: palette.text }}
                                        >
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                            style={{
                                                borderColor: palette.muted,
                                                backgroundColor: palette.background,
                                                color: palette.text,
                                            }}
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        className="block text-sm font-medium mb-1"
                                        style={{ color: palette.text }}
                                    >
                                        Sujet
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: palette.muted,
                                            backgroundColor: palette.background,
                                            color: palette.text,
                                        }}
                                        placeholder="Sujet du message"
                                    />
                                </div>

                                <div>
                                    <label
                                        className="block text-sm font-medium mb-1"
                                        style={{ color: palette.text }}
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 resize-none"
                                        style={{
                                            borderColor: palette.muted,
                                            backgroundColor: palette.background,
                                            color: palette.text,
                                        }}
                                        rows={4}
                                        placeholder="Votre message..."
                                    />
                                </div>

                                <GlassButton
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    style={{ backgroundColor: palette.primary }}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Envoyer le message
                                </GlassButton>
                            </form>
                        </GlassCard>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
