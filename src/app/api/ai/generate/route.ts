/**
 * AI Generate API Route
 * 
 * POST /api/ai/generate
 * Proxies requests to AnythingLLM with proper authentication.
 * Protected by middleware - only accessible to owner.
 */

import { NextResponse } from 'next/server';

interface GenerateRequest {
    prompt: string;
    diagramType: string;
}

interface AnythingLLMResponse {
    id?: string;
    type?: string;
    textResponse?: string;
    sources?: unknown[];
    close?: boolean;
    error?: string | null;
}

/**
 * Build system prompt for diagram generation
 * Supports all 29 diagram types in Kroki
 */
function buildSystemPrompt(diagramType: string): string {
    const prompts: Record<string, string> = {
        // PlantUML family
        plantuml: `You are a PlantUML diagram code generator.
Generate valid PlantUML code based on the user's description.
Always start with @startuml and end with @enduml.
Return ONLY the PlantUML code, no explanations or markdown.`,

        c4plantuml: `You are a C4 PlantUML diagram code generator.
Generate valid C4 PlantUML code for software architecture diagrams.
Use C4 macros like Person(), System(), Container(), Component().
Start with !include <C4/C4_Context> or similar.
Return ONLY the code, no explanations.`,

        // Mermaid
        mermaid: `You are a Mermaid diagram code generator.
Generate valid Mermaid code based on the user's description.
Do NOT use markdown code blocks. Return ONLY the raw Mermaid code.
Start directly with the diagram type (graph, flowchart, sequenceDiagram, classDiagram, etc).`,

        // Graphviz
        graphviz: `You are a Graphviz DOT diagram code generator.
Generate valid DOT code based on the user's description.
Start with 'digraph' or 'graph' and use proper DOT syntax.
Return ONLY the DOT code, no explanations.`,

        // D2
        d2: `You are a D2 diagram code generator.
Generate valid D2 code for declarative diagrams.
Use D2 syntax with shapes, connections, and labels.
Return ONLY the D2 code, no explanations.`,

        // BlockDiag family
        blockdiag: `You are a BlockDiag diagram code generator.
Generate valid blockdiag code for block diagrams.
Start with 'blockdiag {' and use proper syntax.
Return ONLY the code, no explanations.`,

        seqdiag: `You are a SeqDiag sequence diagram code generator.
Generate valid seqdiag code for sequence diagrams.
Start with 'seqdiag {' and use proper syntax.
Return ONLY the code, no explanations.`,

        actdiag: `You are an ActDiag activity diagram code generator.
Generate valid actdiag code with lanes and activities.
Start with 'actdiag {' and use proper syntax.
Return ONLY the code, no explanations.`,

        nwdiag: `You are a NwDiag network diagram code generator.
Generate valid nwdiag code for network topology diagrams.
Start with 'nwdiag {' and define networks and nodes.
Return ONLY the code, no explanations.`,

        packetdiag: `You are a PacketDiag packet diagram code generator.
Generate valid packetdiag code for packet/protocol diagrams.
Start with 'packetdiag {' and define fields with bit ranges.
Return ONLY the code, no explanations.`,

        rackdiag: `You are a RackDiag rack diagram code generator.
Generate valid rackdiag code for server rack diagrams.
Start with 'rackdiag {' and define rack units.
Return ONLY the code, no explanations.`,

        // BPMN (XML-based)
        bpmn: `You are a BPMN diagram code generator.
Generate valid BPMN 2.0 XML for business process diagrams.
Include proper namespace definitions and diagram elements.
Return ONLY the XML code, no explanations.`,

        // ERD
        erd: `You are an ERD (Entity Relationship Diagram) code generator.
Generate valid ERD syntax with entities and relationships.
Use format: [Entity] with *primary_key and +foreign_key.
Return ONLY the ERD code, no explanations.`,

        // Ditaa (ASCII art)
        ditaa: `You are a Ditaa ASCII art diagram generator.
Generate valid ditaa ASCII art diagrams using box characters.
Use +, -, |, /, \\ for box drawing.
Return ONLY the ASCII art, no explanations.`,

        // Nomnoml
        nomnoml: `You are a Nomnoml diagram code generator.
Generate valid nomnoml code for UML-like diagrams.
Use [ClassName|attributes|methods] syntax.
Return ONLY the code, no explanations.`,

        // Pikchr
        pikchr: `You are a Pikchr diagram code generator.
Generate valid Pikchr code for technical diagrams.
Use commands like arrow, box, circle, line.
Return ONLY the code, no explanations.`,

        // Structurizr
        structurizr: `You are a Structurizr DSL code generator.
Generate valid Structurizr DSL for C4 architecture diagrams.
Use workspace { model { ... } views { ... } } structure.
Return ONLY the DSL code, no explanations.`,

        // SVGBob
        svgbob: `You are an SVGBob ASCII art diagram generator.
Generate valid svgbob ASCII art that converts to SVG.
Use ASCII characters to draw diagrams.
Return ONLY the ASCII art, no explanations.`,

        // Symbolator (VHDL)
        symbolator: `You are a Symbolator VHDL code generator.
Generate valid VHDL entity definitions for hardware diagrams.
Use proper VHDL syntax with entity and port definitions.
Return ONLY the VHDL code, no explanations.`,

        // TikZ (LaTeX)
        tikz: `You are a TikZ diagram code generator.
Generate valid TikZ code for LaTeX diagrams.
Use \\begin{tikzpicture} and \\end{tikzpicture}.
Return ONLY the TikZ code, no explanations.`,

        // UMlet (XML)
        umlet: `You are a UMlet diagram code generator.
Generate valid UMlet XML for UML diagrams.
Use proper UMlet element and coordinate structure.
Return ONLY the XML code, no explanations.`,

        // Vega/Vega-Lite (JSON)
        vega: `You are a Vega visualization code generator.
Generate valid Vega JSON specification for data visualizations.
Include $schema, data, marks, and scales.
Return ONLY the JSON, no explanations.`,

        vegalite: `You are a Vega-Lite visualization code generator.
Generate valid Vega-Lite JSON for simplified data visualizations.
Include $schema, data, mark, and encoding.
Return ONLY the JSON, no explanations.`,

        // WaveDrom (JSON)
        wavedrom: `You are a WaveDrom timing diagram code generator.
Generate valid WaveDrom JSON for digital timing diagrams.
Use {signal: [...]} format with wave patterns.
Return ONLY the JSON, no explanations.`,

        // Bytefield (Clojure)
        bytefield: `You are a Bytefield diagram code generator.
Generate valid Bytefield Clojure code for byte/packet layouts.
Use defattrs, draw-box, draw-gap functions.
Return ONLY the Clojure code, no explanations.`,

        // DBML
        dbml: `You are a DBML (Database Markup Language) code generator.
Generate valid DBML for database schemas.
Use Table, Column, and Ref syntax.
Return ONLY the DBML code, no explanations.`,

        // WireViz (YAML)
        wireviz: `You are a WireViz diagram code generator.
Generate valid WireViz YAML for wiring/cable diagrams.
Define connectors, cables, and connections.
Return ONLY the YAML code, no explanations.`,

        // Excalidraw (JSON)
        excalidraw: `You are an Excalidraw diagram code generator.
Generate valid Excalidraw JSON with elements array.
Include proper element types, positions, and properties.
Return ONLY the JSON, no explanations.`,

        // Default fallback
        default: `You are a diagram code generator for ${diagramType}.
Generate valid ${diagramType} diagram code based on the user's description.
Return ONLY the diagram code, no explanations or markdown code blocks.`,
    };

    return prompts[diagramType] || prompts.default;
}

/**
 * Extract clean code from LLM response
 */
function extractCode(response: string, diagramType: string): string {
    let code = response.trim();

    // Remove markdown code blocks if present
    const codeBlockRegex = /```(?:\w+)?\n?([\s\S]*?)```/;
    const match = code.match(codeBlockRegex);
    if (match) {
        code = match[1].trim();
    }

    // Ensure PlantUML has proper delimiters
    if (diagramType === 'plantuml') {
        if (!code.startsWith('@startuml')) {
            code = '@startuml\n' + code;
        }
        if (!code.endsWith('@enduml')) {
            code = code + '\n@enduml';
        }
    }

    return code;
}

export async function POST(request: Request) {
    try {
        const { prompt, diagramType }: GenerateRequest = await request.json();

        // Validate input
        if (!prompt || !diagramType) {
            return NextResponse.json(
                { error: 'Missing prompt or diagramType' },
                { status: 400 }
            );
        }

        // Build the full prompt
        const systemPrompt = buildSystemPrompt(diagramType);
        const fullMessage = `${systemPrompt}\n\nUser request: ${prompt}`;

        // Call AnythingLLM API
        const anythingLLMUrl = process.env.ANYTHINGLLM_URL;
        const apiKey = process.env.ANYTHINGLLM_API_KEY;
        const workspaceSlug = process.env.ANYTHINGLLM_WORKSPACE_SLUG;

        if (!anythingLLMUrl || !apiKey || !workspaceSlug) {
            console.error('AnythingLLM configuration missing');
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 500 }
            );
        }

        const response = await fetch(
            `${anythingLLMUrl}/v1/workspace/${workspaceSlug}/chat`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: fullMessage,
                    mode: 'chat',
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('AnythingLLM error:', response.status, errorText);
            return NextResponse.json(
                { error: 'AI service error' },
                { status: response.status }
            );
        }

        const data: AnythingLLMResponse = await response.json();

        if (data.error) {
            return NextResponse.json(
                { error: data.error },
                { status: 500 }
            );
        }

        // Extract and clean the code from response
        const code = extractCode(data.textResponse || '', diagramType);

        return NextResponse.json({
            success: true,
            code,
            raw: data.textResponse,
        });

    } catch (error) {
        console.error('Generate error:', error);
        return NextResponse.json(
            { error: 'Failed to generate diagram' },
            { status: 500 }
        );
    }
}
