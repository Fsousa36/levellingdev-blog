'use client';
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { BlockType } from '../types/builder';

interface DraggableWidgetProps {
    type: BlockType;
    label: string;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ type, label }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `widget-${type}`,
        data: { type },
    });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 50 : 1,
        position: isDragging ? 'relative' : 'static',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                p-3.5 bg-ink hover:bg-line/40 text-slate-300 text-sm font-medium 
                rounded-lg border border-line hover:border-cyan hover:text-cyan 
                cursor-grab active:cursor-grabbing select-none transition-all duration-200 shadow-sm
                ${isDragging ? 'shadow-glow border-cyan text-cyan' : ''}
            `}
        >
            {label}
        </div>
    );
};