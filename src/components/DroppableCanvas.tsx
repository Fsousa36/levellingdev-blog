'use client';
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableCanvasProps {
    children: React.ReactNode;
    previewMode?: 'desktop' | 'tablet' | 'mobile';
}

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ children, previewMode = 'desktop' }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: 'main-canvas',
    });

    let maxWidthClass = 'max-w-4xl'; // desktop fallback
    if (previewMode === 'tablet') maxWidthClass = 'max-w-[768px]';
    if (previewMode === 'mobile') maxWidthClass = 'max-w-[375px]';

    return (
        <div
            ref={setNodeRef}
            className={`mx-auto bg-panel min-h-[75vh] rounded-xl p-6 space-y-4 border transition-all duration-300 ${maxWidthClass} ${
                isOver 
                    ? 'border-cyan shadow-glow ring-1 ring-cyan/50' 
                    : 'border-line shadow-lg'
            }`}
        >
            {children}
        </div>
    );
};