'use client';

/**
 * DiagramTypeSelector Component
 * 
 * Dropdown selector for choosing diagram type.
 * Single responsibility: diagram type selection UI.
 */

import { DiagramType, DIAGRAM_TYPES } from '@/types';

/**
 * Props for DiagramTypeSelector component
 */
interface DiagramTypeSelectorProps {
    /** Currently selected diagram type */
    value: DiagramType;
    /** Callback when diagram type changes */
    onChange: (type: DiagramType) => void;
}

/**
 * Dropdown selector for diagram types
 */
export function DiagramTypeSelector({
    value,
    onChange,
}: DiagramTypeSelectorProps) {
    return (
        <div className="flex items-center gap-1">
            {/* Icon label for mobile, text for desktop */}
            <label
                htmlFor="diagram-type"
                className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400"
            >
                <img
                    src="/assets/format.svg"
                    alt="Type"
                    className="w-4 h-4 sm:hidden dark:invert opacity-70"
                />
                <span className="hidden sm:inline">Type</span>
            </label>
            <select
                id="diagram-type"
                value={value}
                onChange={(e) => onChange(e.target.value as DiagramType)}
                className="min-h-[36px] sm:min-h-[40px] px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white font-medium cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
                {DIAGRAM_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                        {type.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
