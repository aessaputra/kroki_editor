'use client';

/**
 * DiagramPreview Component
 * 
 * Enhanced preview with loading state, URL display, and download functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import { OutputFormat, getFileExtension } from '@/types';

/**
 * Props for DiagramPreview component
 */
interface DiagramPreviewProps {
    /** Kroki URL for the diagram image */
    imageUrl: string;
    /** Whether an update is in progress */
    isUpdating?: boolean;
    /** Current diagram type for filename */
    diagramType?: string;
    /** Current output format for download extension */
    outputFormat?: OutputFormat;
}

/**
 * Preview component for rendered diagrams
 */
export function DiagramPreview({ imageUrl, isUpdating = false, diagramType = 'diagram', outputFormat = 'svg' }: DiagramPreviewProps) {
    const [key, setKey] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showUrlCopied, setShowUrlCopied] = useState(false);

    // Reset key when URL changes to force iframe reload
    useEffect(() => {
        if (imageUrl) {
            setKey(prev => prev + 1);
            setHasError(false);
            setIsLoading(true);
        }
    }, [imageUrl]);

    // Handle iframe load
    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    // Handle copy URL
    const handleCopyUrl = useCallback(async () => {
        if (imageUrl) {
            try {
                await navigator.clipboard.writeText(imageUrl);
                setShowUrlCopied(true);
                setTimeout(() => setShowUrlCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy URL:', err);
            }
        }
    }, [imageUrl]);

    // Handle download with correct file extension
    const handleDownload = useCallback(async () => {
        if (!imageUrl) return;

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Use getFileExtension to get correct extension (base64 -> txt)
            const extension = getFileExtension(outputFormat);
            a.download = `${diagramType}-${Date.now()}.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to download:', err);
        }
    }, [imageUrl, diagramType, outputFormat]);

    // Empty state - no URL provided
    if (!imageUrl) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                    <svg
                        className="w-16 h-16 mx-auto mb-4 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="font-medium text-lg">Start typing to see your diagram</p>
                    <p className="text-sm mt-2 opacity-75">Your diagram will appear here as you type</p>
                </div>
            </div>
        );
    }

    // Error state
    if (hasError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-950">
                <div className="text-center text-red-600 dark:text-red-400 p-8">
                    <svg
                        className="w-16 h-16 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <p className="font-medium text-lg">Failed to render diagram</p>
                    <p className="text-sm mt-2 opacity-75">
                        Check your diagram syntax and try again
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900">
            {/* Toolbar */}
            <div className="flex-none flex items-center justify-between gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {/* URL Display */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                    <svg
                        className="w-4 h-4 flex-none text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                    </svg>
                    <input
                        type="text"
                        value={imageUrl}
                        readOnly
                        className="flex-1 text-xs font-mono bg-transparent text-gray-600 dark:text-gray-400 outline-none truncate cursor-text"
                        onClick={(e) => e.currentTarget.select()}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex-none flex items-center gap-1">
                    {/* Copy URL Button */}
                    <button
                        onClick={handleCopyUrl}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
                        title="Copy URL"
                    >
                        {showUrlCopied ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Copy</span>
                            </>
                        )}
                    </button>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded transition-colors flex items-center gap-1.5"
                        title="Download SVG"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download</span>
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Loading Overlay */}
                {(isLoading || isUpdating) && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <svg
                                    className="w-12 h-12 animate-spin text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {isLoading ? 'Loading diagram...' : 'Updating diagram...'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Rendering from Kroki service
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Iframe for SVG rendering */}
                <iframe
                    key={key}
                    src={imageUrl}
                    title="Diagram preview"
                    className="w-full h-full border-0"
                    onLoad={handleLoad}
                    onError={() => setHasError(true)}
                    style={{
                        backgroundColor: 'transparent',
                    }}
                />
            </div>
        </div>
    );
}
