'use client';
import React, { useState } from 'react';
import { useBuilder } from '../context/BuilderContext';
import { Settings2, Paintbrush, Layers, Type, Square, Maximize } from 'lucide-react';

export const PropertyInspector: React.FC = () => {
    const { blocks, selectedBlockId, updateBlockStyles, updateBlockProps } = useBuilder();
    const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');

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
        <div className="bg-panel h-full overflow-y-auto select-none flex flex-col">
            <div className="p-4 bg-ink/50 border-b border-line flex items-center justify-between">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_8px_rgba(73,215,255,0.8)]"></span>
                    Editar {currentBlock.type.toUpperCase()}
                </h3>
            </div>

            <div className="flex border-b border-line bg-ink">
                <button 
                    onClick={() => setActiveTab('content')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors flex flex-col items-center gap-1 ${activeTab === 'content' ? 'text-cyan border-b-2 border-cyan bg-panel' : 'text-slate-500 hover:text-slate-300 hover:bg-line/20'}`}
                >
                    <Layers className="w-4 h-4" />
                    Conteúdo
                </button>
                <button 
                    onClick={() => setActiveTab('style')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors flex flex-col items-center gap-1 ${activeTab === 'style' ? 'text-cyan border-b-2 border-cyan bg-panel' : 'text-slate-500 hover:text-slate-300 hover:bg-line/20'}`}
                >
                    <Paintbrush className="w-4 h-4" />
                    Estilo
                </button>
                <button 
                    onClick={() => setActiveTab('advanced')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors flex flex-col items-center gap-1 ${activeTab === 'advanced' ? 'text-cyan border-b-2 border-cyan bg-panel' : 'text-slate-500 hover:text-slate-300 hover:bg-line/20'}`}
                >
                    <Settings2 className="w-4 h-4" />
                    Avançado
                </button>
            </div>

            <div className="p-5 space-y-6 flex-1">
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        {(currentBlock.type === 'text' || currentBlock.type === 'heading' || currentBlock.type === 'button') && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Texto do {currentBlock.type}</label>
                                <textarea
                                    className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors resize-y"
                                    rows={3}
                                    value={currentBlock.props.content || ''}
                                    onChange={(e) => updateBlockProps(currentBlock.id, { content: e.target.value })}
                                />
                            </div>
                        )}

                        {currentBlock.type === 'video' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">URL do Vídeo (Embed)</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors"
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
                                    className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors"
                                    placeholder="https://site.com/imagem.png"
                                    value={currentBlock.props.src || ''}
                                    onChange={(e) => updateBlockProps(currentBlock.id, { src: e.target.value })}
                                />
                            </div>
                        )}

                        {currentBlock.type === 'grid' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Quantidade de Colunas</label>
                                <select
                                    className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors appearance-none"
                                    value={currentBlock.props.columns || 2}
                                    onChange={(e) => updateBlockProps(currentBlock.id, { columns: parseInt(e.target.value) })}
                                >
                                    <option value="1">1 Coluna</option>
                                    <option value="2">2 Colunas</option>
                                    <option value="3">3 Colunas</option>
                                    <option value="4">4 Colunas</option>
                                    <option value="5">5 Colunas</option>
                                    <option value="6">6 Colunas</option>
                                </select>
                            </div>
                        )}

                        {currentBlock.type === 'divider' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Espessura da Linha</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors"
                                    placeholder="Ex: 2px"
                                    value={currentBlock.props.thickness || ''}
                                    onChange={(e) => updateBlockProps(currentBlock.id, { thickness: e.target.value })}
                                />
                            </div>
                        )}

                        {currentBlock.type === 'spacer' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Altura do Espaçador</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-ink border border-line rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors"
                                    placeholder="Ex: 50px"
                                    value={currentBlock.props.height || ''}
                                    onChange={(e) => updateBlockProps(currentBlock.id, { height: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'style' && (
                    <div className="space-y-6">
                        {(currentBlock.type === 'text' || currentBlock.type === 'heading' || currentBlock.type === 'button') && (
                            <div className="space-y-5 bg-ink p-4 rounded-lg border border-line">
                                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 border-b border-line/50 pb-2 flex items-center gap-2">
                                    <Type className="w-3 h-3 text-cyan" /> Tipografia
                                </h4>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Família da Fonte</label>
                                    <select
                                        className="w-full p-2 bg-panel border border-line rounded-md text-xs text-slate-200 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors appearance-none"
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
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Tamanho (Size)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-panel border border-line rounded-md text-xs text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors"
                                        placeholder="Ex: 24px"
                                        value={currentBlock.styles.fontSize || ''}
                                        onChange={(e) => updateBlockStyles(currentBlock.id, { fontSize: e.target.value })}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Cor do Texto</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                                            value={currentBlock.styles.color || '#ffffff'}
                                            onChange={(e) => updateBlockStyles(currentBlock.id, { color: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="flex-1 p-2 bg-panel border border-line rounded-md text-xs text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors"
                                            placeholder="Ex: #ffffff"
                                            value={currentBlock.styles.color || ''}
                                            onChange={(e) => updateBlockStyles(currentBlock.id, { color: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5 bg-ink p-4 rounded-lg border border-line">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 border-b border-line/50 pb-2 flex items-center gap-2">
                                <Square className="w-3 h-3 text-cyan" /> Fundo & Borda
                            </h4>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Cor de Fundo</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                                        value={currentBlock.styles.backgroundColor && currentBlock.styles.backgroundColor !== 'transparent' ? currentBlock.styles.backgroundColor : '#ffffff'}
                                        onChange={(e) => updateBlockStyles(currentBlock.id, { backgroundColor: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 p-2 bg-panel border border-line rounded-md text-xs text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors"
                                        placeholder="Ex: #0f172a ou transparent"
                                        value={currentBlock.styles.backgroundColor || ''}
                                        onChange={(e) => updateBlockStyles(currentBlock.id, { backgroundColor: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            {currentBlock.type === 'button' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Arredondamento (Border Radius)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-panel border border-line rounded-md text-xs text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors"
                                        placeholder="Ex: 8px"
                                        value={currentBlock.styles.borderRadius || ''}
                                        onChange={(e) => updateBlockStyles(currentBlock.id, { borderRadius: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="space-y-6">
                        <div className="space-y-5 bg-ink p-4 rounded-lg border border-line">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 border-b border-line/50 pb-2 flex items-center gap-2">
                                <Maximize className="w-3 h-3 text-cyan" /> Layout
                            </h4>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Espaçamento Interno (Padding)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 bg-panel border border-line rounded-md text-xs text-slate-200 placeholder-slate-600 focus:border-cyan focus:ring-1 focus:ring-cyan outline-none transition-colors"
                                    placeholder="Ex: 20px ou 10px 20px"
                                    value={currentBlock.styles.padding || ''}
                                    onChange={(e) => updateBlockStyles(currentBlock.id, { padding: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-500 mt-1">Insira um valor CSS válido. Ex: <code className="text-slate-400 bg-panel px-1 rounded">20px 40px</code></p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};