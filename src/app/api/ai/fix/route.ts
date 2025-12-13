/**
 * AI Fix API Route
 * 
 * POST /api/ai/fix
 * Fixes syntax errors in diagram code.
 * Protected by proxy - only accessible to owner.
 */

import { NextResponse } from 'next/server';

interface FixRequest {
    code: string;
    diagramType: string;
    errorMessage?: string;
    sessionId?: string;
}

interface AnythingLLMResponse {
    textResponse?: string;
    error?: string | null;
}

/**
 * Build system prompt for syntax fixing
 */
function buildFixPrompt(diagramType: string, errorMessage?: string): string {
    let prompt = `You are a ${diagramType} diagram syntax fixer.
Your task is to find and fix any syntax errors in the provided code.
Return ONLY the corrected code, no explanations or markdown code blocks.
Keep the logic and structure identical, only fix syntax issues.`;

    if (errorMessage) {
        prompt += `\n\nThe user received this error: ${errorMessage}`;
    }

    return prompt;
}

/**
 * Extract code from LLM response
 */
function extractCode(response: string): string {
    let code = response.trim();

    // Remove <think> tags and their content (chain-of-thought reasoning)
    code = code.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Remove markdown code blocks
    const codeBlockRegex = /```(?:\w+)?\n?([\s\S]*?)```/;
    const match = code.match(codeBlockRegex);
    if (match) {
        code = match[1].trim();
    }

    // Remove language identifier if at start
    const langPatterns = [
        /^plantuml\n/i, /^mermaid\n/i, /^dot\n/i, /^graphviz\n/i,
        /^d2\n/i, /^blockdiag\n/i, /^json\n/i, /^yaml\n/i
    ];
    for (const pattern of langPatterns) {
        code = code.replace(pattern, '');
    }

    return code.trim();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, diagramType, errorMessage, sessionId } = body as FixRequest;

        if (!code || !diagramType) {
            return NextResponse.json(
                { error: 'Code and diagramType are required' },
                { status: 400 }
            );
        }

        // Prepare request to AnythingLLM
        const systemPrompt = buildFixPrompt(diagramType, errorMessage);
        const userMessage = `Fix the syntax errors in this ${diagramType} code:
\`\`\`
${code}
\`\`\`

Return the corrected code:`;

        const response = await fetch(
            `${process.env.ANYTHINGLLM_URL}/v1/workspace/${process.env.ANYTHINGLLM_WORKSPACE_SLUG}/chat`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.ANYTHINGLLM_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    mode: 'chat',
                    sessionId: sessionId || `kroki-${diagramType}-default`,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('AnythingLLM error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to fix diagram' },
                { status: 500 }
            );
        }

        const data: AnythingLLMResponse = await response.json();

        if (data.error) {
            return NextResponse.json(
                { error: data.error },
                { status: 500 }
            );
        }

        if (!data.textResponse) {
            return NextResponse.json(
                { error: 'No response from AI' },
                { status: 500 }
            );
        }

        const fixedCode = extractCode(data.textResponse);

        return NextResponse.json({
            success: true,
            code: fixedCode,
        });

    } catch (error) {
        console.error('Fix error:', error);
        return NextResponse.json(
            { error: 'Failed to fix diagram' },
            { status: 500 }
        );
    }
}
