'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cpu, Layers3, Monitor, Tablet, Smartphone, Download } from 'lucide-react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Usar caminhos relativos NUNCA @/
import { BuilderProvider, useBuilder } from '../../src/context/BuilderContext';
import { CanvasRenderer } from '../../src/components/CanvasRenderer';
import { PropertyInspector } from '../../src/components/PropertyInspector';
import { DraggableWidget } from '../../src/components/DraggableWidget';
import { DroppableCanvas } from '../../src/components/DroppableCanvas';

// Header fornecido no prompt
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/86 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
            <Cpu className="h-5 w-5" />
          </span>
          <span>
            <strong className="block text-base font-semibold text-white">LevellingDev</strong>
            <span className="text-xs text-slate-400">IA, codigo e automacao</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

// Footer fornecido no prompt
export function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>LevellingDev publica guias originais sobre IA, low-code, seguranca e deploy moderno.</p>
      </div>
    </footer>
  );
}

function EditorLayout() {
    const { blocks, addBlock, moveBlock } = useBuilder();
    const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { over, active } = event;

        if (!over) return;

        // Bloco novo da sidebar
        if (active.id.toString().startsWith('widget-')) {
            if (over.id === 'main-canvas') {
                const type = active.data.current?.type;
                if (type) {
                    addBlock(null, type);
                }
            }
            return;
        }

        // Reordenação de blocos já existentes
        if (active.id !== over.id && over.id !== 'main-canvas') {
            moveBlock(active.id.toString(), over.id.toString());
        }
    }

    function handleSave() {
        const jsonStr = JSON.stringify(blocks, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'layout.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return (
        <div className="flex flex-col min-h-screen bg-ink">
            <Header />

            {/* ACTION BAR */}
            <div className="border-b border-line bg-panel px-6 py-3 flex justify-between items-center z-20">
                <h1 className="text-slate-200 text-sm font-semibold tracking-wide flex items-center gap-2 w-1/3">
                    <Layers3 className="h-4 w-4 text-mint" />
                    Visual Builder
                </h1>
                
                {/* DEVICE PREVIEW TOGGLE */}
                <div className="flex items-center gap-1 bg-ink border border-line rounded-lg p-1 w-1/3 justify-center">
                    <button 
                        onClick={() => setPreviewMode('desktop')}
                        className={`p-1.5 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-panel text-cyan shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Monitor className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => setPreviewMode('tablet')}
                        className={`p-1.5 rounded-md transition-colors ${previewMode === 'tablet' ? 'bg-panel text-cyan shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Tablet className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => setPreviewMode('mobile')}
                        className={`p-1.5 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-panel text-cyan shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Smartphone className="h-4 w-4" />
                    </button>
                </div>

                <div className="w-1/3 flex justify-end">
                    <button className="editor-button" onClick={handleSave}>
                        <Download className="h-4 w-4 text-cyan" />
                        Exportar JSON
                    </button>
                </div>
            </div>

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="flex flex-1 overflow-hidden font-sans">
                    {/* SIDEBAR ESQUERDA - LISTA DE ELEMENTOS */}
                    <div className="w-64 bg-panel border-r border-line p-5 space-y-4 flex flex-col z-10 overflow-y-auto">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                            Elementos Arrastáveis
                        </h3>
                        <DraggableWidget type="container" label="📦 Seção / Container" />
                        <DraggableWidget type="text" label="📝 Bloco de Texto" />
                        <DraggableWidget type="image" label="🖼️ Mídia de Imagem" />
                        <DraggableWidget type="video" label="🎥 Incorporar Vídeo" />
                    </div>

                    {/* CANVAS CENTRAL - ÁREA DE DESIGN */}
                    <div className="flex-1 p-8 overflow-y-auto relative">
                        <DroppableCanvas previewMode={previewMode}>
                            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                {blocks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-line rounded-xl bg-ink/50 backdrop-blur-sm">
                                        <p className="font-medium text-sm text-slate-300">O seu Canvas está em branco.</p>
                                        <p className="text-xs text-slate-500 mt-2">Arraste os blocos da esquerda e solte-os aqui.</p>
                                    </div>
                                ) : (
                                    blocks.map((block) => <CanvasRenderer key={block.id} block={block} />)
                                )}
                            </SortableContext>
                        </DroppableCanvas>
                    </div>

                    {/* SIDEBAR DIREITA - INSPETOR DE PROPRIEDADES */}
                    <div className="w-80 h-full border-l border-line bg-panel z-10">
                        <PropertyInspector />
                    </div>
                </div>
            </DndContext>

            <Footer />
        </div>
    );
}

export default function EditorPage() {
    return (
        <BuilderProvider>
            <EditorLayout />
        </BuilderProvider>
    );
}