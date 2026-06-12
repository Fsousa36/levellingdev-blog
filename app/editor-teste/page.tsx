'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Cpu, Layers3, Monitor, Tablet, Smartphone, Download,
    Type, Maximize, LayoutGrid, Box, ImageIcon, Video,
    MousePointerClick, SeparatorHorizontal, Heading1, AlignLeft
} from 'lucide-react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
    closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { BuilderProvider, useBuilder } from '../../src/context/BuilderContext';
import { CanvasRenderer } from '../../src/components/CanvasRenderer';
import { PropertyInspector } from '../../src/components/PropertyInspector';
import { DraggableWidget } from '../../src/components/DraggableWidget';
import { DroppableCanvas } from '../../src/components/DroppableCanvas';
import { Block } from '../../src/types/builder';

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

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>LevellingDev publica guias originais sobre IA, low-code, seguranca e deploy moderno.</p>
      </div>
    </footer>
  );
}

// Mapeamento de ícones + labels para o drag overlay
const widgetMeta: Record<string, { label: string }> = {
    container: { label: 'Seção' },
    grid: { label: 'Colunas (Grid)' },
    heading: { label: 'Título' },
    text: { label: 'Texto' },
    image: { label: 'Imagem' },
    video: { label: 'Vídeo' },
    button: { label: 'Botão' },
    divider: { label: 'Divisor' },
    spacer: { label: 'Espaçador' },
};

function EditorLayout() {
    const { blocks, addBlock, moveBlock } = useBuilder();
    const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [draggingType, setDraggingType] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        if (active.id.toString().startsWith('widget-')) {
            setDraggingType(active.data.current?.type ?? null);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        setDraggingType(null);
        const { over, active } = event;

        // Nada foi solto sobre uma área válida
        if (!over) return;

        const activeIdStr = active.id.toString();
        const overIdStr = over.id.toString();

        // ---- NOVO BLOCO ARRASTADO DA SIDEBAR ----
        if (activeIdStr.startsWith('widget-')) {
            const type = active.data.current?.type as Block['type'];
            if (!type) return;

            const parentId = overIdStr === 'main-canvas' ? null : overIdStr;
            addBlock(parentId, type);
            return;
        }

        // ---- REORDENAÇÃO DE BLOCOS JÁ EXISTENTES ----
        if (activeIdStr !== overIdStr) {
            moveBlock(activeIdStr, overIdStr);
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
                    <Layers3 className="h-4 w-4 text-cyan" />
                    Visual Builder
                </h1>

                {/* DEVICE PREVIEW TOGGLE */}
                <div className="flex items-center gap-1 bg-ink border border-line rounded-lg p-1 w-1/3 justify-center">
                    <button
                        onClick={() => setPreviewMode('desktop')}
                        title="Desktop"
                        className={`p-1.5 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-panel text-cyan shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Monitor className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setPreviewMode('tablet')}
                        title="Tablet"
                        className={`p-1.5 rounded-md transition-colors ${previewMode === 'tablet' ? 'bg-panel text-cyan shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Tablet className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setPreviewMode('mobile')}
                        title="Mobile"
                        className={`p-1.5 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-panel text-cyan shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Smartphone className="h-4 w-4" />
                    </button>
                </div>

                <div className="w-1/3 flex justify-end">
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink border border-line text-sm text-slate-300 hover:text-cyan hover:border-cyan transition-colors"
                        onClick={handleSave}
                    >
                        <Download className="h-4 w-4" />
                        Exportar JSON
                    </button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-1 overflow-hidden font-sans">

                    {/* SIDEBAR ESQUERDA */}
                    <div className="w-[280px] bg-panel border-r border-line flex flex-col z-10 overflow-y-auto shrink-0">
                        <div className="p-4 bg-ink/50 border-b border-line flex items-center gap-2 text-sm font-semibold text-slate-300 sticky top-0">
                            <LayoutGrid className="w-4 h-4 text-cyan" />
                            Elementos
                        </div>

                        <div className="p-3 grid grid-cols-2 gap-2">
                            <DraggableWidget type="container" label="Seção"       icon={<Box />} />
                            <DraggableWidget type="grid"      label="Grid"        icon={<LayoutGrid />} />
                            <DraggableWidget type="heading"   label="Título"      icon={<Heading1 />} />
                            <DraggableWidget type="text"      label="Texto"       icon={<AlignLeft />} />
                            <DraggableWidget type="image"     label="Imagem"      icon={<ImageIcon />} />
                            <DraggableWidget type="video"     label="Vídeo"       icon={<Video />} />
                            <DraggableWidget type="button"    label="Botão"       icon={<MousePointerClick />} />
                            <DraggableWidget type="divider"   label="Divisor"     icon={<SeparatorHorizontal />} />
                            <DraggableWidget type="spacer"    label="Espaçador"   icon={<Maximize />} />
                        </div>
                    </div>

                    {/* CANVAS CENTRAL */}
                    <div className="flex-1 p-8 overflow-y-auto relative bg-ink/40">
                        <DroppableCanvas previewMode={previewMode}>
                            <SortableContext
                                items={blocks.map(b => b.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {blocks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-line rounded-xl bg-ink/50 backdrop-blur-sm">
                                        <p className="font-medium text-sm text-slate-300">O seu Canvas está em branco.</p>
                                        <p className="text-xs text-slate-500 mt-2">Arraste os blocos da esquerda e solte-os aqui.</p>
                                    </div>
                                ) : (
                                    blocks.map((block) => (
                                        <CanvasRenderer key={block.id} block={block} />
                                    ))
                                )}
                            </SortableContext>
                        </DroppableCanvas>
                    </div>

                    {/* SIDEBAR DIREITA */}
                    <div className="w-[300px] h-full border-l border-line bg-panel z-10 shrink-0">
                        <PropertyInspector />
                    </div>
                </div>

                {/* DRAG OVERLAY - fantasma visual enquanto arrasta */}
                <DragOverlay>
                    {draggingType ? (
                        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-panel border border-cyan text-cyan rounded-lg shadow-glow text-[11px] font-semibold opacity-90 w-28">
                            {widgetMeta[draggingType]?.label ?? draggingType}
                        </div>
                    ) : null}
                </DragOverlay>
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