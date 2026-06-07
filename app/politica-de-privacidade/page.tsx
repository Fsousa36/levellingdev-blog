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
        Voltar para Home
      </Link>
      <h1 className="mt-8 text-4xl font-semibold text-white">Politica de Privacidade</h1>
      <div className="prose prose-invert prose-custom mt-8 max-w-none">
        <p>
          A sua privacidade e importante para nos. E politica do LevellingDev respeitar a sua privacidade em relacao a
          qualquer informacao sua que possamos coletar no site LevellingDev, e outros sites que possuimos e operamos.
          Solicitamos informacoes pessoais apenas quando realmente precisamos delas para lhe fornecer um servico.
          Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Tambem informamos por que estamos
          coletando e como sera usado.
        </p>
        <p>
          Apenas retemos as informacoes coletadas pelo tempo necessario para fornecer o servico solicitado. Quando
          armazenamos dados, protegemos dentro de meios comercialmente aceitaveis para evitar perdas e roubos, bem como
          acesso, divulgacao, copia, uso ou modificacao nao autorizados.
        </p>
        <p>
          Nao compartilhamos informacoes de identificacao pessoal publicamente ou com terceiros, exceto quando exigido por
          lei. O nosso site pode ter links para sites externos que nao sao operados por nos. Esteja ciente de que nao temos
          controle sobre o conteudo e praticas desses sites e nao podemos aceitar responsabilidade por suas respectivas
          politicas de privacidade.
        </p>
        <p>
          Voce e livre para recusar a nossa solicitacao de informacoes pessoais, entendendo que talvez nao possamos
          fornecer alguns dos servicos desejados. O uso continuado de nosso site sera considerado como aceitacao de nossas
          praticas em torno de privacidade e informacoes pessoais. Se voce tiver alguma duvida sobre como lidamos com dados
          do usuario e informacoes pessoais, entre em contacto connosco.
        </p>
        <p>
          O servico Google AdSense que usamos para veicular publicidade usa um cookie DoubleClick para veicular anuncios
          mais relevantes em toda a Web e limitar o numero de vezes que um determinado anuncio e exibido para voce. Para
          mais informacoes sobre o Google AdSense, consulte as FAQs oficiais sobre privacidade do Google AdSense.
        </p>
        <p>
          Utilizamos anuncios para compensar os custos de funcionamento deste site e fornecer financiamento para futuros
          desenvolvimentos. Os cookies de publicidade comportamental usados por este site foram projetados para garantir
          que voce forneca os anuncios mais relevantes sempre que possivel, rastreando anonimamente seus interesses e
          apresentando coisas semelhantes que possam ser do seu interesse.
        </p>
        <p>
          Varios parceiros anunciam em nosso nome e os cookies de rastreamento de afiliados simplesmente nos permitem ver
          se nossos clientes acessaram o site atraves de um dos sites de nossos parceiros, para que possamos credita-los
          adequadamente e, quando aplicavel, permitir que nossos parceiros afiliados oferecam qualquer promocao que pode
          fornece-lo para fazer uma compra.
        </p>
        <h2>Compromisso do Usuario</h2>
        <p>
          O usuario se compromete a fazer uso adequado dos conteudos e da informacao que o LevellingDev oferece no site e
          com carater enunciativo, mas nao limitativo:
        </p>
        <p>
          A) Nao se envolver em atividades que sejam ilegais ou contrarias a boa fe a a ordem publica;
          <br />
          B) Nao difundir propaganda ou conteudo de natureza racista, xenofobica, jogos de sorte ou azar, qualquer tipo de
          pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;
          <br />
          C) Nao causar danos aos sistemas fisicos (hardwares) e logicos (softwares) do LevellingDev, de seus fornecedores
          ou terceiros, para introduzir ou disseminar virus informaticos ou quaisquer outros sistemas de hardware ou
          software que sejam capazes de causar danos anteriormente mencionados.
        </p>
        <h2>Mais informacoes</h2>
        <p>
          Esperemos que esteja esclarecido e, como mencionado anteriormente, se houver algo que voce nao tem certeza se
          precisa ou nao, geralmente e mais seguro deixar os cookies ativados, caso interaja com um dos recursos que voce
          usa em nosso site.
        </p>
        <p>Esta politica e efetiva a partir de 7 June 2026 20:30.</p>
      </div>
    </main>
  );
}
