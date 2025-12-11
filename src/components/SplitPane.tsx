/**
 * SplitPane Component
 * 
 * Responsive split layout for editor and preview panels.
 * - Desktop: Side-by-side 50/50 split
 * - Mobile: Stacked vertically
 */

import { ReactNode } from 'react';

/**
 * Props for SplitPane component
 */
interface SplitPaneProps {
    /** Left panel content (editor) */
    left: ReactNode;
    /** Right panel content (preview) */
    right: ReactNode;
    /** Left panel header/title */
    leftTitle?: string;
    /** Right panel header/title */
    rightTitle?: string;
}

/**
 * Responsive split pane layout component
 */
export function SplitPane({
    left,
    right,
    leftTitle = 'Editor',
    rightTitle = 'Preview',
}: SplitPaneProps) {
    return (
        <div className="flex flex-col lg:flex-row w-full h-full gap-0 lg:gap-1">
            {/* Left Panel - Editor */}
            <div className="flex flex-col w-full lg:w-1/2 h-1/2 lg:h-full min-h-[300px]">
                {/* Panel Header */}
                <div className="
          flex items-center justify-between
          px-4 py-2
          bg-gray-100 dark:bg-gray-800
          border-b border-gray-200 dark:border-gray-700
        ">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {leftTitle}
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                        Ctrl+S to format
                    </span>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-hidden">
                    {left}
                </div>
            </div>

            {/* Divider - visible on desktop */}
            <div className="hidden lg:block w-1 bg-gray-200 dark:bg-gray-700 cursor-col-resize hover:bg-blue-500 transition-colors" />

            {/* Right Panel - Preview */}
            <div className="flex flex-col w-full lg:w-1/2 h-1/2 lg:h-full min-h-[300px]">
                {/* Panel Header */}
                <div className="
          flex items-center justify-between
          px-4 py-2
          bg-gray-100 dark:bg-gray-800
          border-b border-gray-200 dark:border-gray-700
        ">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {rightTitle}
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                        Live preview
                    </span>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
                    {right}
                </div>
            </div>
        </div>
    );
}
