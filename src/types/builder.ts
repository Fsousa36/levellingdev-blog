export type BlockType = 'container' | 'text' | 'image' | 'video';

export interface BlockStyles {
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    padding?: string;
    backgroundColor?: string;
    borderRadius?: string;
}

export interface Block {
    id: string;
    type: BlockType;
    props: {
        content?: string;
        src?: string;
        url?: string;
        alt?: string;
    };
    styles: BlockStyles;
    children?: Block[]; // Permite empilhar elementos dentro de containers (Stacks)
}