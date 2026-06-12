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

    let maxWidthStyle = '100%';
    if (previewMode === 'tablet') maxWidthStyle = '768px';
    if (previewMode === 'mobile') maxWidthStyle = '375px';

    return (
        <div className="flex justify-center w-full min-h-full">
            <div
                ref={setNodeRef}
                style={{ width: '100%', maxWidth: maxWidthStyle }}
                className={`bg-panel min-h-[75vh] rounded-xl p-6 space-y-4 border transition-all duration-300 ${
                    isOver 
                        ? 'border-cyan shadow-glow ring-1 ring-cyan/50' 
                        : 'border-line shadow-lg'
                }`}
            >
                {children}
            </div>
        </div>
    );
};