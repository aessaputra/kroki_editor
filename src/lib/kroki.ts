/**
 * Kroki Compression Utility
 * 
 * Implements diagram encoding for Kroki service:
 * 1. Compress input using Deflate (pako)
 * 2. Encode using Base64URL (URL-safe Base64)
 * 
 * @see https://docs.kroki.io/kroki/setup/encode-diagram/
 */

import pako from 'pako';
import type { DiagramType, OutputFormat } from '@/types';

/**
 * Default Kroki server URL
 * Can be overridden via NEXT_PUBLIC_KROKI_URL environment variable
 */
const KROKI_BASE_URL = process.env.NEXT_PUBLIC_KROKI_URL || 'https://kroki.io';

/**
 * Encodes a diagram source using Deflate compression and Base64URL encoding
 * 
 * @param source - The diagram source code
 * @returns Base64URL encoded compressed string
 */
export function encodeKrokiDiagram(source: string): string {
    // Convert string to Uint8Array
    const data = new TextEncoder().encode(source);

    // Compress using Deflate (raw, no zlib header)
    const compressed = pako.deflate(data, { level: 9 });

    // Convert to Base64
    const base64 = uint8ArrayToBase64(compressed);

    // Convert to Base64URL (URL-safe variant)
    const base64url = base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); // Remove padding

    return base64url;
}

/**
 * Converts a Uint8Array to Base64 string
 * 
 * @param bytes - The byte array to convert
 * @returns Base64 encoded string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Builds a complete Kroki URL for rendering a diagram
 * 
 * @param diagramType - The type of diagram (e.g., 'plantuml', 'mermaid')
 * @param source - The diagram source code
 * @param format - Output format (default: 'svg')
 * @param options - Optional diagram-specific options (e.g., theme, layout)
 * @returns Full Kroki URL for the diagram
 */
export function buildKrokiUrl(
    diagramType: DiagramType,
    source: string,
    format: OutputFormat = 'svg',
    options?: Record<string, string | number | boolean>
): string {
    if (!source.trim()) {
        return '';
    }

    const encoded = encodeKrokiDiagram(source);
    const baseUrl = `${KROKI_BASE_URL}/${diagramType}/${format}/${encoded}`;

    // Add query parameters if options provided
    if (!options || Object.keys(options).length === 0) {
        return baseUrl;
    }

    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
        // Skip undefined/null/empty values
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

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}


/**
 * Validates if the Kroki server is reachable
 * 
 * @returns Promise resolving to true if server is available
 */
export async function checkKrokiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${KROKI_BASE_URL}/health`, {
            method: 'GET',
            cache: 'no-store',
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Gets the configured Kroki base URL
 * 
 * @returns The Kroki server URL
 */
export function getKrokiBaseUrl(): string {
    return KROKI_BASE_URL;
}
