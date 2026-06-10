'use client';
import React, { createContext, useContext, useState } from 'react';
import { Block, BlockStyles } from '../types/builder';
import { arrayMove } from '@dnd-kit/sortable';

interface BuilderContextType {
    blocks: Block[];
    selectedBlockId: string | null;
    selectBlock: (id: string) => void;
    updateBlockStyles: (id: string, styles: BlockStyles) => void;
    updateBlockProps: (id: string, props: any) => void;
    addBlock: (parentId: string | null, type: Block['type']) => void;
    moveBlock: (activeId: string, overId: string) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // Função recursiva para varrer e atualizar a árvore JSON profunda
    const updateInTree = (list: Block[], id: string, key: 'styles' | 'props', data: any): Block[] => {
        return list.map((block) => {
            if (block.id === id) {
                return { ...block, [key]: { ...block[key], ...data } };
            }
            if (block.children) {
                return { ...block, children: updateInTree(block.children, id, key, data) };
            }
            return block;
        });
    };

    const updateBlockStyles = (id: string, styles: BlockStyles) => {
        setBlocks((prev) => updateInTree(prev, id, 'styles', styles));
    };

    const updateBlockProps = (id: string, props: any) => {
        setBlocks((prev) => updateInTree(prev, id, 'props', props));
    };

    const selectBlock = (id: string) => setSelectedBlockId(id);

    const addBlock = (parentId: string | null, type: Block['type']) => {
        const newBlock: Block = {
            id: `${type}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            props: type === 'text' ? { content: 'Clique aqui e use o painel lateral para mudar o texto...' } : {},
            styles: { padding: '16px', fontFamily: 'Inter', fontSize: '16px', backgroundColor: 'transparent' },
            children: type === 'container' ? [] : undefined,
        };

        if (!parentId) {
            setBlocks((prev) => [...prev, newBlock]);
        } else {
            const addToContainer = (list: Block[]): Block[] => {
                return list.map((b) => {
                    if (b.id === parentId && b.children) {
                        return { ...b, children: [...b.children, newBlock] };
                    }
                    if (b.children) return { ...b, children: addToContainer(b.children) };
                    return b;
                });
            };
            setBlocks((prev) => addToContainer(prev));
        }
    };

    const moveBlock = (activeId: string, overId: string) => {
        setBlocks((prev) => {
            const reorderDeep = (list: Block[]): Block[] => {
                const aIdx = list.findIndex((b) => b.id === activeId);
                const oIdx = list.findIndex((b) => b.id === overId);

                // Se ambos estão no mesmo nível desta lista
                if (aIdx !== -1 && oIdx !== -1) {
                    return arrayMove(list, aIdx, oIdx);
                }

                // Senão procurar recursivamente
                return list.map((b) => {
                    if (b.children) {
                        return { ...b, children: reorderDeep(b.children) };
                    }
                    return b;
                });
            };
            return reorderDeep(prev);
        });
    };

    return (
        <BuilderContext.Provider value={{ blocks, selectedBlockId, selectBlock, updateBlockStyles, updateBlockProps, addBlock, moveBlock }}>
            {children}
        </BuilderContext.Provider>
    );
};

export const useBuilder = () => {
    const context = useContext(BuilderContext);
    if (!context) throw new Error('useBuilder deve ser usado dentro de um BuilderProvider');
    return context;
};