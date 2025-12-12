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
        <div className="flex items-center gap-2">
            <label
                htmlFor="format-selector"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                Format:
            </label>
            <select
                id="format-selector"
                value={value}
                onChange={(e) => onChange(e.target.value as OutputFormat)}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
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
