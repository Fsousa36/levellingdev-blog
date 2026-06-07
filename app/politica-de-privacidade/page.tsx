import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politica de Privacidade',
  description: 'Politica de privacidade do LevellingDev.'
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/" className="text-sm text-cyan hover:text-white">
        Voltar para a pagina inicial
      </Link>
      <h1 className="mt-8 text-4xl font-semibold text-white">Politica de Privacidade</h1>
      <div className="prose prose-invert prose-custom mt-8 max-w-none">
        <p>
          Esta pagina descreve como o LevellingDev coleta, utiliza e protege informacoes dos visitantes. O texto abaixo e
          uma base editorial pronta para revisao juridica e ajuste conforme os recursos finais do site.
        </p>
        <h2>Informacoes coletadas</h2>
        <p>
          Podemos coletar dados fornecidos voluntariamente em formularios de contato, alem de informacoes tecnicas como
          paginas acessadas, tipo de navegador, dispositivo, origem de trafego e dados anonimizados de analytics.
        </p>
        <h2>Cookies e publicidade</h2>
        <p>
          O site pode utilizar cookies para melhorar a experiencia, medir audiencia e exibir anuncios por meio de
          parceiros como o Google AdSense. O visitante pode gerenciar cookies diretamente nas configuracoes do navegador.
        </p>
        <h2>Contato</h2>
        <p>
          Para solicitar informacoes, correcoes ou remocao de dados, entre em contato pela pagina de contato do site.
        </p>
      </div>
    </main>
  );
}
