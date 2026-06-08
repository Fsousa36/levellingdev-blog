import type { BlogPost } from './types';
import { generateEditorialImage, rewritePostForPtBr } from './editor-tools';
import { getEditorSetting } from './db';

export type TextProvider = 'local' | 'openai' | 'gemini' | 'anthropic' | 'deepseek' | 'qwen' | 'opencode';
export type ImageProvider = 'pollinations' | 'openai' | 'gemini';

function extractJson(value: string) {
  const cleaned = value
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');

  if (first >= 0 && last > first) {
    return JSON.parse(cleaned.slice(first, last + 1));
  }

  return JSON.parse(cleaned);
}

function buildRewritePrompt(post: BlogPost) {
  return `
Voce e editor senior do blog LevellingDev. Reescreva a pauta abaixo em portugues do Brasil, com tom humano, tecnico e original.

Regras obrigatorias:
- Nao copie frases da fonte original.
- Preserve fatos, nomes de produtos e link da fonte.
- Nao invente informacoes.
- Corrija ortografia e clareza.
- Crie um artigo util para devs, com SEO, subtitulos e checklist.
- Responda SOMENTE JSON valido no formato:
{
  "title": "titulo em PT-BR",
  "description": "resumo SEO curto",
  "category": "categoria",
  "keywords": ["palavra 1", "palavra 2"],
  "sections": [{"heading":"subtitulo","body":["paragrafo 1","paragrafo 2"]}],
  "checklist": ["item 1","item 2","item 3"],
  "imagePrompt": "prompt de imagem editorial sem texto na imagem"
}

Titulo: ${post.title}
Resumo atual: ${post.description}
Categoria: ${post.category}
Fonte: ${post.sourceName ?? 'fonte externa'}
URL da fonte: ${post.sourceUrl ?? post.externalLinks[0]?.href ?? 'sem url'}
`.trim();
}

function buildDraftPrompt({
  title,
  instruction,
  sourceUrl
}: {
  title: string;
  instruction?: string;
  sourceUrl?: string;
}) {
  return `
Voce e editor senior do blog LevellingDev. Crie um editorial original em portugues do Brasil com base no titulo ou tema abaixo.

Regras obrigatorias:
- Nao invente noticia especifica, numeros, datas, versoes ou anuncio oficial se nao houver fonte.
- Se houver fonte, preserve o link e use apenas como referencia.
- Escreva para desenvolvedores, criadores de apps, automacao, IA, no-code, VPS, Docker, banco de dados e deploy.
- Crie texto humano, claro, tecnico e util.
- O resumo deve ser curto e servir para card da Home e SEO.
- O texto principal deve ser completo, sem repetir o resumo, com 900 a 1400 palavras.
- Crie pelo menos 5 secoes, cada uma com 2 a 4 paragrafos.
- Inclua explicacoes praticas, riscos, boas praticas, exemplos de decisao e proximos passos.
- Se o tema for tutorial, descreva um fluxo aplicavel mesmo sem comandos especificos inventados.
- Use fontes externas confiaveis como base quando forem informadas. O sistema adicionara links oficiais por paragrafo na pagina publica.
- Nao crie URLs falsas. Se nao souber a URL exata, escreva o texto sem inventar link.
- Responda SOMENTE JSON valido no formato:
{
  "title": "titulo final",
  "description": "resumo curto",
  "category": "categoria",
  "keywords": ["palavra 1", "palavra 2"],
  "sections": [{"heading":"subtitulo","body":["paragrafo 1","paragrafo 2"]}],
  "checklist": ["item 1","item 2","item 3"],
  "imagePrompt": "prompt de imagem editorial sem texto na imagem"
}

Tema/titulo: ${title}
Pedido especifico do editor: ${instruction || 'sem pedido especifico'}
Fonte opcional: ${sourceUrl || 'sem fonte informada'}
`.trim();
}

function localDraft(title: string, sourceUrl?: string, instruction?: string): BlogPost {
  const cleanTitle = title.trim();
  const lowerTitle = cleanTitle.toLowerCase();
  const isDeploy = /dokploy|deploy|vps|docker|servidor|postgres|banco/.test(lowerTitle);

  return {
    slug: '',
    title: cleanTitle,
    description:
      `Um guia pratico sobre ${cleanTitle}, com foco em decisao tecnica, configuracao segura e aplicacao real para desenvolvedores.`,
    category: 'Programacao',
    date: '',
    readTime: '10 min',
    image: '',
    imageAlt: `Imagem editorial sobre ${cleanTitle}`,
    keywords: ['desenvolvimento de software', 'inteligencia artificial', 'automacao', 'programacao', 'deploy', 'tutorial'],
    sections: [
      {
        heading: 'Pedido editorial aplicado',
        body: [
          instruction
            ? `O pedido principal para este rascunho foi: ${instruction}. Use essa direcao para revisar o texto, acrescentar exemplos e ajustar o tom antes de publicar.`
            : 'Nenhum prompt especifico foi informado. O rascunho foi criado em formato editorial tecnico geral, pronto para ser refinado conforme o publico e o nivel de profundidade desejados.',
          'Quando o prompt do editor for mais detalhado, a materia tende a ficar mais alinhada com o objetivo. Bons pedidos incluem publico-alvo, nivel tecnico, topicos obrigatorios, pontos que nao devem aparecer e formato esperado.'
        ]
      },
      {
        heading: 'Contexto e objetivo',
        body: [
          `${cleanTitle} e um tema que merece ser tratado com calma porque normalmente envolve mais do que seguir uma sequencia de cliques. Para quem desenvolve, publica e mantem aplicacoes, a parte mais importante e entender o impacto no fluxo de trabalho: o que fica mais simples, o que passa a exigir mais controle e quais riscos precisam ser acompanhados desde o inicio.`,
          'Um bom editorial tecnico nao deve vender a ferramenta como solucao magica. O caminho mais seguro e partir do problema real: publicar aplicacoes com estabilidade, organizar ambientes, reduzir retrabalho e manter previsibilidade quando o projeto cresce. A partir dai, fica mais facil decidir se a abordagem combina com o seu momento.',
          sourceUrl
            ? 'Como existe uma fonte de referencia informada, use esse link para validar detalhes especificos, nomes de recursos, mudancas recentes e qualquer informacao sensivel antes de publicar a versao final.'
            : 'Como nao ha fonte externa informada, este rascunho trabalha com orientacao geral. Antes de publicar, revise nomes de recursos, comandos, versoes e limitacoes na documentacao oficial.'
        ]
      },
      {
        heading: isDeploy ? 'Como planejar a configuracao' : 'Como transformar o tema em pratica',
        body: [
          'Comece definindo o objetivo do tutorial. Em vez de tentar cobrir tudo de uma vez, escolha um resultado concreto: subir uma aplicacao, conectar um banco, criar um fluxo de automacao, testar uma ferramenta de IA ou organizar uma rotina de deploy. Esse recorte deixa o texto mais util e evita que o leitor se perca.',
          isDeploy
            ? 'No caso de VPS, Docker e Dokploy, o planejamento deve incluir dominio, SSL, variaveis de ambiente, banco de dados, rede interna, backups e estrategia de rollback. Mesmo quando a interface facilita o processo, a responsabilidade tecnica continua existindo.'
            : 'Se o tema envolver IA, low-code ou automacao, o planejamento deve incluir limites do modelo, revisao humana, custo por uso, privacidade dos dados e forma de medir se a solucao realmente melhora o fluxo.',
          'Depois disso, descreva o processo em blocos pequenos. Cada bloco deve responder tres perguntas: o que esta sendo feito, por que isso importa e como verificar se funcionou. Esse formato deixa a materia mais facil de seguir e melhora a qualidade para SEO.'
        ]
      },
      {
        heading: 'Pontos de atencao antes de publicar',
        body: [
          'O primeiro ponto e seguranca. Nunca exponha tokens, senhas, connection strings ou chaves de API no frontend, em prints ou em exemplos copiados diretamente do ambiente real. Quando for necessario mostrar uma configuracao, use valores ficticios e explique onde o leitor deve substituir pelo dado correto.',
          'O segundo ponto e custo. Ferramentas de IA, servidores VPS, bancos gerenciados e APIs externas podem parecer baratos no comeco, mas crescem conforme uso, trafego e automacao. Um bom editorial deve explicar onde estao os custos recorrentes e quais escolhas ajudam a manter controle.',
          'O terceiro ponto e manutencao. Uma configuracao que funciona hoje precisa ser atualizada, monitorada e documentada. Se o leitor nao souber como renovar certificado, trocar variavel de ambiente, restaurar backup ou atualizar a aplicacao, ele pode ficar dependente de tentativa e erro.'
        ]
      },
      {
        heading: 'Fluxo recomendado para o leitor',
        body: [
          'A melhor forma de aplicar o conteudo e criar um ambiente de teste antes de mexer no projeto principal. Esse ambiente pode ser uma aplicacao simples, um banco separado ou uma automacao pequena. O importante e validar o caminho sem colocar dados reais em risco.',
          'Depois do teste, registre os passos que funcionaram, os pontos que deram erro e as configuracoes que precisam ser repetidas. Essa anotacao vira base para o tutorial final e tambem ajuda a criar uma documentacao interna para futuros projetos.',
          'Por fim, publique apenas depois de revisar a parte tecnica. Se houver comandos, valide cada um. Se houver integracao com API, confira se o provedor ainda usa o mesmo endpoint. Se houver interface visual, confirme se as telas continuam iguais ou parecidas.'
        ]
      },
      {
        heading: 'Como evoluir esse rascunho',
        body: [
          'Este rascunho pode virar uma materia completa com exemplos reais, capturas de tela, links de referencia e uma lista de erros comuns. Para deixar o texto mais forte, adicione um caso pratico: uma aplicacao simples, um deploy real, uma integracao com banco ou um fluxo de IA que resolva uma tarefa especifica.',
          'Tambem vale incluir uma secao de comparacao. Explique quando essa abordagem faz sentido e quando talvez seja melhor escolher outro caminho. Esse tipo de honestidade melhora a confianca do leitor e evita que o conteudo pareca propaganda.',
          'A conclusao deve reforcar a decisao tecnica: o que o leitor consegue fazer depois de seguir o guia, quais cuidados continuam importantes e qual e o proximo passo recomendado.'
        ]
      }
    ],
    checklist: [
      'Validar nomes de recursos e versoes na documentacao oficial.',
      'Adicionar exemplos reais ou capturas de tela antes de publicar.',
      'Remover qualquer chave, senha ou dado sensivel do texto.',
      'Testar comandos e configuracoes em ambiente separado.',
      'Incluir fonte de referencia quando houver informacao externa.',
      'Revisar SEO: titulo, resumo, categoria, palavras-chave e links internos.'
    ],
    externalLinks: sourceUrl ? [{ label: 'Fonte de referencia', href: sourceUrl }] : [],
    sourceUrl,
    sourceImageUrl: sourceUrl
  };
}

async function getConfiguredValue(key: string) {
  return process.env[key] || (await getEditorSetting(key)) || '';
}

async function callOpenAIText(prompt: string, modelOverride?: string) {
  const apiKey = await getConfiguredValue('OPENAI_API_KEY');

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY nao configurada.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelOverride || (await getConfiguredValue('OPENAI_TEXT_MODEL')) || 'gpt-5-mini',
      input: prompt
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return (
    data.output_text ??
    data.output
      ?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? [])
      .map((part: { text?: string }) => part.text ?? '')
      .join('') ??
    ''
  );
}

async function callGeminiText(prompt: string, modelOverride?: string) {
  const apiKey = await getConfiguredValue('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nao configurada.');
  }

  const model = modelOverride || (await getConfiguredValue('GEMINI_TEXT_MODEL')) || 'gemini-2.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('') ?? '';
}

async function callDeepSeekText(prompt: string, modelOverride?: string) {
  const apiKey = await getConfiguredValue('DEEPSEEK_API_KEY');

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY nao configurada.');
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelOverride || (await getConfiguredValue('DEEPSEEK_TEXT_MODEL')) || 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Responda somente JSON valido.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callAnthropicText(prompt: string, modelOverride?: string) {
  const apiKey = await getConfiguredValue('ANTHROPIC_API_KEY');

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY nao configurada.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelOverride || (await getConfiguredValue('ANTHROPIC_TEXT_MODEL')) || 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: 'Responda somente JSON valido.',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return data.content?.map((part: { text?: string }) => part.text ?? '').join('') ?? '';
}

async function callOpenAICompatibleText({
  prompt,
  apiKey,
  baseUrl,
  model,
  providerName
}: {
  prompt: string;
  apiKey?: string;
  baseUrl: string;
  model: string;
  providerName: string;
}) {
  if (!apiKey) {
    throw new Error(`${providerName}_API_KEY nao configurada.`);
  }

  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Responda somente JSON valido.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    throw new Error(`${providerName} falhou: ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function rewriteWithProvider(post: BlogPost, provider: TextProvider, modelOverride?: string) {
  if (provider === 'local') {
    return rewritePostForPtBr(post);
  }

  const prompt = buildRewritePrompt(post);
  const raw =
    provider === 'openai'
      ? await callOpenAIText(prompt, modelOverride)
      : provider === 'gemini'
        ? await callGeminiText(prompt, modelOverride)
        : provider === 'anthropic'
          ? await callAnthropicText(prompt, modelOverride)
          : provider === 'qwen'
            ? await callOpenAICompatibleText({
                prompt,
                apiKey: (await getConfiguredValue('QWEN_API_KEY')) || (await getConfiguredValue('DASHSCOPE_API_KEY')),
                baseUrl: (await getConfiguredValue('QWEN_BASE_URL')) || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
                model: modelOverride || (await getConfiguredValue('QWEN_TEXT_MODEL')) || 'qwen-plus',
                providerName: 'QWEN'
              })
            : provider === 'opencode'
              ? await callOpenAICompatibleText({
                  prompt,
                  apiKey: await getConfiguredValue('OPENCODE_API_KEY'),
                  baseUrl: (await getConfiguredValue('OPENCODE_BASE_URL')) || 'https://api.opencode.ai/v1',
                  model: modelOverride || (await getConfiguredValue('OPENCODE_TEXT_MODEL')) || 'opencode-chat',
                  providerName: 'OPENCODE'
                })
              : await callDeepSeekText(prompt, modelOverride);
  const parsed = extractJson(raw);
  const cleanDescription = String(parsed.description ?? post.description).replace(/^(Resumo editorial:\s*)+/i, '').trim();

  return {
    ...post,
    title: parsed.title ?? post.title,
    description: cleanDescription,
    category: parsed.category ?? post.category,
    keywords: parsed.keywords ?? post.keywords,
    sections: parsed.sections ?? post.sections,
    checklist: parsed.checklist ?? post.checklist,
    imageAlt: `Imagem editorial para ${parsed.title ?? post.title}`
  } satisfies BlogPost;
}

export async function generateDraftWithProvider({
  title,
  instruction,
  sourceUrl,
  provider,
  modelOverride
}: {
  title: string;
  instruction?: string;
  sourceUrl?: string;
  provider: TextProvider;
  modelOverride?: string;
}) {
  if (provider === 'local') {
    return localDraft(title, sourceUrl, instruction);
  }

  const prompt = buildDraftPrompt({ title, instruction, sourceUrl });
  const raw =
    provider === 'openai'
      ? await callOpenAIText(prompt, modelOverride)
      : provider === 'gemini'
        ? await callGeminiText(prompt, modelOverride)
        : provider === 'anthropic'
          ? await callAnthropicText(prompt, modelOverride)
          : provider === 'qwen'
            ? await callOpenAICompatibleText({
                prompt,
                apiKey: (await getConfiguredValue('QWEN_API_KEY')) || (await getConfiguredValue('DASHSCOPE_API_KEY')),
                baseUrl: (await getConfiguredValue('QWEN_BASE_URL')) || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
                model: modelOverride || (await getConfiguredValue('QWEN_TEXT_MODEL')) || 'qwen-plus',
                providerName: 'QWEN'
              })
            : provider === 'opencode'
              ? await callOpenAICompatibleText({
                  prompt,
                  apiKey: await getConfiguredValue('OPENCODE_API_KEY'),
                  baseUrl: (await getConfiguredValue('OPENCODE_BASE_URL')) || 'https://api.opencode.ai/v1',
                  model: modelOverride || (await getConfiguredValue('OPENCODE_TEXT_MODEL')) || 'opencode-chat',
                  providerName: 'OPENCODE'
                })
              : await callDeepSeekText(prompt, modelOverride);
  const parsed = extractJson(raw);

  return {
    ...localDraft(title, sourceUrl, instruction),
    title: parsed.title ?? title,
    description: String(parsed.description ?? '').replace(/^(Resumo editorial:\s*)+/i, '').trim(),
    category: parsed.category ?? 'Programacao',
    keywords: parsed.keywords ?? ['desenvolvimento de software'],
    sections: parsed.sections ?? [],
    checklist: parsed.checklist ?? [],
    imageAlt: `Imagem editorial para ${parsed.title ?? title}`
  } satisfies BlogPost;
}

export async function generateImageWithProvider(post: BlogPost, provider: ImageProvider, modelOverride?: string) {
  const fallback = generateEditorialImage(post);

  if (provider === 'pollinations') {
    return fallback;
  }

  if (provider === 'openai') {
    const apiKey = await getConfiguredValue('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY nao configurada.');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelOverride || (await getConfiguredValue('OPENAI_IMAGE_MODEL')) || 'gpt-image-1',
        prompt: fallback.prompt,
        size: '1024x1024'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI imagem falhou: ${await response.text()}`);
    }

    const data = await response.json();
    const item = data.data?.[0];
    return {
      prompt: fallback.prompt,
      image: item?.b64_json ? `data:image/png;base64,${item.b64_json}` : item?.url ?? fallback.image,
      imageAlt: fallback.imageAlt
    };
  }

  const apiKey = await getConfiguredValue('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nao configurada.');
  }

  const model = modelOverride || (await getConfiguredValue('GEMINI_IMAGE_MODEL')) || 'gemini-2.5-flash-image';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fallback.prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini imagem falhou: ${await response.text()}`);
  }

  const data = await response.json();
  const inline = data.candidates?.[0]?.content?.parts?.find(
    (part: { inlineData?: { data?: string }; inline_data?: { data?: string } }) => part.inlineData?.data || part.inline_data?.data
  );
  const imageData = inline?.inlineData?.data || inline?.inline_data?.data;

  return {
    prompt: fallback.prompt,
    image: imageData ? `data:image/png;base64,${imageData}` : fallback.image,
    imageAlt: fallback.imageAlt
  };
}

export function buildVideoPrompt(post: BlogPost) {
  return {
    provider: 'runway',
    prompt:
      `Crie um video editorial curto, 8 segundos, sem texto na tela, em estilo tecnologico premium. Tema: ${post.title}. ` +
      `Mostrar desenvolvimento de software, IA, infraestrutura e interfaces modernas. Movimento suave de camera, luz escura, realista.`,
    note:
      'Este prompt esta pronto para Runway, Google Veo, Pika ou outro gerador de video. A chamada direta de video pode ser conectada quando houver chave e creditos da API escolhida.'
  };
}
