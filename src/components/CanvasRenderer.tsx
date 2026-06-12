'use client';
import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Block } from '../types/builder';
import { useBuilder } from '../context/BuilderContext';

// ───────────────────────────────────────────────────────
// Shared toolbar: drag handle + delete button
// ───────────────────────────────────────────────────────
const BlockToolbar: React.FC<{
    blockId: string;
    label: string;
    dragListeners: any;
    dragAttributes: any;
}> = ({ blockId, label, dragListeners, dragAttributes }) => {
    const { deleteBlock } = useBuilder();
    return (
        <div
            className="absolute -top-5 left-0 right-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none"
        >
            <div
                {...dragListeners}
                {...dragAttributes}
                className="flex items-center gap-1 bg-[#0d1b2a] border border-cyan/30 rounded-sm px-2 py-0.5 cursor-grab text-[10px] text-slate-400 hover:text-cyan pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical size={9} />
                <span>{label}</span>
            </div>
            <button
                className="flex items-center bg-red-950 border border-red-800 rounded-sm px-1.5 py-0.5 cursor-pointer text-red-400 hover:text-red-100 pointer-events-auto"
                onClick={(e) => { e.stopPropagation(); deleteBlock(blockId); }}
            >
                <X size={9} />
            </button>
        </div>
    );
};

// ───────────────────────────────────────────────────────
// ColumnZone — droppable zone inside a grid column
// Uses useDroppable (NOT sortable — columns aren't draggable)
// ───────────────────────────────────────────────────────
const ColumnZone: React.FC<{ block: Block }> = ({ block }) => {
    const { isOver, setNodeRef } = useDroppable({ id: block.id });
    const { selectBlock, selectedBlockId } = useBuilder();
    const isSelected = selectedBlockId === block.id;

    const borderColor = isSelected
        ? '2px solid #49d7ff'
        : isOver
        ? '2px dashed #49d7ff'
        : '1px dashed #2d3f52';

    return (
        <div
            ref={setNodeRef}
            style={{
                flex: 1,
                minHeight: '80px',
                padding: block.styles.padding || '8px',
                backgroundColor: isOver ? 'rgba(73,215,255,0.04)' : block.styles.backgroundColor || 'transparent',
                border: borderColor,
                borderRadius: '6px',
                transition: 'border-color 0.15s, background-color 0.15s',
                position: 'relative',
            }}
            onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
        >
            <SortableContext
                items={block.children?.map((c) => c.id) ?? []}
                strategy={verticalListSortingStrategy}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {block.children?.map((child) => (
                        <CanvasRenderer key={child.id} block={child} />
                    ))}
                </div>
            </SortableContext>

            {(!block.children || block.children.length === 0) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '60px',
                        color: isOver ? '#49d7ff' : '#3d4f61',
                        fontSize: '11px',
                        textAlign: 'center',
                        transition: 'color 0.15s',
                    }}
                >
                    {isOver ? '↓ Soltar aqui' : 'Coluna vazia'}
                </div>
            )}
        </div>
    );
};

// ───────────────────────────────────────────────────────
// GridBlock — horizontal columns layout
// ───────────────────────────────────────────────────────
const GridBlock: React.FC<{ block: Block }> = ({ block }) => {
    const { selectBlock, selectedBlockId } = useBuilder();
    const isSelected = selectedBlockId === block.id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.4 : 1,
                border: isSelected ? '2px solid #49d7ff' : '1px dashed #2d3f52',
                borderRadius: '10px',
                padding: block.styles.padding || '8px',
                backgroundColor: block.styles.backgroundColor || 'transparent',
                position: 'relative',
                marginTop: '20px',
                marginBottom: '4px',
            }}
            onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
            className="group"
        >
            <BlockToolbar blockId={block.id} label={`GRID (${block.children?.length ?? 0} colunas)`} dragListeners={listeners} dragAttributes={attributes} />

            <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                {block.children?.map((col) => (
                    <ColumnZone key={col.id} block={col} />
                ))}
            </div>
        </div>
    );
};

// ───────────────────────────────────────────────────────
// ContainerBlock — standalone vertical droppable section
// ───────────────────────────────────────────────────────
const ContainerBlock: React.FC<{ block: Block }> = ({ block }) => {
    const { selectBlock, selectedBlockId } = useBuilder();
    const isSelected = selectedBlockId === block.id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({ id: block.id });

    const borderColor = isSelected
        ? '2px solid #49d7ff'
        : isOver
        ? '2px dashed #49d7ff'
        : '1px dashed #2d3f52';

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition ? `${transition}, border-color 0.15s` : 'border-color 0.15s',
                opacity: isDragging ? 0.4 : 1,
                border: borderColor,
                borderRadius: '10px',
                minHeight: '80px',
                padding: block.styles.padding || '16px',
                backgroundColor: block.styles.backgroundColor || 'transparent',
                position: 'relative',
                marginTop: '20px',
                marginBottom: '4px',
            }}
            onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
            className="group"
        >
            <BlockToolbar blockId={block.id} label="SEÇÃO" dragListeners={listeners} dragAttributes={attributes} />

            <SortableContext
                items={block.children?.map((c) => c.id) ?? []}
                strategy={verticalListSortingStrategy}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {block.children?.map((child) => (
                        <CanvasRenderer key={child.id} block={child} />
                    ))}
                </div>
            </SortableContext>

            {(!block.children || block.children.length === 0) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '50px',
                        color: isOver ? '#49d7ff' : '#3d4f61',
                        fontSize: '11px',
                        border: '1px dashed #263241',
                        borderRadius: '6px',
                        marginTop: '4px',
                    }}
                >
                    {isOver ? '↓ Soltar aqui' : 'Seção vazia — solte elementos aqui'}
                </div>
            )}
        </div>
    );
};

// ───────────────────────────────────────────────────────
// LeafBlock — text, heading, image, video, button, etc.
// ───────────────────────────────────────────────────────
const LeafBlock: React.FC<{ block: Block }> = ({ block }) => {
    const { selectBlock, selectedBlockId } = useBuilder();
    const isSelected = selectedBlockId === block.id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.4 : 1,
                outline: isSelected ? '2px solid #49d7ff' : '1px dashed transparent',
                outlineOffset: '2px',
                borderRadius: '4px',
                position: 'relative',
                marginTop: '18px',
            }}
            onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
            className="group"
        >
            <BlockToolbar
                blockId={block.id}
                label={block.type.toUpperCase()}
                dragListeners={listeners}
                dragAttributes={attributes}
            />
            <LeafContent block={block} />
        </div>
    );
};

// ───────────────────────────────────────────────────────
// LeafContent — visual rendering per type
// ───────────────────────────────────────────────────────
function LeafContent({ block }: { block: Block }) {
    const p = block.styles.padding || '8px';
    switch (block.type) {
        case 'text':
            return (
                <div
                    style={{
                        fontSize: block.styles.fontSize || '15px',
                        fontFamily: block.styles.fontFamily || 'Inter, sans-serif',
                        color: block.styles.color || '#cbd5e1',
                        padding: p,
                        lineHeight: '1.65',
                    }}
                >
                    {block.props.content}
                </div>
            );

        case 'heading':
            return (
                <div style={{ padding: p }}>
                    <h2
                        style={{
                            fontSize: block.styles.fontSize || '28px',
                            fontFamily: block.styles.fontFamily || 'Inter, sans-serif',
                            color: block.styles.color || '#f1f5f9',
                            fontWeight: '700',
                            lineHeight: '1.25',
                            margin: 0,
                        }}
                    >
                        {block.props.content || 'Título'}
                    </h2>
                </div>
            );

        case 'button':
            return (
                <div style={{ padding: p }}>
                    <button
                        style={{
                            backgroundColor: block.styles.backgroundColor || '#49d7ff',
                            color: block.styles.color || '#0b1120',
                            padding: '10px 22px',
                            borderRadius: block.styles.borderRadius || '8px',
                            fontSize: block.styles.fontSize || '14px',
                            fontFamily: block.styles.fontFamily,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'inline-block',
                        }}
                    >
                        {block.props.content || 'Botão'}
                    </button>
                </div>
            );

        case 'image':
            return (
                <div style={{ padding: p }}>
                    <img
                        src={
                            block.props.src ||
                            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={block.props.alt || ''}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            borderRadius: '8px',
                            maxHeight: '240px',
                            objectFit: 'cover',
                        }}
                    />
                </div>
            );

        case 'video':
            return (
                <div style={{ padding: p }}>
                    {block.props.url ? (
                        <iframe
                            src={block.props.url as string}
                            style={{
                                width: '100%',
                                aspectRatio: '16/9',
                                border: 'none',
                                borderRadius: '8px',
                                display: 'block',
                            }}
                            allowFullScreen
                        />
                    ) : (
                        <div
                            style={{
                                background: '#0d1b2a',
                                borderRadius: '8px',
                                aspectRatio: '16/9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#3d4f61',
                                fontSize: '12px',
                                border: '1px dashed #263241',
                            }}
                        >
                            Configure a URL do vídeo no painel lateral →
                        </div>
                    )}
                </div>
            );

        case 'divider':
            return (
                <div style={{ padding: block.styles.padding || '4px 0' }}>
                    <hr
                        style={{
                            border: 'none',
                            backgroundColor: block.styles.backgroundColor || '#263241',
                            height: (block.props.thickness as string) || '2px',
                            width: '100%',
                            margin: 0,
                        }}
                    />
                </div>
            );

        case 'spacer':
            return <div style={{ height: (block.props.height as string) || '40px' }} />;

        default:
            return null;
    }
}

// ───────────────────────────────────────────────────────
// Main dispatcher
// ───────────────────────────────────────────────────────
export const CanvasRenderer: React.FC<{ block: Block }> = ({ block }) => {
    if (block.type === 'grid') return <GridBlock block={block} />;
    if (block.type === 'container') return <ContainerBlock block={block} />;
    return <LeafBlock block={block} />;
};