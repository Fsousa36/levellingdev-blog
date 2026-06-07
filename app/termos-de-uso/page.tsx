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
        Voltar para Home
      </Link>
      <h1 className="mt-8 text-4xl font-semibold text-white">Termos de Uso</h1>
      <div className="prose prose-invert prose-custom mt-8 max-w-none">
        <h2>1. Termos</h2>
        <p>
          Ao acessar ao site LevellingDev, concorda em cumprir estes termos de servico, todas as leis e regulamentos
          aplicaveis e concorda que e responsavel pelo cumprimento de todas as leis locais aplicaveis. Se voce nao
          concordar com algum desses termos, esta proibido de usar ou acessar este site. Os materiais contidos neste site
          sao protegidos pelas leis de direitos autorais e marcas comerciais aplicaveis.
        </p>
        <h2>2. Uso de Licenca</h2>
        <p>
          E concedida permissao para baixar temporariamente uma copia dos materiais (informacoes ou software) no site
          LevellingDev, apenas para visualizacao transitoria pessoal e nao comercial. Esta e a concessao de uma licenca,
          nao uma transferencia de titulo e, sob esta licenca, voce nao pode: modificar ou copiar os materiais; usar os
          materiais para qualquer finalidade comercial ou para exibicao publica (comercial ou nao comercial); tentar
          descompilar ou fazer engenharia reversa de qualquer software contido no site LevellingDev; remover quaisquer
          direitos autorais ou outras notacoes de propriedade dos materiais; ou transferir os materiais para outra pessoa
          ou espelhe os materiais em qualquer outro servidor.
        </p>
        <p>
          Esta licenca sera automaticamente rescindida se voce violar alguma dessas restricoes e podera ser rescindida por
          LevellingDev a qualquer momento. Ao encerrar a visualizacao desses materiais ou apos o termino desta licenca,
          voce deve apagar todos os materiais baixados em sua posse, seja em formato eletronico ou impresso.
        </p>
        <h2>3. Isencao de responsabilidade</h2>
        <p>
          Os materiais no site da LevellingDev sao fornecidos como estao. LevellingDev nao oferece garantias, expressas ou
          implicitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitacao, garantias
          implicitas ou condicoes de comercializacao, adequacao a um fim especifico ou nao violacao de propriedade
          intelectual ou outra violacao de direitos.
        </p>
        <p>
          Alem disso, o LevellingDev nao garante ou faz qualquer representacao relativa a precisao, aos resultados
          provaveis ou a confiabilidade do uso dos materiais em seu site ou de outra forma relacionado a esses materiais ou
          em sites vinculados a este site.
        </p>
        <h2>4. Limitacoes</h2>
        <p>
          Em nenhum caso o LevellingDev ou seus fornecedores serao responsaveis por quaisquer danos (incluindo, sem
          limitacao, danos por perda de dados ou lucro ou devido a interrupcao dos negocios) decorrentes do uso ou da
          incapacidade de usar os materiais em LevellingDev, mesmo que LevellingDev ou um representante autorizado da
          LevellingDev tenha sido notificado oralmente ou por escrito da possibilidade de tais danos. Como algumas
          jurisdicoes nao permitem limitacoes em garantias implicitas, ou limitacoes de responsabilidade por danos
          consequentes ou incidentais, essas limitacoes podem nao se aplicar a voce.
        </p>
        <h2>5. Precisao dos materiais</h2>
        <p>
          Os materiais exibidos no site da LevellingDev podem incluir erros tecnicos, tipograficos ou fotograficos.
          LevellingDev nao garante que qualquer material em seu site seja preciso, completo ou atual. LevellingDev pode
          fazer alteracoes nos materiais contidos em seu site a qualquer momento, sem aviso previo. No entanto, LevellingDev
          nao se compromete a atualizar os materiais.
        </p>
        <h2>6. Links</h2>
        <p>
          O LevellingDev nao analisou todos os sites vinculados ao seu site e nao e responsavel pelo conteudo de nenhum
          site vinculado. A inclusao de qualquer link nao implica endosso por LevellingDev do site. O uso de qualquer site
          vinculado e por conta e risco do usuario.
        </p>
        <h2>Modificacoes</h2>
        <p>
          O LevellingDev pode revisar estes termos de servico do site a qualquer momento, sem aviso previo. Ao usar este
          site, voce concorda em ficar vinculado a versao atual desses termos de servico.
        </p>
        <h2>Lei aplicavel</h2>
        <p>
          Estes termos e condicoes sao regidos e interpretados de acordo com as leis aplicaveis e voce se submete
          irrevogavelmente a jurisdicao exclusiva dos tribunais competentes naquele estado ou localidade.
        </p>
      </div>
    </main>
  );
}
