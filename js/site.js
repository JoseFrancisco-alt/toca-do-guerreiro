/* Toca do Guerreiro — comum às páginas do site (protótipo visual, sem back-end) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  window.$ = $; window.$$ = $$;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  window.goTo = el => el && el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });

  /* menu do celular */
  const btn = $('#menuBtn'), menu = $('#menu');
  if (btn && menu) {
    const set = open => { btn.setAttribute('aria-expanded', open); menu.classList.toggle('aberto', open); };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  /* botão fixo do celular: aparece depois da abertura e some no fim */
  const barra = $('.barra-cel');
  if (barra) addEventListener('scroll', () => {
    const y = scrollY, fim = document.body.scrollHeight - innerHeight * 1.8;
    barra.classList.toggle('ver', y > innerHeight * .8 && y < fim);
  }, { passive: true });

  /* tablists simples: marca o botão escolhido e avisa quem escuta */
  window.tabs = (box, attr, fn) => {
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || !box.contains(b)) return;
      $$('button', box).forEach(x => x.setAttribute(attr, x === b));
      fn(b.dataset);
    });
  };

  /* simulação das mensagens de WhatsApp */
  const runs = new WeakMap();
  window.playChat = async (box, list) => {
    const id = (runs.get(box) || 0) + 1; runs.set(box, id);
    const wait = ms => new Promise(r => setTimeout(r, ms));
    box.innerHTML = '';
    for (const m of list) {
      if (runs.get(box) !== id) return;
      const ty = document.createElement('div'); ty.className = 'typing'; ty.innerHTML = '<i></i><i></i><i></i>';
      box.appendChild(ty); await wait(850); ty.remove();
      if (runs.get(box) !== id) return;
      const el = document.createElement('div'); el.className = 'msg';
      el.innerHTML = `<span class="lbl">${m.lbl}</span>${m.t.replace(/</g, '&lt;')}${m.btns ? `<div class="btns">${m.btns.map(b => `<span>${b}</span>`).join('')}</div>` : ''}<time>${m.time}</time>`;
      box.appendChild(el); requestAnimationFrame(() => el.classList.add('show'));
      await wait(1000);
    }
  };
  window.chatScripts = (o = {}) => {
    const nome = o.nome || 'Lucas', u = o.unidade || 'Cruzeiro', mod = o.mod || 'Adulto';
    const dt = o.data || 'quarta, 12/11', h = o.hora || '19:30', quem = o.crianca ? ` (${o.crianca})` : '';
    return {
      aluno: [
        { lbl: 'Confirmação', t: `Oss, ${nome}!\nSua aula experimental grátis está confirmada:\n\nUnidade: ${u}\nTurma: ${mod}${quem}\nDia: ${dt} às ${h}\n\nLeve roupa leve, água e chinelo, e chegue 10 min antes. O kimono a gente empresta.`, time: '14:02' },
        { lbl: 'Lembrete · 24h antes', t: `${nome}, amanhã é dia de tatame! ${h} no ${u}.\nVai dar pra vir?`, time: '19:30', btns: ['Confirmo', 'Remarcar'] },
        { lbl: 'Lembrete · 2h antes', t: `Faltam 2h! Te esperamos às ${h}.\nToque aqui pra abrir o mapa.`, time: '17:30' }
      ]
    };
  };

  /* arquivo de calendário (.ics) com a aula marcada */
  window.baixarIcs = ({ titulo, inicio, minutos = 60, local, descricao }) => {
    const p = n => String(n).padStart(2, '0');
    const f = d => `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
    const fim = new Date(inicio.getTime() + minutos * 60000);
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Toca do Guerreiro//Aula experimental//PT', 'BEGIN:VEVENT',
      `UID:${Date.now()}@tocadoguerreiro`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(inicio)}`, `DTEND:${f(fim)}`,
      `SUMMARY:${titulo}`, `LOCATION:${local}`, `DESCRIPTION:${descricao}`,
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Aula de jiu-jitsu em 2 horas', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'aula-experimental-toca.ics';
    document.body.appendChild(a); a.click(); a.remove();
  };
})();
