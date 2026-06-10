'use client';
import React from 'react';
import { useBuilder } from '../context/BuilderContext';

export const PropertyInspector: React.FC = () => {
    const { blocks, selectedBlockId, updateBlockStyles, updateBlockProps } = useBuilder();

    const findBlock = (list: any[]): any => {
        for (const b of list) {
            if (b.id === selectedBlockId) return b;
            if (b.children) {
                const found = findBlock(b.children);
                if (found) return found;
            }
        }
        return null;
    };

    const currentBlock = findBlock(blocks);

    if (!currentBlock) {
        return (
            <div className="p-6 text-slate-500 text-sm italic h-full bg-panel text-center pt-20 flex flex-col items-center gap-3">
                <span className="block h-8 w-8 rounded-full bg-ink flex items-center justify-center border border-line text-slate-600">
                    ?
                </span>
                Selecione um elemento para editar.
            </div>
        );
    }

    return (
        <div className="p-5 space-y-6 bg-panel h-full overflow-y-auto select-none">
            <h3 className="font-bold text-white text-sm border-b border-line pb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_8px_rgba(121,242,192,0.8)]"></span>
                Configurações ({currentBlock.type.toUpperCase()})
            </h3>

            {currentBlock.type === 'text' && (
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Texto</label>
                    <textarea
                        className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors resize-y"
                        rows={4}
                        value={currentBlock.props.content || ''}
                        onChange={(e) => updateBlockProps(currentBlock.id, { content: e.target.value })}
                    />
                </div>
            )}

            {currentBlock.type === 'text' && (
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Família da Fonte</label>
                        <select
                            className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors appearance-none"
                            value={currentBlock.styles.fontFamily || 'Inter'}
                            onChange={(e) => updateBlockStyles(currentBlock.id, { fontFamily: e.target.value })}
                        >
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Courier New, monospace">Monospace</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tamanho da Fonte</label>
                        <input
                            type="text"
                            className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors"
                            placeholder="Ex: 24px ou 1.5rem"
                            value={currentBlock.styles.fontSize || ''}
                            onChange={(e) => updateBlockStyles(currentBlock.id, { fontSize: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {currentBlock.type === 'video' && (
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">URL do Vídeo (Embed)</label>
                    <input
                        type="text"
                        className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-mint focus:ring-1 focus:ring-mint outline-none transition-colors"
                        placeholder="https://www.youtube.com/embed/..."
                        value={currentBlock.props.url || ''}
                        onChange={(e) => updateBlockProps(currentBlock.id, { url: e.target.value })}
                    />
                </div>
            )}

            {currentBlock.type === 'image' && (
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Link da Imagem (URL)</label>
                    <input
                        type="text"
                        className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-mint focus:ring-1 focus:ring-mint outline-none transition-colors"
                        placeholder="https://site.com/imagem.png"
                        value={currentBlock.props.src || ''}
                        onChange={(e) => updateBlockProps(currentBlock.id, { src: e.target.value })}
                    />
                </div>
            )}

            <div className="pt-5 border-t border-line space-y-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">Espaçamento Interno (Padding)</label>
                <input
                    type="text"
                    className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-amber focus:ring-1 focus:ring-amber outline-none transition-colors"
                    placeholder="Ex: 20px"
                    value={currentBlock.styles.padding || ''}
                    onChange={(e) => updateBlockStyles(currentBlock.id, { padding: e.target.value })}
                />
            </div>
            
            <div className="pt-2 space-y-3">
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">Cor de Fundo (Background)</label>
                 <input
                    type="text"
                    className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-amber focus:ring-1 focus:ring-amber outline-none transition-colors"
                    placeholder="Ex: #ffffff ou transparent"
                    value={currentBlock.styles.backgroundColor || ''}
                    onChange={(e) => updateBlockStyles(currentBlock.id, { backgroundColor: e.target.value })}
                />
            </div>
        </div>
    );
};