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
    /** Optional action element for left panel header */
    leftAction?: ReactNode;
}

/**
 * Responsive split pane layout component
 */
export function SplitPane({
    left,
    right,
    leftTitle = 'Editor',
    rightTitle = 'Preview',
    leftAction,
}: SplitPaneProps) {
    return (
        <div className="flex flex-col lg:flex-row w-full h-full gap-0 lg:gap-1">
            {/* Left Panel - Editor */}
            <div className="flex flex-col w-full lg:w-1/2 flex-1 lg:flex-none lg:h-full min-h-[200px] lg:min-h-[300px]">
                {/* Panel Header */}
                <div className="
          flex items-center justify-between
          px-3 sm:px-4 py-2
          bg-gray-100 dark:bg-gray-800
          border-b border-gray-200 dark:border-gray-700
        ">
                    <h2 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {leftTitle}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500 hidden sm:inline">
                            Ctrl+S to format
                        </span>
                        {leftAction}
                    </div>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-hidden">
                    {left}
                </div>
            </div>

            {/* Divider - horizontal on mobile, vertical on desktop */}
            <div className="w-full lg:w-1 h-1 lg:h-auto bg-gray-300 dark:bg-gray-600 lg:cursor-col-resize lg:hover:bg-blue-500 transition-colors flex-none" />

            {/* Right Panel - Preview */}
            <div className="flex flex-col w-full lg:w-1/2 flex-1 lg:flex-none lg:h-full min-h-[200px] lg:min-h-[300px]">
                {/* Panel Header */}
                <div className="
          flex items-center justify-between
          px-3 sm:px-4 py-2
          bg-gray-100 dark:bg-gray-800
          border-b border-gray-200 dark:border-gray-700
        ">
                    <h2 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {rightTitle}
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-500 hidden sm:inline">
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

