import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de uso do LevellingDev.'
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/" className="text-sm text-cyan hover:text-white">
        Voltar para a pagina inicial
      </Link>
      <h1 className="mt-8 text-4xl font-semibold text-white">Termos de Uso</h1>
      <div className="prose prose-invert prose-custom mt-8 max-w-none">
        <p>
          Ao acessar o LevellingDev, voce concorda com estes termos. Este conteudo e uma base pronta para edicao e deve
          ser adaptado conforme as politicas definitivas do projeto.
        </p>
        <h2>Uso do conteudo</h2>
        <p>
          Os artigos publicados possuem finalidade educacional e informativa. O leitor e responsavel por validar qualquer
          implementacao tecnica antes de utiliza-la em ambientes de producao.
        </p>
        <h2>Propriedade intelectual</h2>
        <p>
          Textos, marcas, identidade visual e materiais publicados pertencem ao LevellingDev ou aos respectivos titulares
          citados. A reproducao deve respeitar a legislacao aplicavel.
        </p>
        <h2>Alteracoes</h2>
        <p>
          Estes termos podem ser atualizados a qualquer momento para refletir melhorias no site, novas funcionalidades ou
          exigencias legais.
        </p>
      </div>
    </main>
  );
}
