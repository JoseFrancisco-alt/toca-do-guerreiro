/* Toca do Guerreiro — protótipo visual (sem back-end) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const SITE = 'https://josefrancisco-alt.github.io/toca-do-guerreiro/';

  /* ---------- LOADER ---------- */
  document.body.classList.add('loading');
  const fill = $('#loaderFill'), num = $('#loaderNum');
  let p = 0;
  const tick = () => {
    p = Math.min(100, p + Math.random() * 9 + 3);
    fill.style.width = p + '%';
    num.textContent = String(Math.floor(p)).padStart(3, '0');
    if (p < 100) setTimeout(tick, 60);
    else setTimeout(() => {
      $('#loader').classList.add('out');
      document.body.classList.remove('loading');
      document.body.classList.add('ready');
      setTimeout(() => $('#loader').remove(), 1100);
    }, 250);
  };
  tick();

  /* ---------- LENIS ---------- */
  let lenis;
  if (window.Lenis && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    lenis = new Lenis({ lerp: 0.09 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const goTo = target => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    lenis ? lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView({ behavior: 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) { e.preventDefault(); closeMenu(); goTo(id); }
  }));

  /* ---------- CURSOR ---------- */
  if (fine) {
    const c = $('#cursor'), d = $('#cursorDot'), lbl = $('#cursorLabel');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; d.style.transform = `translate(${x}px,${y}px)`; });
    const loop = () => { cx += (x - cx) * .16; cy += (y - cy) * .16; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) { lbl.textContent = t.dataset.cursor; c.classList.add('big'); }
    });
    document.addEventListener('mouseout', e => {
      const t = e.target.closest('[data-cursor]');
      if (t && !t.contains(e.relatedTarget)) c.classList.remove('big');
    });
  }

  /* ---------- MAGNETIC ---------- */
  if (fine) $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });

  /* ---------- TILT ---------- */
  if (fine) $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - .5) * -8;
      const ry = ((e.clientX - r.left) / r.width - .5) * 10;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });

  /* ---------- NAV ---------- */
  const nav = $('#nav'); let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hide', y > lastY && y > 400 && !$('#mobileMenu').classList.contains('open'));
    lastY = y;
    const em = $('#heroEmblem');
    if (em && y < innerHeight * 1.2) em.style.rotate = (y * .08) + 'deg';
  }, { passive: true });
  const tog = $('#navToggle'), menu = $('#mobileMenu');
  function closeMenu() { tog.classList.remove('open'); menu.classList.remove('open'); }
  tog.addEventListener('click', () => { tog.classList.toggle('open'); menu.classList.toggle('open'); });

  /* ---------- REVEAL + CONTADORES ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    const b = e.target.querySelector('[data-count]');
    if (b) {
      const to = +b.dataset.count, suf = b.dataset.suffix || ''; let n = 0;
      const step = () => { n++; b.textContent = n + suf; if (n < to) setTimeout(step, 140); };
      step();
    }
  }), { threshold: .15 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });

  /* ---------- DADOS MOCK ---------- */
  const UNITS = {
    cruzeiro: { nome: 'Cruzeiro', end: 'CT Cruzeiro (endereço ilustrativo)' },
    santalucia: { nome: 'Santa Lúcia', end: 'Filial Santa Lúcia (endereço ilustrativo)' }
  };
  const MODS = { kids: 'Kids', feminino: 'Feminino', adulto: 'Adulto' };
  // 0=dom ... 6=sáb  → horários ilustrativos
  const GRADE = {
    cruzeiro: {
      kids: { 1: ['17:30'], 3: ['17:30'], 5: ['17:30'] },
      feminino: { 2: ['19:00'], 4: ['19:00'] },
      adulto: { 1: ['06:30', '19:30', '20:40'], 2: ['06:30', '20:40'], 3: ['06:30', '19:30', '20:40'], 4: ['06:30', '20:40'], 5: ['06:30', '19:30'], 6: ['09:00'] }
    },
    santalucia: {
      kids: { 2: ['17:00'], 4: ['17:00'] },
      feminino: { 1: ['18:30'], 3: ['18:30'] },
      adulto: { 1: ['07:00', '19:00'], 2: ['19:00', '20:15'], 3: ['07:00', '19:00'], 4: ['19:00', '20:15'], 5: ['07:00', '19:00'], 6: ['10:00'] }
    }
  };
  const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const WDF = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  /* ---------- ORIGEM (QR / bio) ---------- */
  const ORIGENS = { balcao: 'QR do balcão', aulao: 'QR do aulão / panfleto', instagram: 'Link da bio do Instagram' };
  const origem = new URLSearchParams(location.search).get('origem');
  const origemTxt = ORIGENS[origem] || 'Site';
  if (ORIGENS[origem]) { const o = $('#origin'); o.hidden = false; o.textContent = '● Você chegou pelo ' + ORIGENS[origem]; }

  /* ---------- WIZARD ---------- */
  const st = { unit: null, mod: null, date: null, hora: null };
  const show = n => {
    $$('.panel').forEach(p => p.classList.toggle('active', +p.dataset.panel === n));
    $$('#steps li').forEach(li => {
      const s = +li.dataset.step;
      li.classList.toggle('active', s === n);
      li.classList.toggle('done', s < n);
    });
    st.step = n;
  };
  show(1);

  $$('[data-panel="1"] .choice').forEach(b => b.addEventListener('click', () => {
    st.unit = b.dataset.unit; mark(b); setTimeout(() => show(st.mod ? 3 : 2), 220);
    if (st.mod) buildDays();
  }));
  $$('[data-panel="2"] .choice').forEach(b => b.addEventListener('click', () => {
    st.mod = b.dataset.mod; mark(b); buildDays(); setTimeout(() => show(3), 220);
  }));
  $$('[data-back]').forEach(b => b.addEventListener('click', () => show(Math.max(1, st.step - 1))));
  function mark(b) { $$('.choice', b.parentNode).forEach(x => x.classList.toggle('sel', x === b)); }

  // atalhos pelos cards de modalidade
  $$('.card-link').forEach(a => a.addEventListener('click', () => {
    st.mod = a.dataset.mod;
    mark($(`[data-panel="2"] [data-mod="${st.mod}"]`));
    if (!st.unit) show(1); else { buildDays(); show(3); }
  }));

  function buildDays() {
    const box = $('#days'); box.innerHTML = '';
    $('#slots').innerHTML = '<p class="hint">Selecione um dia acima.</p>';
    const g = GRADE[st.unit][st.mod];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const hrs = g[d.getDay()];
      const btn = document.createElement('button');
      btn.className = 'day'; btn.disabled = !hrs;
      btn.innerHTML = `<small>${WD[d.getDay()]}</small><b>${d.getDate()}</b><i>${hrs ? hrs.length + ' hor.' : '—'}</i>`;
      btn.addEventListener('click', () => {
        $$('.day').forEach(x => x.classList.toggle('sel', x === btn));
        st.date = d; buildSlots(hrs);
      });
      box.appendChild(btn);
    }
  }
  function buildSlots(hrs) {
    const box = $('#slots'); box.innerHTML = '';
    hrs.forEach((h, i) => {
      const vagas = (h.charCodeAt(1) + st.date.getDate() + i) % 6; // vagas fake, estáveis
      const b = document.createElement('button');
      b.className = 'slot' + (vagas === 0 ? ' full' : '');
      b.innerHTML = `${h}<small>${vagas === 0 ? 'lotado' : vagas + ' vaga' + (vagas > 1 ? 's' : '') + ' exp.'}</small>`;
      b.addEventListener('click', () => { st.hora = h; fillSummary(); show(4); });
      box.appendChild(b);
    });
  }
  const dataFmt = d => `${WDF[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  function fillSummary() {
    $('#summary').innerHTML =
      `<span>Unidade <b>${UNITS[st.unit].nome}</b></span><span>Turma <b>${MODS[st.mod]}</b></span><span><b>${dataFmt(st.date)}</b> às <b>${st.hora}</b></span>`;
    $('.kid-only').hidden = st.mod !== 'kids';
  }

  // máscara WhatsApp
  const zap = $('input[name="zap"]');
  zap.addEventListener('input', () => {
    const v = zap.value.replace(/\D/g, '').slice(0, 11);
    let o = v;
    if (v.length > 2) o = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 3) o = `(${v.slice(0, 2)}) ${v.slice(2, 3)} ${v.slice(3)}`;
    if (v.length > 7) o = `(${v.slice(0, 2)}) ${v.slice(2, 3)} ${v.slice(3, 7)}-${v.slice(7)}`;
    zap.value = o;
  });

  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target; let ok = true;
    ['nome', 'zap'].forEach(n => {
      const i = f[n]; const bad = n === 'zap' ? i.value.replace(/\D/g, '').length < 10 : i.value.trim().length < 2;
      i.classList.toggle('err', bad); if (bad) ok = false;
    });
    if (!ok) return;
    st.nome = f.nome.value.trim().split(' ')[0];
    st.full = f.nome.value.trim();
    st.crianca = f.crianca.value.trim();
    $('#doneText').innerHTML = `${st.nome}, sua aula de <b>${MODS[st.mod]}</b> no <b>${UNITS[st.unit].nome}</b> ficou pra <b>${dataFmt(st.date)} às ${st.hora}</b>. A confirmação foi pro seu WhatsApp.`;
    show(5);
    playChats(true);
  });
  $('#restart').addEventListener('click', () => {
    $('#form').reset(); $$('.choice.sel').forEach(c => c.classList.remove('sel'));
    Object.assign(st, { unit: null, mod: null, date: null, hora: null }); show(1);
  });

  /* ---------- CHATS WHATSAPP (simulação) ---------- */
  function scripts() {
    const nome = st.nome || 'Lucas';
    const u = UNITS[st.unit || 'cruzeiro'];
    const mod = MODS[st.mod || 'adulto'];
    const dt = st.date ? dataFmt(st.date) : 'quarta, 12/11';
    const h = st.hora || '19:30';
    const quem = st.crianca ? ` (${st.crianca})` : '';
    return {
      aluno: [
        { lbl: 'Confirmação · na hora', t: `Oss, ${nome}! 🥋\nSua aula experimental grátis tá confirmada:\n\n📍 ${u.nome}\n🥋 Turma ${mod}${quem}\n🗓 ${dt} às ${h}\n\nLeve roupa leve, água e chegue 10 min antes. Kimono a gente empresta.`, time: '14:02' },
        { lbl: 'Lembrete · 24h antes', t: `${nome}, amanhã é dia de tatame! ${h} no ${u.nome}.\nVai dar pra vir?`, time: '19:30', btns: ['✅ Confirmo', '🔁 Remarcar'] },
        { lbl: 'Lembrete · 2h antes', t: `Faltam 2h! 🔥\nTe esperamos às ${h}.\n📍 Como chegar: maps.app/toca-${st.unit || 'cruzeiro'}`, time: '17:30' }
      ],
      rec: [
        { lbl: 'Novo aluno', t: `🆕 Aula experimental agendada\n\n👤 ${st.full || 'Lucas Andrade'}${quem}\n📱 ${zap.value || '(82) 9 9999-9999'}\n🥋 ${mod} · ${u.nome}\n🗓 ${dt} · ${h}\n📣 Origem: ${origemTxt}`, time: '14:02' },
        { lbl: 'Presença', t: `✅ ${nome} confirmou presença pra amanhã às ${h}.`, time: '19:41' }
      ]
    };
  }
  let chatRun = 0;
  async function playChats(force) {
    const id = ++chatRun;
    const s = scripts();
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const run = async (box, list) => {
      box.innerHTML = '';
      for (const m of list) {
        if (id !== chatRun) return;
        const ty = document.createElement('div'); ty.className = 'typing'; ty.innerHTML = '<i></i><i></i><i></i>';
        box.appendChild(ty); await wait(900); ty.remove();
        if (id !== chatRun) return;
        const el = document.createElement('div'); el.className = 'msg';
        el.innerHTML = `<span class="lbl">${m.lbl}</span>${m.t.replace(/</g, '&lt;')}${m.btns ? `<div class="btns">${m.btns.map(b => `<span>${b}</span>`).join('')}</div>` : ''}<time>${m.time}</time>`;
        box.appendChild(el); requestAnimationFrame(() => el.classList.add('show'));
        await wait(1100);
      }
    };
    run($('#chatAluno'), s.aluno);
    await wait(500);
    run($('#chatRec'), s.rec);
  }
  const chatIO = new IntersectionObserver(es => {
    if (es.some(e => e.isIntersecting)) { playChats(); chatIO.disconnect(); }
  }, { threshold: .3 });
  chatIO.observe($('#automacao'));

  /* ---------- QR CODES ---------- */
  if (window.QRCode) $$('[data-qr]').forEach(el => {
    new QRCode(el, { text: SITE + '?origem=' + el.dataset.qr + '#agendar', width: 220, height: 220, colorDark: '#0a0a0b', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
  });
})();
