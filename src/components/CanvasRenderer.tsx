'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Block } from '../types/builder';
import { useBuilder } from '../context/BuilderContext';

export const CanvasRenderer: React.FC<{ block: Block }> = ({ block }) => {
    const { selectBlock, selectedBlockId } = useBuilder();
    const isSelected = selectedBlockId === block.id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const baseStyle: React.CSSProperties = {
        ...block.styles,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        outline: isSelected ? '2px solid #49d7ff' : '1px dashed #263241',
        cursor: 'grab',
        position: 'relative',
        zIndex: isDragging ? 50 : 1,
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Impede seleção acidental do container de trás
        selectBlock(block.id);
    };

    switch (block.type) {
        case 'container':
            return (
                <div 
                    ref={setNodeRef} 
                    style={baseStyle} 
                    onClick={handleClick} 
                    className="min-h-[80px] rounded-lg space-y-3 p-2"
                    {...attributes}
                    {...listeners}
                >
                    <SortableContext items={block.children ? block.children.map(c => c.id) : []} strategy={verticalListSortingStrategy}>
                        {block.children?.map((child) => (
                            <CanvasRenderer key={child.id} block={child} />
                        ))}
                    </SortableContext>
                    
                    {block.children?.length === 0 && (
                        <div className="text-slate-500 text-xs p-4 border border-dashed border-line rounded text-center">
                            Caixa Vazia. Solte blocos aqui.
                        </div>
                    )}
                </div>
            );

        case 'text':
            return (
                <div ref={setNodeRef} style={baseStyle} onClick={handleClick} {...attributes} {...listeners} className="rounded p-1">
                    {block.props.content}
                </div>
            );

        case 'image':
            return (
                <div ref={setNodeRef} style={baseStyle} onClick={handleClick} {...attributes} {...listeners} className="overflow-hidden rounded">
                    <img
                        src={block.props.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'}
                        alt={block.props.alt || 'Preview'}
                        className="w-full h-auto object-cover max-h-[300px]"
                    />
                </div>
            );

        case 'video':
            return (
                <div ref={setNodeRef} style={baseStyle} onClick={handleClick} {...attributes} {...listeners} className="overflow-hidden rounded aspect-video bg-black">
                    {block.props.url ? (
                        <iframe
                            src={block.props.url}
                            className="w-full h-full pointer-events-none"
                            frameBorder="0"
                            allowFullScreen
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                            Configurar URL do Vídeo no painel da direita
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
};