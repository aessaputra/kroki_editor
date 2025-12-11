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
        <div className="flex items-center gap-3">
            <label
                htmlFor="diagram-type"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                Diagram Type:
            </label>
            <select
                id="diagram-type"
                value={value}
                onChange={(e) => onChange(e.target.value as DiagramType)}
                className="
          px-4 py-2 
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600 
          rounded-lg 
          text-sm font-medium text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          cursor-pointer
          transition-colors
          hover:border-gray-400 dark:hover:border-gray-500
        "
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
