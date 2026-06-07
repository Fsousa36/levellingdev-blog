import type { BlogPost } from '../lib/types';

export const staticPosts: BlogPost[] = [
  {
    slug: 'agentes-de-ia-no-desenvolvimento',
    title: 'Agentes de IA no desenvolvimento: onde eles ajudam e onde ainda precisam de adulto na sala',
    description:
      'Um guia direto sobre agentes de IA para devs: planejamento, revisao, testes, contexto, riscos e uso responsavel no ciclo de software.',
    category: 'IA aplicada',
    date: '7 junho 2026',
    readTime: '8 min',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Interface abstrata de inteligencia artificial com pontos conectados',
    keywords: ['agentes de IA', 'desenvolvimento de software', 'coding agents', 'engenharia com IA'],
    sections: [
      {
        heading: 'O que mudou de verdade',
        body: [
          'A conversa sobre IA no desenvolvimento saiu do autocomplete bonito para sistemas que recebem uma tarefa, consultam contexto, mexem em arquivos, rodam comandos e devolvem uma proposta de mudanca. Isso e poderoso, mas tambem muda o papel do dev: menos digitacao repetitiva, mais julgamento tecnico.',
          'Na pratica, agentes funcionam melhor quando a tarefa tem fronteira clara. Corrigir um bug pequeno, explicar um erro de build, gerar testes para uma regra isolada ou refatorar um componente com escopo definido costuma funcionar bem. Ja decisoes de produto, seguranca, arquitetura e dados sensiveis ainda precisam de revisao humana firme.'
        ]
      },
      {
        heading: 'Use agentes como pares, nao como pilotos automaticos',
        body: [
          'O fluxo mais saudavel e tratar a IA como um par de programacao que trabalha rapido, mas que nao conhece o contexto social do projeto. Ela pode sugerir caminhos, escrever uma primeira versao e levantar hipoteses. Quem fecha a conta e o humano: testa, compara, corta exageros e assume a responsabilidade pelo que vai para producao.',
          'Um bom prompt para agente parece mais com um ticket bem escrito do que com uma ordem generica. Inclua objetivo, arquivos provaveis, criterios de aceite, restricoes e o que nao deve ser alterado.'
        ]
      },
      {
        heading: 'Governanca pequena evita dor grande',
        body: [
          'Nao precisa criar burocracia pesada para todo experimento. Comece com regras simples: branch separada, diff revisado, testes obrigatorios, segredo fora do prompt, logs sem dados pessoais e limite de arquivos tocados por tarefa.',
          'Quando o agente passa a criar pull requests, chamar APIs ou mexer em deploy, trate como automacao de producao. Coloque permissoes minimas, trilha de auditoria e uma etapa clara de aprovacao.'
        ]
      }
    ],
    checklist: [
      'Escreva tarefas pequenas e verificaveis.',
      'Peça testes junto com a implementacao.',
      'Revise diffs como se viessem de uma pessoa junior muito rapida.',
      'Nunca cole chaves, tokens ou dados de clientes em prompts.',
      'Mantenha uma checklist de rollback para mudancas geradas por IA.'
    ],
    externalLinks: [
      {
        label: 'Gartner sobre agentes de codigo',
        href: 'https://www.gartner.com/en/newsroom/press-releases/2026-05-20-gartner-says-the-market-for-enterprise-ai-coding-agents-is-entering-a-new-phase-of-expansion-and-competitive-realignment'
      },
      {
        label: 'Stack Overflow Developer Survey 2025',
        href: 'https://survey.stackoverflow.co/2025/ai'
      }
    ]
  },
  {
    slug: 'low-code-com-ia-sem-virar-bagunca',
    title: 'Low-code com IA sem virar bagunca: o mapa para criar rapido e manter depois',
    description:
      'Como usar low-code, automacao e IA para entregar mais rapido sem perder controle tecnico, seguranca e evolucao do produto.',
    category: 'Low-code',
    date: '7 junho 2026',
    readTime: '7 min',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Dashboard de analise e automacao em uma tela escura',
    keywords: ['low-code', 'no-code', 'automacao com IA', 'governanca low-code'],
    sections: [
      {
        heading: 'A melhor ferramenta ainda e um bom desenho do processo',
        body: [
          'Low-code brilha quando existe um fluxo claro. Entrada, validacao, aprovacao, acao e notificacao. Se esse caminho esta confuso, a plataforma so transforma confusao em telas bonitas.',
          'Antes de construir, escreva o processo em linguagem simples. Quem dispara? Que dados entram? Quem pode aprovar? O que acontece quando falha? Essa clareza economiza mais tempo do que qualquer plugin.'
        ]
      },
      {
        heading: 'IA entra onde existe repeticao com criterio',
        body: [
          'Classificar chamados, resumir historico, sugerir resposta, transformar texto em tarefa e preencher campos a partir de documentos sao bons pontos de partida. Eles reduzem trabalho manual sem entregar a decisao final completamente para o modelo.',
          'Evite comecar por fluxos que mexem com dinheiro, saude, contrato ou permissao sensivel. Primeiro prove valor em partes reversiveis do processo.'
        ]
      },
      {
        heading: 'Quando migrar para codigo',
        body: [
          'Nem tudo precisa virar codigo, mas alguns sinais pedem migracao: regra de negocio crescendo demais, muitas excecoes, necessidade de testes automatizados, performance ruim ou dependencia de integracoes criticas.',
          'O segredo e nao tratar low-code como descartavel. Documente decisoes, nomes de campos, endpoints e credenciais. Isso permite evoluir sem recomeçar do zero.'
        ]
      }
    ],
    checklist: [
      'Mapeie o fluxo antes de abrir a ferramenta.',
      'Separe automacoes internas de fluxos que afetam clientes.',
      'Crie logs para cada etapa importante.',
      'Defina donos para cada automacao.',
      'Revise mensalmente o que deve continuar low-code e o que deve virar codigo.'
    ],
    externalLinks: [
      {
        label: 'McKinsey: estado da IA em 2025',
        href: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai'
      },
      {
        label: 'Gartner: tendencias de ROI em engenharia',
        href: 'https://www.gartner.com/en/articles/technology-adoption-roi'
      }
    ]
  },
  {
    slug: 'seguranca-em-codigo-gerado-por-ia',
    title: 'Seguranca em codigo gerado por IA: como revisar sem travar o time',
    description:
      'Checklist pratico para revisar codigo criado com assistentes e agentes de IA antes de colocar qualquer coisa em producao.',
    category: 'Seguranca',
    date: '7 junho 2026',
    readTime: '9 min',
    image:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Tela com indicadores de seguranca digital e analise de risco',
    keywords: ['seguranca de software', 'codigo gerado por IA', 'AppSec', 'revisao de codigo'],
    sections: [
      {
        heading: 'Codigo que compila nao e codigo confiavel',
        body: [
          'Assistentes de IA podem gerar uma solucao que parece elegante, passa no olhar rapido e ainda assim deixa uma porta aberta. O risco nao esta apenas em bugs obvios; esta em validacao fraca, tratamento ruim de permissao, dependencia insegura e logging de informacao sensivel.',
          'Por isso a revisao precisa procurar comportamento, nao so estilo. A pergunta central e: o que um usuario mal-intencionado conseguiria fazer com essa mudanca?'
        ]
      },
      {
        heading: 'Crie uma revisao padrao para IA',
        body: [
          'Toda mudanca gerada por IA deve passar por uma lista curta: entrada validada, autorizacao checada no servidor, erros sem dados sensiveis, dependencias conhecidas, testes para casos ruins e rollback simples.',
          'Essa rotina nao desacelera o time; ela impede que velocidade vire divida invisivel. Quanto mais IA entra no fluxo, mais importante fica transformar revisao em processo repetivel.'
        ]
      },
      {
        heading: 'Prompts tambem fazem parte da superficie de ataque',
        body: [
          'Se o agente recebe contexto demais, ele pode vazar informacao em logs, comentarios ou respostas. Se recebe permissao demais, pode alterar arquivos fora do escopo. Menos contexto, melhor descrito, costuma ser mais seguro do que despejar o projeto inteiro na conversa.',
          'Para projetos comerciais, trate prompts importantes como artefatos de engenharia: versionados, revisados e sem segredo embutido.'
        ]
      }
    ],
    checklist: [
      'Rode testes e lint antes de aceitar o diff.',
      'Procure validacao de entrada e autorizacao no backend.',
      'Confira se logs nao exibem tokens, emails sensiveis ou dados pessoais.',
      'Revise dependencias novas antes de instalar.',
      'Peça para a IA explicar o pior caso de abuso da propria solucao.'
    ],
    externalLinks: [
      {
        label: 'OWASP Top 10 para LLM Apps',
        href: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/'
      },
      {
        label: 'Stack Overflow: confianca em ferramentas de IA',
        href: 'https://survey.stackoverflow.co/2025/ai'
      }
    ]
  },
  {
    slug: 'nextjs-docker-vps-dokploy',
    title: 'Next.js com Docker na VPS: um caminho simples para publicar sem depender de plataforma fechada',
    description:
      'Uma visao pratica sobre Next.js standalone, Dockerfile enxuto, Dokploy, arquivos publicos, SEO tecnico e manutencao em VPS.',
    category: 'DevOps',
    date: '7 junho 2026',
    readTime: '8 min',
    image:
      'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Servidor e infraestrutura em nuvem representados em interface digital',
    keywords: ['Next.js Docker', 'Dokploy', 'VPS', 'deploy Next.js', 'standalone'],
    sections: [
      {
        heading: 'Por que standalone importa',
        body: [
          'O modo standalone do Next.js empacota o necessario para rodar a aplicacao em producao sem levar o projeto inteiro para dentro da imagem. Isso reduz peso, melhora previsibilidade e deixa o container mais facil de operar.',
          'Em VPS, essa simplicidade vale muito. Menos arquivos, menos dependencias em runtime e uma porta clara para o proxy encaminhar.'
        ]
      },
      {
        heading: 'O que nao pode faltar no container',
        body: [
          'A build precisa copiar tres coisas: o servidor standalone, os assets estaticos de .next/static e a pasta public. Sem public, arquivos como ads.txt somem da raiz do dominio e ferramentas externas deixam de validar o site.',
          'Tambem vale fixar porta interna, desativar telemetria e rodar com usuario nao-root. Sao detalhes pequenos, mas ajudam em estabilidade e seguranca.'
        ]
      },
      {
        heading: 'SEO tecnico tambem e deploy',
        body: [
          'Depois de publicar, teste a home, robots.txt, sitemap.xml, ads.txt, canonical e status HTTPS. Um site bonito que responde com dominio errado ou sitemap antigo confunde buscadores e plataformas de monetizacao.',
          'No fim, deploy bom e aquele que qualquer servico externo consegue ler sem pedir explicacao.'
        ]
      }
    ],
    checklist: [
      'Use output standalone no next.config.',
      'Copie public para o container final.',
      'Teste ads.txt diretamente pelo dominio de producao.',
      'Confira canonical e sitemap com a grafia exata do dominio.',
      'Mantenha logs de build e rollback no painel da VPS.'
    ],
    externalLinks: [
      {
        label: 'Documentacao Next.js sobre deploy',
        href: 'https://nextjs.org/docs/app/getting-started/deploying'
      },
      {
        label: 'Documentacao Next.js sobre output',
        href: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/output'
      }
    ]
  }
];

export const posts = staticPosts;
