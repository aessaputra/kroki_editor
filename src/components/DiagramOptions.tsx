'use client';

/**
 * DiagramOptions Component
 * 
 * Collapsible panel that displays diagram-specific options.
 * Renders different controls based on the current diagram type.
 */

import { useState } from 'react';
import { DiagramType } from '@/types';
import { supportsOptions } from '@/types/options';

interface DiagramOptionsProps {
    diagramType: DiagramType;
    options: Record<string, string | number | boolean>;
    onChange: (options: Record<string, string | number | boolean>) => void;
}

export function DiagramOptions({ diagramType, options, onChange }: DiagramOptionsProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Don't show if diagram type doesn't support options
    if (!supportsOptions(diagramType)) {
        return null;
    }

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Diagram Options
                </span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Options Panel */}
            {isOpen && (
                <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    {renderOptionsForm(diagramType, options, onChange)}
                </div>
            )}
        </div>
    );
}

/**
 * Render appropriate options form based on diagram type
 */
function renderOptionsForm(
    diagramType: DiagramType,
    options: Record<string, string | number | boolean>,
    onChange: (opts: Record<string, string | number | boolean>) => void
) {
    switch (diagramType) {
        case 'd2':
            return <D2OptionsForm options={options} onChange={onChange} />;
        case 'graphviz':
            return <GraphVizOptionsForm options={options} onChange={onChange} />;
        case 'plantuml':
            return <PlantUMLOptionsForm options={options} onChange={onChange} />;
        case 'mermaid':
            return <MermaidOptionsForm options={options} onChange={onChange} />;
        case 'blockdiag':
        case 'seqdiag':
        case 'actdiag':
        case 'nwdiag':
        case 'packetdiag':
        case 'rackdiag':
            return <BlockDiagOptionsForm options={options} onChange={onChange} />;
        default:
            return <p className="text-sm text-gray-500">No options available for this diagram type</p>;
    }
}

/**
 * D2 Options Form
 */
function D2OptionsForm({ options, onChange }: OptionsFormProps) {
    return (
        <div className="space-y-3">
            <OptionSelect
                label="Theme"
                value={options.theme as string || ''}
                onChange={(value) => onChange({ ...options, theme: value })}
                options={[
                    { value: '', label: 'Default' },
                    { value: 'dark-mauve', label: 'Dark Mauve' },
                    { value: 'cool-classics', label: 'Cool Classics' },
                    { value: 'terminal', label: 'Terminal' },
                    { value: 'neutral-gray', label: 'Neutral Gray' },
                ]}
            />

            <OptionSelect
                label="Layout"
                value={options.layout as string || 'dagre'}
                onChange={(value) => onChange({ ...options, layout: value })}
                options={[
                    { value: 'dagre', label: 'Dagre (Default)' },
                    { value: 'elk', label: 'ELK' },
                ]}
            />

            <OptionCheckbox
                label="Sketch Mode"
                checked={options.sketch as boolean || false}
                onChange={(checked) => onChange({ ...options, sketch: checked })}
            />
        </div>
    );
}

/**
 * GraphViz Options Form
 */
function GraphVizOptionsForm({ options, onChange }: OptionsFormProps) {
    return (
        <div className="space-y-3">
            <OptionSelect
                label="Layout Engine"
                value={options.layout as string || 'dot'}
                onChange={(value) => onChange({ ...options, layout: value })}
                options={[
                    { value: 'dot', label: 'Dot (Hierarchical)' },
                    { value: 'neato', label: 'Neato (Spring)' },
                    { value: 'fdp', label: 'FDP (Force-Directed)' },
                    { value: 'circo', label: 'Circo (Circular)' },
                    { value: 'twopi', label: 'Twopi (Radial)' },
                ]}
            />

            <OptionNumber
                label="Scale"
                value={options.scale as number || 1}
                onChange={(value) => onChange({ ...options, scale: value })}
                min={0.5}
                max={3}
                step={0.1}
            />
        </div>
    );
}

/**
 * PlantUML Options Form
 */
function PlantUMLOptionsForm({ options, onChange }: OptionsFormProps) {
    return (
        <div className="space-y-3">
            <OptionSelect
                label="Theme"
                value={options.theme as string || ''}
                onChange={(value) => onChange({ ...options, theme: value })}
                options={[
                    { value: '', label: 'Default' },
                    { value: 'sketchy', label: 'Sketchy' },
                    { value: 'bluegray', label: 'Blue Gray' },
                    { value: 'superhero', label: 'Superhero' },
                    { value: 'plain', label: 'Plain' },
                    { value: 'cerulean', label: 'Cerulean' },
                ]}
            />
        </div>
    );
}

/**
 * Mermaid Options Form
 */
function MermaidOptionsForm({ options, onChange }: OptionsFormProps) {
    return (
        <div className="space-y-3">
            <OptionSelect
                label="Theme"
                value={options.theme as string || ''}
                onChange={(value) => onChange({ ...options, theme: value })}
                options={[
                    { value: '', label: 'Default' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'forest', label: 'Forest' },
                    { value: 'neutral', label: 'Neutral' },
                ]}
            />
        </div>
    );
}

/**
 * BlockDiag Family Options Form
 */
function BlockDiagOptionsForm({ options, onChange }: OptionsFormProps) {
    return (
        <div className="space-y-3">
            <OptionCheckbox
                label="Anti-alias"
                checked={options.antialias as boolean || false}
                onChange={(checked) => onChange({ ...options, antialias: checked })}
            />

            <OptionNumber
                label="Scale"
                value={options.scale as number || 1}
                onChange={(value) => onChange({ ...options, scale: value })}
                min={0.5}
                max={3}
                step={0.1}
            />
        </div>
    );
}

/**
 * Reusable Components
 */
interface OptionsFormProps {
    options: Record<string, string | number | boolean>;
    onChange: (opts: Record<string, string | number | boolean>) => void;
}

interface OptionSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}

function OptionSelect({ label, value, onChange, options }: OptionSelectProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

interface OptionCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function OptionCheckbox({ label, checked, onChange }: OptionCheckboxProps) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </label>
    );
}

interface OptionNumberProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
}

function OptionNumber({ label, value, onChange, min, max, step }: OptionNumberProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}: {value}
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
        </div>
    );
}
