'use client';
import React, { createContext, useContext, useState } from 'react';
import { Block, BlockStyles, BlockType } from '../types/builder';
import { arrayMove } from '@dnd-kit/sortable';

interface BuilderContextType {
    blocks: Block[];
    selectedBlockId: string | null;
    selectBlock: (id: string | null) => void;
    updateBlockStyles: (id: string, styles: Partial<BlockStyles>) => void;
    updateBlockProps: (id: string, props: Record<string, unknown>) => void;
    addBlock: (parentId: string | null, type: Block['type']) => void;
    moveBlock: (activeId: string, overId: string) => void;
    deleteBlock: (id: string) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

function findBlockInTree(list: Block[], id: string): Block | null {
    for (const b of list) {
        if (b.id === id) return b;
        if (b.children) {
            const found = findBlockInTree(b.children, id);
            if (found) return found;
        }
    }
    return null;
}

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const updateInTree = (list: Block[], id: string, key: 'styles' | 'props', data: Record<string, unknown>): Block[] =>
        list.map((block) => {
            if (block.id === id) return { ...block, [key]: { ...block[key], ...data } };
            if (block.children) return { ...block, children: updateInTree(block.children, id, key, data) };
            return block;
        });

    const updateBlockStyles = (id: string, styles: Partial<BlockStyles>) =>
        setBlocks((prev) => updateInTree(prev, id, 'styles', styles as Record<string, unknown>));

    const updateBlockProps = (id: string, props: Record<string, unknown>) =>
        setBlocks((prev) => updateInTree(prev, id, 'props', props));

    const selectBlock = (id: string | null) => setSelectedBlockId(id);

    const deleteBlock = (id: string) => {
        const removeFromTree = (list: Block[]): Block[] =>
            list.filter((b) => b.id !== id).map((b) => ({
                ...b,
                children: b.children ? removeFromTree(b.children) : undefined,
            }));
        setBlocks((prev) => removeFromTree(prev));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const addBlock = (parentId: string | null, type: Block['type']) => {
        const uid = `${type}_${Math.random().toString(36).substr(2, 9)}`;

        const newBlock: Block = {
            id: uid,
            type,
            props: {},
            styles: {
                padding: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                backgroundColor: 'transparent',
            },
        };

        // Defaults por tipo
        if (type === 'text') newBlock.props.content = 'Clique aqui e edite este texto no painel lateral.';
        if (type === 'heading') {
            newBlock.props.content = 'Novo Título';
            newBlock.styles.fontSize = '30px';
            newBlock.styles.fontFamily = 'Inter, sans-serif';
        }
        if (type === 'button') {
            newBlock.props.content = 'Clique Aqui';
            newBlock.styles.backgroundColor = '#49d7ff';
            newBlock.styles.color = '#0b1120';
            newBlock.styles.padding = '10px 22px';
            newBlock.styles.borderRadius = '8px';
        }
        if (type === 'divider') {
            newBlock.props.thickness = '2px';
            newBlock.styles.backgroundColor = '#263241';
            newBlock.styles.padding = '0';
        }
        if (type === 'spacer') {
            newBlock.props.height = '48px';
            newBlock.styles.padding = '0';
        }
        if (type === 'container') {
            newBlock.children = [];
            newBlock.styles.padding = '16px';
        }
        if (type === 'grid') {
            // Grid cria 2 colunas (container filhos) por padrão
            newBlock.props.columns = 2;
            newBlock.styles.padding = '8px';
            newBlock.children = [0, 1].map((i) => ({
                id: `${uid}_col_${i}`,
                type: 'container' as BlockType,
                props: {},
                styles: { padding: '8px', backgroundColor: 'transparent' },
                children: [],
            }));
        }

        setBlocks((prev) => {
            if (!parentId) return [...prev, newBlock];

            // Verifica se o parentId é um container (não grid)
            const parentBlock = findBlockInTree(prev, parentId);
            if (!parentBlock || parentBlock.type !== 'container') {
                // Fallback: adiciona na raiz
                return [...prev, newBlock];
            }

            const addToContainer = (list: Block[]): Block[] =>
                list.map((b) => {
                    if (b.id === parentId && b.type === 'container' && Array.isArray(b.children)) {
                        return { ...b, children: [...b.children, newBlock] };
                    }
                    if (b.children) return { ...b, children: addToContainer(b.children) };
                    return b;
                });

            return addToContainer(prev);
        });
    };

    const moveBlock = (activeId: string, overId: string) => {
        setBlocks((prev) => {
            const reorder = (list: Block[]): Block[] => {
                const aIdx = list.findIndex((b) => b.id === activeId);
                const oIdx = list.findIndex((b) => b.id === overId);
                if (aIdx !== -1 && oIdx !== -1) return arrayMove(list, aIdx, oIdx);
                return list.map((b) => ({
                    ...b,
                    children: b.children ? reorder(b.children) : undefined,
                }));
            };
            return reorder(prev);
        });
    };

    return (
        <BuilderContext.Provider
            value={{ blocks, selectedBlockId, selectBlock, updateBlockStyles, updateBlockProps, addBlock, moveBlock, deleteBlock }}
        >
            {children}
        </BuilderContext.Provider>
    );
};

export const useBuilder = () => {
    const ctx = useContext(BuilderContext);
    if (!ctx) throw new Error('useBuilder deve ser usado dentro de BuilderProvider');
    return ctx;
};