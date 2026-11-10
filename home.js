/* Home — efeitos portados do site do Manoel (cortina de cor, fonte variável,
   nome que abre, manifesto, cartões empilhando, carrossel travado) */
(() => {
  const $ = window.$, $$ = window.$$;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const clamp = v => Math.min(1, Math.max(0, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const onScroll = fn => { let t = false; addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { t = false; fn(); }); } }, { passive: true }); addEventListener('resize', fn); fn(); };

  /* cor por seção: cortina */
  {
    const THEMES = { ink: '#0a0a0b', paper: '#f1eee7', red: '#e3141b' };
    const base = $('#bgBase'), wipe = $('#bgWipe');
    let current = 'ink', lastY = scrollY, busy;
    const setTheme = t => {
      if (!t || t === current) return;
      const down = scrollY >= lastY;
      current = t; document.body.dataset.theme = t;
      clearTimeout(busy);
      wipe.className = 'bg-wipe' + (down ? '' : ' from-top');
      wipe.style.background = THEMES[t];
      void wipe.offsetWidth;
      wipe.classList.add('go');
      busy = setTimeout(() => { base.style.background = THEMES[t]; wipe.className = 'bg-wipe'; }, reduce ? 0 : 820);
    };
    addEventListener('scroll', () => requestAnimationFrame(() => (lastY = scrollY)), { passive: true });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setTheme(e.target.dataset.theme); }), { rootMargin: '-50% 0px -50% 0px' });
    $$('main [data-theme], footer[data-theme]').forEach(el => io.observe(el));
  }

  if (reduce) { $$('.mf-w').forEach(w => w.classList.add('on')); return; }

  /* títulos: fina e estreita → pesada */
  {
    const titles = $$('.title');
    onScroll(() => {
      const vh = innerHeight;
      titles.forEach(t => {
        const r = t.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const e = ease(clamp((vh * .95 - r.top) / (vh * .5)));
        t.style.setProperty('--wdth', (60 + e * 70).toFixed(1));
        t.style.setProperty('--wght', (150 + e * 750).toFixed(0));
      });
    });
  }

  /* hero: as linhas se abrem e o emblema cresce girando */
  {
    const hero = $('#xhero'), l1 = $('#heroL1'), l2 = $('#heroL2'), face = $('#heroFace');
    onScroll(() => {
      const p = clamp(scrollY / (hero.offsetHeight * .7));
      l1.style.transform = `translateX(${-p * 24}vw)`;
      l2.style.transform = `translateX(${p * 24}vw)`;
      face.style.transform = `translate(${-p * 20}vw,-50%) scale(${1 + p * .5}) rotate(${p * 70}deg)`;
    });
  }

  /* faixa entorta com a velocidade */
  {
    const mq = $('#marquee'); let last = scrollY, timer;
    addEventListener('scroll', () => {
      const v = Math.max(-12, Math.min(12, (scrollY - last) * .35));
      last = scrollY;
      mq.style.setProperty('--skew', `${-v}deg`);
      clearTimeout(timer); timer = setTimeout(() => mq.style.setProperty('--skew', '0deg'), 120);
    }, { passive: true });
  }

  /* manifesto: palavras acendem */
  {
    const sec = $('#sobre'), txt = $('#mfText');
    const wrap = node => [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { f.append(p); return; }
          const s = document.createElement('span'); s.className = 'mf-w'; s.textContent = p; f.append(s);
        });
        c.replaceWith(f);
      } else if (c.nodeType === 1) wrap(c);
    });
    wrap(txt);
    const words = $$('.mf-w', txt);
    onScroll(() => {
      const r = sec.getBoundingClientRect();
      const p = clamp((innerHeight * .3 - r.top) / (r.height - innerHeight * .9));
      const lit = Math.round(p * words.length * 1.1);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    });
  }

  /* turmas: o cartão de baixo empurra o de cima pra trás */
  {
    const cards = $$('.stack-card');
    onScroll(() => {
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const a = c.getBoundingClientRect(), b = next.getBoundingClientRect();
        const p = clamp(1 - (b.top - a.top) / a.height);
        c.style.transform = `scale(${1 - p * .06})`;
        c.style.filter = `brightness(${1 - p * .35})`;
      });
    });
  }

  /* professores: carrossel horizontal travado */
  {
    const sec = $('#professores'), track = $('#profsTrack'), bar = $('#profsBar');
    let travel = 0;
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - innerWidth);
      sec.style.setProperty('--px-h', `calc(100svh + ${travel}px)`);
    };
    const frame = () => {
      const r = sec.getBoundingClientRect();
      const span = r.height - innerHeight;
      const p = span > 0 ? clamp(-r.top / span) : 0;
      track.style.transform = `translateX(${-p * travel}px)`;
      bar.style.transform = `scaleX(${p})`;
    };
    measure();
    addEventListener('resize', measure);
    addEventListener('load', () => { measure(); frame(); });
    onScroll(frame);
  }

  /* rodapé: OSS sobe letra por letra */
  {
    const big = $('#footerBig');
    big.innerHTML = [...big.textContent].map(c => `<span class="ch">${c}</span>`).join('');
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { big.classList.add('in'); o.disconnect(); } }), { threshold: .3 }).observe(big);
  }

  /* impacto no clique (tipo batida no tatame) */
  addEventListener('pointerdown', e => {
    if (e.target.closest('input, textarea, select')) return;
    [['impact', 0], ['impact b', 60]].forEach(([cls, d]) => setTimeout(() => {
      const s = document.createElement('i'); s.className = cls;
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      document.body.append(s); setTimeout(() => s.remove(), 850);
    }, d));
  });
})();
