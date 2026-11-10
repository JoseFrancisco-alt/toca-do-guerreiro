/* Toca do Guerreiro — efeitos comuns (protótipo visual, sem back-end) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  window.$ = $; window.$$ = $$;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- LOADER (só na home) ---------- */
  const loader = $('#loader');
  if (loader) {
    document.body.classList.add('loading');
    const fill = $('#loaderFill'), num = $('#loaderNum');
    let p = 0;
    const tick = () => {
      p = Math.min(100, p + Math.random() * 9 + 3);
      fill.style.width = p + '%';
      num.textContent = String(Math.floor(p)).padStart(3, '0');
      if (p < 100) setTimeout(tick, 55);
      else setTimeout(() => {
        loader.classList.add('out');
        document.body.classList.remove('loading');
        document.body.classList.add('ready');
        setTimeout(() => loader.remove(), 1100);
      }, 220);
    };
    tick();
  } else document.body.classList.add('ready');

  /* ---------- LENIS ---------- */
  let lenis;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.09 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const goTo = el => { if (!el) return; lenis ? lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView({ behavior: 'smooth' }); };
  window.goTo = goTo;
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1 && $(id)) { e.preventDefault(); closeMenu(); goTo($(id)); }
  }));

  /* ---------- CURSOR ---------- */
  if (fine && $('#cursor')) {
    const c = $('#cursor'), d = $('#cursorDot'), lbl = $('#cursorLabel');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; d.style.transform = `translate(${x}px,${y}px)`; });
    const loop = () => { cx += (x - cx) * .16; cy += (y - cy) * .16; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('mouseover', e => { const t = e.target.closest('[data-cursor]'); if (t) { lbl.textContent = t.dataset.cursor; c.classList.add('big'); } });
    document.addEventListener('mouseout', e => { const t = e.target.closest('[data-cursor]'); if (t && !t.contains(e.relatedTarget)) c.classList.remove('big'); });
  }

  /* ---------- MAGNETIC + TILT ---------- */
  if (fine) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.transform = `perspective(900px) rotateX(${((e.clientY - r.top) / r.height - .5) * -8}deg) rotateY(${((e.clientX - r.left) / r.width - .5) * 10}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }

  /* ---------- NAV ---------- */
  const nav = $('#nav'); let lastY = 0;
  const menu = $('#mobileMenu'), tog = $('#navToggle');
  function closeMenu() { if (tog) { tog.classList.remove('open'); menu.classList.remove('open'); } }
  if (tog) tog.addEventListener('click', () => { tog.classList.toggle('open'); menu.classList.toggle('open'); });
  const floatCta = $('.float-cta');
  addEventListener('scroll', () => {
    const y = scrollY;
    if (nav) {
      nav.classList.toggle('scrolled', y > 40);
      nav.classList.toggle('hide', y > lastY && y > 400 && !(menu && menu.classList.contains('open')));
    }
    if (floatCta) floatCta.classList.toggle('show', y > innerHeight * .9 && y < document.body.scrollHeight - innerHeight * 1.6);
    lastY = y;
    const em = $('#heroEmblem');
    if (em && y < innerHeight * 1.2) em.style.rotate = (y * .08) + 'deg';
  }, { passive: true });

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
  }), { threshold: .12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });

  /* ---------- SEG BUTTONS (genérico) ---------- */
  $$('.seg').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    g.dispatchEvent(new CustomEvent('change', { detail: b.dataset }));
  }));

  /* ---------- TABELA DE HORÁRIOS (home) ---------- */
  const table = $('#schedTable');
  if (table && window.TOCA) {
    const T = window.TOCA;
    const draw = u => {
      const g = T.GRADE[u];
      const days = [1, 2, 3, 4, 5, 6];
      let h = '<div class="sched-row head"><span></span>' + days.map(d => `<span>${T.WD[d]}</span>`).join('') + '</div>';
      for (const m of ['kids', 'feminino', 'adulto']) {
        h += `<div class="sched-row"><span class="sched-mod">${T.MODS[m]}</span>` +
          days.map(d => `<span>${(g[m][d] || []).map(x => `<i>${x}</i>`).join('') || '<em>—</em>'}</span>`).join('') + '</div>';
      }
      table.innerHTML = h;
      table.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.16,1,.3,1)' });
    };
    draw('cruzeiro');
    $('#schedTabs').addEventListener('change', e => draw(e.detail.u));
  }

  /* ---------- PLAYER DE CHAT WHATSAPP ---------- */
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
        { lbl: 'Confirmação · na hora', t: `Oss, ${nome}! 🥋\nSua aula experimental grátis tá confirmada:\n\n📍 ${u}\n🥋 Turma ${mod}${quem}\n🗓 ${dt} às ${h}\n\nLeve roupa leve, água e chegue 10 min antes. Kimono a gente empresta.`, time: '14:02' },
        { lbl: 'Lembrete · 24h antes', t: `${nome}, amanhã é dia de tatame! ${h} no ${u}.\nVai dar pra vir?`, time: '19:30', btns: ['✅ Confirmo', '🔁 Remarcar'] },
        { lbl: 'Lembrete · 2h antes', t: `Faltam 2h! 🔥\nTe esperamos às ${h}.\n📍 Como chegar: toque aqui pro mapa`, time: '17:30' }
      ],
      rec: [
        { lbl: 'Novo aluno', t: `🆕 Aula experimental agendada\n\n👤 ${o.full || 'Lucas Andrade'}${quem}\n📱 ${o.zap || '(82) 9 9999-9999'}\n🥋 ${mod} · ${u}\n🗓 ${dt} · ${h}\n📣 Origem: ${o.origem || 'QR do balcão'}`, time: '14:02' },
        { lbl: 'Presença', t: `✅ ${nome} confirmou presença pra amanhã às ${h}.`, time: '19:41' }
      ]
    };
  };

  /* ---------- QR CODES ---------- */
  if (window.QRCode && window.TOCA) $$('[data-qr]').forEach(el => {
    new QRCode(el, { text: window.TOCA.SITE + 'agendar.html?origem=' + el.dataset.qr, width: 220, height: 220, colorDark: '#0a0a0b', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
  });
})();
