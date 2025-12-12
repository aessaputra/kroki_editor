'use client';

/**
 * FormatSelector Component
 * 
 * Dropdown selector for choosing output format based on diagram type support.
 */

import { OutputFormat, OUTPUT_FORMAT_LABELS } from '@/types';

interface FormatSelectorProps {
    /** Currently selected format */
    value: OutputFormat;
    /** Callback when format changes */
    onChange: (format: OutputFormat) => void;
    /** List of supported formats for current diagram type */
    supportedFormats: OutputFormat[];
}

/**
 * Output format selector dropdown
 */
export function FormatSelector({ value, onChange, supportedFormats }: FormatSelectorProps) {
    return (
        <div className="flex items-center gap-1.5 sm:gap-2">
            <label
                htmlFor="format-selector"
                className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
                <span className="hidden sm:inline">Format:</span>
                <span className="sm:hidden">Format:</span>
            </label>
            <select
                id="format-selector"
                value={value}
                onChange={(e) => onChange(e.target.value as OutputFormat)}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
            >
                {supportedFormats.map((format) => (
                    <option key={format} value={format}>
                        {OUTPUT_FORMAT_LABELS[format]}
                    </option>
                ))}
            </select>
        </div>
    );
}
