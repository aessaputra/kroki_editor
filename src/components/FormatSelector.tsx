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
        <div className="flex items-center gap-1">
            {/* Icon label for mobile, text for desktop */}
            <label
                htmlFor="format-selector"
                className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400"
            >
                <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Format</span>
            </label>
            <select
                id="format-selector"
                value={value}
                onChange={(e) => onChange(e.target.value as OutputFormat)}
                className="min-h-[36px] sm:min-h-[40px] px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white cursor-pointer"
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
