'use client';
import React, { ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { BlockType } from '../types/builder';

interface DraggableWidgetProps {
    type: BlockType;
    label: string;
    icon?: ReactNode;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ type, label, icon }) => {
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
                flex flex-col items-center justify-center gap-1.5 p-2 h-16 bg-ink/80 hover:bg-[#263241] text-slate-300
                rounded border border-transparent hover:border-cyan/50
                cursor-grab active:cursor-grabbing select-none transition-all duration-200
                ${isDragging ? 'shadow-glow border-cyan text-cyan scale-105' : ''}
            `}
        >
            {icon && <div className="text-slate-400 [&>svg]:w-4 [&>svg]:h-4 group-hover:text-cyan">{icon}</div>}
            <span className="text-[10px] font-medium leading-tight">{label}</span>
        </div>
    );
};