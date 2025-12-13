/**
 * AIGenerateButton Component
 * 
 * Floating action button with Lottie animation.
 * Appears only for authenticated owners.
 * 
 * Best Practice Placement (FAB):
 * - Bottom-right corner for primary action
 * - Above footer/other FABs with proper spacing
 * - z-index to stay above content
 */

'use client';

import dynamic from 'next/dynamic';

// Dynamic import for Lottie (client-side only)
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Import animation data
import brainAnimation from '../../public/assets/artificial-intelligence-brain.json';

interface AIGenerateButtonProps {
    /** Whether the user is authenticated as owner */
    isOwner: boolean;
    /** Click handler to open modal */
    onClick: () => void;
}

export function AIGenerateButton({ isOwner, onClick }: AIGenerateButtonProps) {
    // Don't render if not owner
    if (!isOwner) {
        return null;
    }

    return (
        <button
            onClick={onClick}
            className="
                fixed bottom-6 right-6 z-40
                w-14 h-14 sm:w-16 sm:h-16
                bg-white dark:bg-gray-900
                border-2 border-gray-900 dark:border-gray-100
                hover:bg-gray-100 dark:hover:bg-gray-800
                rounded-full shadow-lg hover:shadow-xl
                transition-all transform hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                flex items-center justify-center
                group
            "
            aria-label="Generate with AI"
            title="Generate diagram with AI"
        >
            <div className="w-8 h-8 sm:w-10 sm:h-10">
                <Lottie
                    animationData={brainAnimation}
                    loop={true}
                    autoplay={true}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </button>
    );
}
