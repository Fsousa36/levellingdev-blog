'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';

type Idea = {
  id: string;
  title: string;
  angle: string;
};

const starterIdeas: Idea[] = [
  {
    id: '1',
    title: 'Comparar agentes de IA no fluxo de pull request',
    angle: 'Medir tempo economizado, riscos de revisao e qualidade dos testes.'
  },
  {
    id: '2',
    title: 'Guia de prompts para tarefas pequenas',
    angle: 'Transformar pedidos vagos em criterios de aceite claros.'
  }
];

export function TopicLab() {
  const [ideas, setIdeas] = useState<Idea[]>(starterIdeas);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [angle, setAngle] = useState('');

  useEffect(() => {
    const saved = window.localStorage.getItem('levelingdev-topic-lab');

    if (saved) {
      setIdeas(JSON.parse(saved) as Idea[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('levelingdev-topic-lab', JSON.stringify(ideas));
  }, [ideas]);

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setAngle('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !angle.trim()) {
      return;
    }

    if (editingId) {
      setIdeas((current) =>
        current.map((idea) =>
          idea.id === editingId ? { ...idea, title: title.trim(), angle: angle.trim() } : idea
        )
      );
    } else {
      setIdeas((current) => [
        { id: crypto.randomUUID(), title: title.trim(), angle: angle.trim() },
        ...current
      ]);
    }

    resetForm();
  }

  function editIdea(idea: Idea) {
    setEditingId(idea.id);
    setTitle(idea.title);
    setAngle(idea.angle);
  }

  function deleteIdea(id: string) {
    setIdeas((current) => current.filter((idea) => idea.id !== id));
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <div className="grid gap-8 rounded-lg border border-white/10 bg-white/[0.035] p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Laboratorio editorial</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">CRUD local de pautas para testar ideias</h2>
          <p className="mt-4 leading-7 text-slate-300">
            Crie, edite e remova ideias de conteudo no proprio navegador. Isso deixa a home mais viva sem precisar de
            banco de dados nesta primeira fase do blog.
          </p>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Titulo da pauta"
              className="min-h-11 rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
            <input
              value={angle}
              onChange={(event) => setAngle(event.target.value)}
              placeholder="Angulo editorial"
              className="min-h-11 rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none ring-cyan/40 placeholder:text-slate-500 focus:ring-2"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan px-4 text-sm font-semibold text-ink transition hover:bg-white"
            >
              {editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Salvar' : 'Criar'}
            </button>
          </form>

          <div className="mt-5 grid gap-3">
            {ideas.map((idea) => (
              <div key={idea.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{idea.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{idea.angle}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editIdea(idea)}
                      aria-label={`Editar ${idea.title}`}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-cyan/50 hover:text-cyan"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteIdea(idea.id)}
                      aria-label={`Remover ${idea.title}`}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-red-400/60 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
