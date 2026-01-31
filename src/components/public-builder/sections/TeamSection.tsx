/**
 * TeamSection Component
 * Displays team members with photos and bios
 */

import { useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import type { TeamContent, ColorPalette } from "../types";

interface TeamSectionProps {
    content: TeamContent;
    palette: ColorPalette['colors'];
    isEditing?: boolean;
    onContentChange?: (content: TeamContent) => void;
}

export const TeamSection = ({
    content,
    palette,
    isEditing = false,
    onContentChange,
}: TeamSectionProps) => {
    const [editingMember, setEditingMember] = useState<number | null>(null);

    const handleChange = (field: keyof TeamContent, value: any) => {
        onContentChange?.({ ...content, [field]: value });
    };

    const handleMemberChange = (index: number, field: string, value: string) => {
        const newMembers = [...(content.members || [])];
        newMembers[index] = { ...newMembers[index], [field]: value };
        handleChange('members', newMembers);
    };

    const handleAddMember = () => {
        const newMembers = [...(content.members || []), { name: 'Nouveau membre', role: 'Fonction', image: '', bio: '' }];
        handleChange('members', newMembers);
        setEditingMember(newMembers.length - 1);
    };

    const handleRemoveMember = (index: number) => {
        const newMembers = content.members.filter((_, i) => i !== index);
        handleChange('members', newMembers);
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
                        value={content.title || 'Notre équipe'}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="text-3xl md:text-4xl font-bold text-center w-full mb-2 bg-transparent border-b border-dashed focus:outline-none focus:border-primary"
                        style={{ color: palette.text }}
                    />
                ) : (
                    <h2
                        className="text-3xl md:text-4xl font-bold text-center mb-2"
                        style={{ color: palette.text }}
                    >
                        {content.title || 'Notre équipe'}
                    </h2>
                )}

                {/* Subtitle */}
                {isEditing ? (
                    <input
                        type="text"
                        value={content.subtitle || ''}
                        onChange={(e) => handleChange('subtitle', e.target.value)}
                        className="text-lg text-center w-full mb-12 bg-transparent border-b border-dashed focus:outline-none"
                        style={{ color: palette.muted }}
                        placeholder="Sous-titre (optionnel)"
                    />
                ) : content.subtitle && (
                    <p
                        className="text-lg text-center mb-12"
                        style={{ color: palette.muted }}
                    >
                        {content.subtitle}
                    </p>
                )}

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(content.members || []).map((member, index) => (
                        <div
                            key={index}
                            className="rounded-xl p-6 text-center transition-transform hover:scale-105 relative group"
                            style={{
                                backgroundColor: `${palette.primary}08`,
                                borderColor: `${palette.muted}30`,
                            }}
                        >
                            {/* Avatar */}
                            <div
                                className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 flex items-center justify-center"
                                style={{ backgroundColor: `${palette.muted}30` }}
                            >
                                {member.image ? (
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12" style={{ color: palette.muted }} />
                                )}
                            </div>

                            {/* Name */}
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={member.name}
                                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                    className="font-semibold text-lg w-full text-center bg-transparent border-b border-dashed focus:outline-none"
                                    style={{ color: palette.text }}
                                />
                            ) : (
                                <h3 className="font-semibold text-lg" style={{ color: palette.text }}>
                                    {member.name}
                                </h3>
                            )}

                            {/* Role */}
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={member.role}
                                    onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                                    className="text-sm w-full text-center bg-transparent border-b border-dashed focus:outline-none mt-1"
                                    style={{ color: palette.primary }}
                                />
                            ) : (
                                <p className="text-sm mt-1" style={{ color: palette.primary }}>
                                    {member.role}
                                </p>
                            )}

                            {/* Bio */}
                            {isEditing ? (
                                <textarea
                                    value={member.bio || ''}
                                    onChange={(e) => handleMemberChange(index, 'bio', e.target.value)}
                                    className="text-sm w-full text-center bg-transparent border-b border-dashed focus:outline-none mt-3 resize-none"
                                    style={{ color: palette.muted }}
                                    placeholder="Bio (optionnel)"
                                    rows={2}
                                />
                            ) : member.bio && (
                                <p className="text-sm mt-3" style={{ color: palette.muted }}>
                                    {member.bio}
                                </p>
                            )}

                            {/* Image URL (editing only) */}
                            {isEditing && (
                                <input
                                    type="text"
                                    value={member.image || ''}
                                    onChange={(e) => handleMemberChange(index, 'image', e.target.value)}
                                    className="text-xs w-full text-center bg-transparent border-b border-dashed focus:outline-none mt-2"
                                    style={{ color: palette.muted }}
                                    placeholder="URL de l'image"
                                />
                            )}

                            {/* Remove button */}
                            {isEditing && (
                                <button
                                    onClick={() => handleRemoveMember(index)}
                                    className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Member Button */}
                    {isEditing && (
                        <button
                            onClick={handleAddMember}
                            className="rounded-xl p-6 border-2 border-dashed flex flex-col items-center justify-center min-h-[200px] hover:border-primary transition-colors"
                            style={{ borderColor: `${palette.muted}50` }}
                        >
                            <Plus className="w-8 h-8 mb-2" style={{ color: palette.muted }} />
                            <span style={{ color: palette.muted }}>Ajouter un membre</span>
                        </button>
                    )}
                </div>

                {!isEditing && content.members.length === 0 && (
                    <p className="text-center py-8" style={{ color: palette.muted }}>
                        Aucun membre ajouté
                    </p>
                )}
            </div>
        </section>
    );
};

export default TeamSection;
