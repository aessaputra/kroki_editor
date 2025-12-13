/**
 * AI Revise API Route
 * 
 * POST /api/ai/revise
 * Revises existing diagram code based on user instructions.
 * Protected by proxy - only accessible to owner.
 */

import { NextResponse } from 'next/server';

interface ReviseRequest {
    code: string;
    instruction: string;
    diagramType: string;
    sessionId?: string;
}

interface AnythingLLMResponse {
    textResponse?: string;
    error?: string | null;
}

/**
 * Build system prompt for diagram revision
 */
function buildRevisePrompt(diagramType: string): string {
    return `You are a ${diagramType} diagram code editor.
Your task is to modify the existing diagram code based on the user's instruction.
Keep the overall structure intact unless explicitly asked to change it.
Return ONLY the modified code, no explanations or markdown code blocks.
Preserve proper syntax for ${diagramType} diagrams.`;
}

/**
 * Extract code from LLM response (remove markdown if present)
 */
function extractCode(response: string, diagramType: string): string {
    let code = response.trim();

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
        const { code, instruction, diagramType, sessionId } = body as ReviseRequest;

        if (!code || !instruction || !diagramType) {
            return NextResponse.json(
                { error: 'Code, instruction, and diagramType are required' },
                { status: 400 }
            );
        }

        // Prepare request to AnythingLLM
        const systemPrompt = buildRevisePrompt(diagramType);
        const userMessage = `Current code:
\`\`\`
${code}
\`\`\`

Instruction: ${instruction}

Return the modified code:`;

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
                { error: 'Failed to revise diagram' },
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

        const revisedCode = extractCode(data.textResponse, diagramType);

        return NextResponse.json({
            success: true,
            code: revisedCode,
        });

    } catch (error) {
        console.error('Revise error:', error);
        return NextResponse.json(
            { error: 'Failed to revise diagram' },
            { status: 500 }
        );
    }
}
