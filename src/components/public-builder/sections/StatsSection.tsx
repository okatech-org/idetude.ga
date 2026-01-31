/**
 * Stats Section Component
 * Animated statistics display
 */

import { TrendingUp, Users, Award, Calendar } from "lucide-react";
import type { StatsContent, ColorPalette } from "../types";

interface StatsSectionProps {
    content: StatsContent;
    palette: ColorPalette['colors'];
    isEditing?: boolean;
    onContentChange?: (content: StatsContent) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    users: Users,
    award: Award,
    calendar: Calendar,
    trending: TrendingUp,
};

export const StatsSection = ({
    content,
    palette,
    isEditing = false,
    onContentChange
}: StatsSectionProps) => {
    const handleItemChange = (index: number, field: string, value: string) => {
        if (onContentChange) {
            const newItems = [...content.items];
            newItems[index] = { ...newItems[index], [field]: value };
            onContentChange({ ...content, items: newItems });
        }
    };

    return (
        <section
            className="py-16 md:py-24"
            style={{ backgroundColor: `${palette.primary}08` }}
        >
            <div className="container mx-auto px-4">
                {content.title && (
                    <h2
                        className="text-3xl md:text-4xl font-bold text-center mb-12"
                        style={{ color: palette.text }}
                    >
                        {content.title}
                    </h2>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {content.items.map((item, index) => {
                        const Icon = item.icon ? iconMap[item.icon] || TrendingUp : TrendingUp;

                        return (
                            <div
                                key={index}
                                className="text-center p-6 rounded-2xl transition-transform hover:scale-105"
                                style={{ backgroundColor: palette.background }}
                            >
                                <div
                                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                                    style={{ backgroundColor: `${palette.primary}15` }}
                                >
                                    <Icon
                                        className="w-8 h-8"
                                        style={{ color: palette.primary }}
                                    />
                                </div>

                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={item.value}
                                            onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                                            className="text-4xl font-bold mb-2 bg-transparent border-b border-dashed text-center w-full focus:outline-none"
                                            style={{ color: palette.primary, borderColor: palette.muted }}
                                            placeholder="0"
                                        />
                                        <input
                                            type="text"
                                            value={item.label}
                                            onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                                            className="text-sm bg-transparent border-b border-dashed text-center w-full focus:outline-none"
                                            style={{ color: palette.muted, borderColor: palette.muted }}
                                            placeholder="Label"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <p
                                            className="text-4xl font-bold mb-2"
                                            style={{ color: palette.primary }}
                                        >
                                            {item.value}
                                        </p>
                                        <p
                                            className="text-sm"
                                            style={{ color: palette.muted }}
                                        >
                                            {item.label}
                                        </p>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
