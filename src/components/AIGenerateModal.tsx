/**
 * AIGenerateModal Component
 * 
 * Modal for AI operations: Generate, Revise, or Fix diagrams.
 * Supports three modes with different prompts and API endpoints.
 */

'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { DIAGRAM_TYPES } from '@/types';

type AIMode = 'generate' | 'revise' | 'fix';

interface AIGenerateModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Close handler */
    onClose: () => void;
    /** Current diagram type */
    diagramType: string;
    /** Current diagram code (for revise/fix) */
    currentCode: string;
    /** Callback when code is generated/revised/fixed */
    onGenerate: (code: string) => void;
}

const modeConfig = {
    generate: {
        title: 'Generate',
        description: 'Create new diagram from description',
        placeholder: 'e.g., Create a flowchart for user login with 2FA',
        buttonText: 'Generate',
        icon: '/assets/microchip-ai.svg',
    },
    revise: {
        title: 'Revise',
        description: 'Edit existing diagram based on instruction',
        placeholder: 'e.g., Add a logout button after dashboard',
        buttonText: 'Revise',
        icon: '/assets/edit.svg',
    },
    fix: {
        title: 'Fix',
        description: 'Auto-fix syntax errors in diagram',
        placeholder: 'Describe the error (optional)',
        buttonText: 'Fix Syntax',
        icon: '/assets/maintenance.svg',
    },
};

export function AIGenerateModal({
    isOpen,
    onClose,
    diagramType,
    currentCode,
    onGenerate,
}: AIGenerateModalProps) {
    const [mode, setMode] = useState<AIMode>('generate');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resetSession, setResetSession] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Generate sessionId based on diagramType
    const sessionId = `kroki-${diagramType}-owner`;

    // Get diagram label for display
    const diagramLabel = useMemo(() => {
        const type = DIAGRAM_TYPES.find(t => t.id === diagramType);
        return type?.label || diagramType;
    }, [diagramType]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setPrompt('');
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [isOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    // Focus trap
    const handleTabKey = useCallback((e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleTabKey);
            return () => window.removeEventListener('keydown', handleTabKey);
        }
    }, [isOpen, handleTabKey]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // For fix mode, prompt is optional
        if (mode !== 'fix' && !prompt.trim()) return;
        if (isLoading) return;

        // For revise/fix, need current code
        if ((mode === 'revise' || mode === 'fix') && !currentCode.trim()) {
            toast.error('No diagram code to ' + mode);
            return;
        }

        setIsLoading(true);
        try {
            let endpoint = '/api/ai/generate';
            let body: Record<string, string | boolean> = { diagramType, sessionId };

            // Add reset flag if starting new chat
            if (resetSession) {
                body.reset = true;
                setResetSession(false);
            }

            if (mode === 'generate') {
                body.prompt = prompt.trim();
            } else if (mode === 'revise') {
                endpoint = '/api/ai/revise';
                body.code = currentCode;
                body.instruction = prompt.trim();
            } else if (mode === 'fix') {
                endpoint = '/api/ai/fix';
                body.code = currentCode;
                if (prompt.trim()) {
                    body.errorMessage = prompt.trim();
                }
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to ${mode}`);
            }

            const data = await response.json();
            if (data.success && data.code) {
                onGenerate(data.code);
                const messages = {
                    generate: 'Diagram generated! ✨',
                    revise: 'Diagram revised! ✏️',
                    fix: 'Syntax fixed! 🔧',
                };
                toast.success(messages[mode]);
                setPrompt('');
                onClose();
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error(`${mode} error:`, error);
            toast.error(error instanceof Error ? error.message : `Failed to ${mode} diagram`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const config = modeConfig[mode];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="presentation"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-modal-title"
                aria-describedby="ai-modal-description"
                className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl animate-modal-enter"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 id="ai-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                            AI {config.title}
                        </h2>
                        <p id="ai-modal-description" className="text-sm text-gray-500 dark:text-gray-400">
                            {config.description}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Mode Selector */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {(Object.keys(modeConfig) as AIMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${mode === m
                                ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <img src={modeConfig[m].icon} alt="" className="w-4 h-4 dark:invert" />
                            {modeConfig[m].title}
                        </button>
                    ))}
                </div>

                {/* Context Memory Info */}
                <div className="flex items-center justify-between px-6 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Session: {diagramLabel}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            setResetSession(true);
                            toast.success('Next request will start a new chat');
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        🔄 New Chat
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label
                            htmlFor="ai-prompt"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            {mode === 'generate' ? 'Describe your diagram' :
                                mode === 'revise' ? 'What would you like to change?' :
                                    'Error description (optional)'}
                        </label>
                        <textarea
                            ref={inputRef}
                            id="ai-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={config.placeholder}
                            rows={3}
                            className="w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent resize-none placeholder-gray-400"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Warning for revise/fix when no code */}
                    {(mode === 'revise' || mode === 'fix') && !currentCode.trim() && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                            <span className="text-amber-600 dark:text-amber-400">No diagram code in editor</span>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={(mode !== 'fix' && !prompt.trim()) || isLoading || ((mode === 'revise' || mode === 'fix') && !currentCode.trim())}
                            className="px-6 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <img src={config.icon} alt="" className="w-4 h-4 dark:invert" />
                                    {config.buttonText}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
}
