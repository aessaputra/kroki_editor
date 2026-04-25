import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const diagramTypeValidator = v.union(
    v.literal('actdiag'),
    v.literal('blockdiag'),
    v.literal('bpmn'),
    v.literal('bytefield'),
    v.literal('c4plantuml'),
    v.literal('d2'),
    v.literal('dbml'),
    v.literal('ditaa'),
    v.literal('erd'),
    v.literal('excalidraw'),
    v.literal('graphviz'),
    v.literal('mermaid'),
    v.literal('nomnoml'),
    v.literal('nwdiag'),
    v.literal('packetdiag'),
    v.literal('pikchr'),
    v.literal('plantuml'),
    v.literal('rackdiag'),
    v.literal('seqdiag'),
    v.literal('structurizr'),
    v.literal('svgbob'),
    v.literal('symbolator'),
    v.literal('tikz'),
    v.literal('umlet'),
    v.literal('vega'),
    v.literal('vegalite'),
    v.literal('wavedrom'),
    v.literal('wireviz'),
);

const outputFormatValidator = v.union(
    v.literal('svg'),
    v.literal('png'),
    v.literal('jpeg'),
    v.literal('pdf'),
    v.literal('txt'),
    v.literal('base64'),
);

const optionsValidator = v.record(v.string(), v.union(v.string(), v.number(), v.boolean()));

export const listMyDiagrams = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Not authenticated');
        }

        return await ctx.db
            .query('diagrams')
            .withIndex('by_owner_updatedAt', (q) =>
                q.eq('ownerTokenIdentifier', identity.tokenIdentifier),
            )
            .order('desc')
            .collect();
    },
});

export const getMyDiagram = query({
    args: {
        id: v.id('diagrams'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const diagram = await ctx.db.get(args.id);
        if (!diagram) {
            throw new Error('Diagram not found');
        }
        if (diagram.ownerTokenIdentifier !== identity.tokenIdentifier) {
            throw new Error('Unauthorized');
        }

        return diagram;
    },
});

export const createDiagram = mutation({
    args: {
        title: v.string(),
        source: v.string(),
        diagramType: diagramTypeValidator,
        outputFormat: outputFormatValidator,
        options: v.optional(optionsValidator),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const now = Date.now();
        return await ctx.db.insert('diagrams', {
            title: args.title,
            source: args.source,
            diagramType: args.diagramType,
            outputFormat: args.outputFormat,
            options: args.options ?? {},
            ownerTokenIdentifier: identity.tokenIdentifier,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const updateDiagram = mutation({
    args: {
        id: v.id('diagrams'),
        source: v.optional(v.string()),
        diagramType: v.optional(diagramTypeValidator),
        outputFormat: v.optional(outputFormatValidator),
        options: v.optional(optionsValidator),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const diagram = await ctx.db.get(args.id);
        if (!diagram) {
            throw new Error('Diagram not found');
        }
        if (diagram.ownerTokenIdentifier !== identity.tokenIdentifier) {
            throw new Error('Unauthorized');
        }

        const updates: {
            source?: string;
            diagramType?: typeof args.diagramType;
            outputFormat?: typeof args.outputFormat;
            options?: typeof args.options;
        } = {};
        if (args.source !== undefined) {
            updates.source = args.source;
        }
        if (args.diagramType !== undefined) {
            updates.diagramType = args.diagramType;
        }
        if (args.outputFormat !== undefined) {
            updates.outputFormat = args.outputFormat;
        }
        if (args.options !== undefined) {
            updates.options = args.options;
        }

        await ctx.db.patch(args.id, {
            ...updates,
            updatedAt: Date.now(),
        });

        return await ctx.db.get(args.id);
    },
});

export const renameDiagram = mutation({
    args: {
        id: v.id('diagrams'),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const diagram = await ctx.db.get(args.id);
        if (!diagram) {
            throw new Error('Diagram not found');
        }
        if (diagram.ownerTokenIdentifier !== identity.tokenIdentifier) {
            throw new Error('Unauthorized');
        }

        await ctx.db.patch(args.id, {
            title: args.title,
            updatedAt: Date.now(),
        });

        return await ctx.db.get(args.id);
    },
});

export const deleteDiagram = mutation({
    args: {
        id: v.id('diagrams'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Not authenticated');
        }

        const diagram = await ctx.db.get(args.id);
        if (!diagram) {
            throw new Error('Diagram not found');
        }
        if (diagram.ownerTokenIdentifier !== identity.tokenIdentifier) {
            throw new Error('Unauthorized');
        }

        await ctx.db.delete(args.id);
        return null;
    },
});
