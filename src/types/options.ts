/**
 * Diagram Options Type Definitions
 * 
 * Type-safe option definitions for each Kroki diagram type.
 * Focuses on popular options rather than comprehensive coverage.
 */

import { DiagramType } from './index';

/**
 * Common options available for multiple diagram types
 */
export interface CommonOptions {
    /** Scale factor for diagram size */
    scale?: number;
}

/**
 * D2 diagram options
 * See: https://d2lang.com/
 */
export interface D2Options extends CommonOptions {
    /** Visual theme */
    theme?: '' | 'dark-mauve' | 'cool-classics' | 'terminal' | 'neutral-gray' | 'flagship-terrastruct';
    /** Layout engine */
    layout?: 'dagre' | 'elk';
    /** Hand-drawn aesthetic */
    sketch?: boolean;
}

/**
 * GraphViz diagram options
 * See: https://graphviz.org/
 */
export interface GraphVizOptions extends CommonOptions {
    /** Layout algorithm */
    layout?: 'dot' | 'neato' | 'fdp' | 'circo' | 'twopi' | 'sfdp';
}

/**
 * PlantUML diagram options
 * See: https://plantuml.com/
 */
export interface PlantUMLOptions {
    /** Visual theme */
    theme?: '' | 'sketchy' | 'bluegray' | 'superhero' | 'plain' | 'amiga' | 'cerulean';
}

/**
 * Mermaid diagram options (using kebab-case as per Kroki requirements)
 * See: https://mermaid.js.org/
 */
export interface MermaidOptions {
    /** Visual theme */
    theme?: '' | 'default' | 'dark' | 'forest' | 'neutral';
}

/**
 * BlockDiag family options (blockdiag, seqdiag, actdiag, nwdiag, packetdiag, rackdiag)
 */
export interface BlockDiagOptions {
    /** Apply anti-alias filter */
    antialias?: boolean;
    /** Disable transparent background (PNG only) */
    'no-transparency'?: boolean;
    /** Scale factor */
    scale?: number;
}

/**
 * Union type mapping diagram types to their specific options
 */
export type DiagramOptionsMap = {
    d2: D2Options;
    graphviz: GraphVizOptions;
    plantuml: PlantUMLOptions;
    mermaid: MermaidOptions;
    blockdiag: BlockDiagOptions;
    seqdiag: BlockDiagOptions;
    actdiag: BlockDiagOptions;
    nwdiag: BlockDiagOptions;
    packetdiag: BlockDiagOptions;
    rackdiag: BlockDiagOptions;
};

/**
 * Generic options record for any diagram type
 */
export type DiagramOptions = Record<string, string | number | boolean | undefined>;

/**
 * Convert options object to URL query string
 * Handles boolean flags and proper encoding
 */
export function buildOptionsQuery(options: DiagramOptions = {}): string {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
        // Skip undefined/null values
        if (value === undefined || value === null || value === '') {
            return;
        }

        // Boolean flags: true = empty string, false = omit
        if (typeof value === 'boolean') {
            if (value === true) {
                params.append(key, '');
            }
        } else {
            // Numbers and strings: convert to string
            params.append(key, String(value));
        }
    });

    return params.toString();
}

/**
 * Get default options for a diagram type
 */
export function getDefaultOptions(diagramType: DiagramType): DiagramOptions {
    // Return empty object - users can customize as needed
    return {};
}

/**
 * Check if a diagram type supports options
 */
export function supportsOptions(diagramType: DiagramType): boolean {
    const supportedTypes: DiagramType[] = [
        'd2',
        'graphviz',
        'plantuml',
        'mermaid',
        'blockdiag',
        'seqdiag',
        'actdiag',
        'nwdiag',
        'packetdiag',
        'rackdiag',
    ];

    return supportedTypes.includes(diagramType);
}
