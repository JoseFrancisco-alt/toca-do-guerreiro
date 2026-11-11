/* Toca do Guerreiro — home */
(() => {
  const T = window.TOCA, $ = window.$, $$ = window.$$;
  const ORDEM = ['kids', 'feminino', 'adulto'];
  const COR = { kids: 'f-amarela', feminino: 'f-roxa', adulto: 'f-azul' };
  const IDADE = { kids: '4 a 13 anos', feminino: 'só mulheres', adulto: 'a partir de 14' };
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const link = (u, m, d, h) => `agendar.html?unidade=${u}&mod=${m}&dia=${T.iso(d)}&hora=${h}`;

  /* ---------- próximas aulas com vaga ---------- */
  const falta = t => { const m = Math.max(1, Math.round((t - Date.now()) / 6e4)); return 'começa em ' + (m < 60 ? m + ' min' : Math.floor(m / 60) + 'h' + String(m % 60).padStart(2, '0')); };
  const lista = $('#proximas');
  const pinta = () => {
    const achadas = [];
    for (let k = 0; k < 8 && achadas.length < 12; k++) {
      const d = new Date(hoje); d.setDate(d.getDate() + k);
      for (const u in T.GRADE) for (const m of ORDEM) {
        (T.GRADE[u][m][d.getDay()] || []).forEach((h, i) => {
          if (T.passou(d, h)) return;
          const v = T.vagas(h, d, i);
          if (v > 0) achadas.push({ u, m, d, h, v, t: d.getTime() + parseInt(h) * 36e5 + parseInt(h.slice(3)) * 6e4 });
        });
      }
    }
    achadas.sort((a, b) => a.t - b.t);
    // até 5 aulas, sem repetir a mesma turma na mesma unidade
    const vistos = new Set(), mostrar = [];
    for (const a of achadas) { const c = a.u + a.m; if (!vistos.has(c)) { vistos.add(c); mostrar.push(a); } if (mostrar.length === 5) break; }
    lista.innerHTML = mostrar.map(a => {
      const eHoje = a.d.getTime() === hoje.getTime();
      const amanha = a.d.getTime() === hoje.getTime() + 864e5;
      return `<li><a href="${link(a.u, a.m, a.d, a.h)}">
        <span class="prox-dia${eHoje ? ' hoje' : ''}">${eHoje ? 'hoje' : amanha ? 'amanhã' : T.WD[a.d.getDay()]}<b>${a.d.getDate()}</b></span>
        <span class="prox-info"><strong>${T.MODS[a.m]}</strong><span>${T.UNITS[a.u].nome} · ${eHoje ? `<span class="prox-agora">${falta(a.t)}</span>` : IDADE[a.m]}</span></span>
        <span><span class="prox-hora">${a.h}</span><span class="prox-vagas">${a.v} vaga${a.v > 1 ? 's' : ''}</span></span>
      </a></li>`;
    }).join('');
  };
  if (lista) { pinta(); setInterval(pinta, 60000); }

  /* ---------- "quando" de cada turma, tirado da grade ---------- */
  const juntar = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1];
  $$('[data-quando]').forEach(dd => {
    const m = dd.dataset.quando;
    dd.innerHTML = Object.keys(T.GRADE).map(u => {
      const g = T.GRADE[u][m], dias = Object.keys(g).map(Number).sort();
      const horas = [...new Set(dias.flatMap(d => g[d]))].sort();
      const diasTxt = dias.join() === '1,2,3,4,5,6' ? 'seg a sáb' : juntar(dias.map(d => T.WD[d]));
      let horasTxt = juntar(horas);
      if (horas.length > 2) horasTxt = 'manhã (' + horas.filter(h => h < '12').join(', ') + ') e noite';
      return `<span><b>${T.UNITS[u].nome}:</b> ${diasTxt} · ${horasTxt}</span>`;
    }).join('');
  });

  /* ---------- primeira aula ---------- */
  const PARTES = [
    { de: 0, ate: 10, t: 'Chegada', p: 'Você chega, a recepção empresta o kimono e o professor se apresenta. Ele pergunta se você tem alguma lesão e mostra onde trocar de roupa.', d: 'Avise que é sua primeira aula. Todo mundo vai querer ajudar.' },
    { de: 10, ate: 25, t: 'Aquecimento', p: 'Corrida leve, alongamento e movimentos do jiu-jitsu, como rolamento e fuga de quadril. Ninguém está avaliando você.', d: 'Cansou? Para, respira e volta. Todo mundo já passou por isso.' },
    { de: 25, ate: 45, t: 'Técnica', p: 'O professor mostra uma técnica por partes. Depois você repete com um parceiro mais experiente, devagar, quantas vezes precisar.', d: 'Errar faz parte. O parceiro graduado está ali pra corrigir você.' },
    { de: 45, ate: 55, t: 'Treino', p: 'A turma faz o treino livre. Na primeira aula você faz um treino leve, começando de uma posição combinada e com o professor ao lado.', d: 'Bateu, parou. Bata cedo e sem vergonha.' },
    { de: 55, ate: 60, t: 'Fim', p: 'A turma se alinha por faixa, cumprimenta e fecha com um Oss. Depois você conversa com o professor sobre horários e planos, sem pressão.', d: 'Tire suas dúvidas nessa hora. É o melhor momento.' }
  ];
  const quadro = $('#aulaQuadro');
  const mostraParte = i => {
    const x = PARTES[i];
    quadro.innerHTML = `<div class="aula-relogio">${x.de}'–${x.ate}'<small>minutos de aula</small></div>
      <div><h3>${x.t}</h3><p>${x.p}</p></div>
      <div class="aula-dica"><small>Dica do professor</small><p>${x.d}</p></div>`;
  };
  if (quadro) {
    const abas = $$('#aulaBarra button'), play = $('#aulaPlay'), txt = $('#aulaPlayTxt'), fill = $('#aulaFill'), min = $('#aulaMin');
    const DUR = 20000; let raf = 0, parte = 0;
    const escolhe = i => { parte = i; abas.forEach((b, k) => b.setAttribute('aria-selected', k === i)); mostraParte(i); };
    const para = fim => {
      cancelAnimationFrame(raf); raf = 0; play.classList.remove('rodando');
      txt.textContent = fim ? 'Assistir de novo' : 'Simular a aula em 20 segundos';
      if (!fim) { fill.style.width = 0; min.textContent = ''; }
    };
    const roda = () => {
      const t0 = performance.now(); play.classList.add('rodando'); txt.textContent = 'Parar'; escolhe(0);
      const passo = now => {
        const m = Math.min(60, (now - t0) / DUR * 60);
        fill.style.width = m / 60 * 100 + '%';
        min.textContent = `Minuto ${Math.floor(m)} de 60`;
        const i = PARTES.findIndex(x => m < x.ate);
        if (i >= 0 && i !== parte) escolhe(i);
        if (m < 60) raf = requestAnimationFrame(passo); else { para(true); min.textContent = 'Oss! Aula concluída.'; }
      };
      raf = requestAnimationFrame(passo);
    };
    play.addEventListener('click', () => raf ? para(false) : roda());
    window.tabs($('#aulaBarra'), 'aria-selected', d => { if (raf) para(false); parte = +d.p; mostraParte(parte); });
    mostraParte(0);
  }

  /* ---------- o que levar (salvo no aparelho) ---------- */
  const CH = 'toca-levar';
  let marcados = [];
  try { marcados = JSON.parse(localStorage.getItem(CH) || '[]'); } catch {}
  $$('#levar input').forEach(i => {
    i.checked = marcados.includes(i.value);
    i.addEventListener('change', () => {
      const v = $$('#levar input:checked').map(x => x.value);
      try { localStorage.setItem(CH, JSON.stringify(v)); } catch {}
    });
  });

  /* ---------- faixas ---------- */
  const FAIXAS = {
    adulto: [
      { c: 'branca', n: 'Branca', idade: 'Qualquer idade', tempo: '1 a 2 anos', ap: 'Cair sem se machucar, sair de baixo, manter a guarda e as posições básicas.', fr: 'A faixa de quem está aprendendo a se defender. Todo mundo começa nela.' },
      { c: 'azul', n: 'Azul', idade: 'A partir de 16 anos', tempo: '2 a 3 anos', ap: 'Guardas, passagens e as primeiras finalizações encadeadas.', fr: 'Você já se defende bem e começa a ter um jogo seu.' },
      { c: 'roxa', n: 'Roxa', idade: 'A partir de 16 anos', tempo: '2 a 3 anos', ap: 'Combinações, transições e ajudar os mais novos no treino.', fr: 'O meio do caminho: técnica com estratégia.' },
      { c: 'marrom', n: 'Marrom', idade: 'A partir de 18 anos', tempo: '1 a 2 anos', ap: 'Detalhes, pressão e o tempo certo de cada movimento.', fr: 'Menos força, mais precisão.' },
      { c: 'preta', n: 'Preta', idade: 'A partir de 19 anos', tempo: 'Em média 10 anos de treino até aqui', ap: 'Domínio dos fundamentos e capacidade de ensinar. A preta tem graus próprios, que levam anos.', fr: 'Não é o fim. Muitos dizem que é quando o jiu-jitsu começa de verdade.' }
    ],
    kids: [
      { c: 'branca', n: 'Branca', idade: 'A partir de 4 anos', tempo: 'Primeiros meses', ap: 'Rolamentos, quedas seguras e as regras do tatame.', fr: 'A criança aprende a cair, a esperar a vez e a respeitar o parceiro.' },
      { c: 'cinza', n: 'Cinza', idade: '4 a 15 anos', tempo: 'Cerca de 1 ano', ap: 'As primeiras posições: guarda, montada e saídas.', fr: 'A primeira conquista. Costuma ser um dia de festa em casa.' },
      { c: 'amarela', n: 'Amarela', idade: '7 a 15 anos', tempo: 'Cerca de 1 ano', ap: 'Raspagens e passagens simples, sempre com controle.', fr: 'Mais confiança e mais vontade de competir.' },
      { c: 'laranja', n: 'Laranja', idade: '10 a 15 anos', tempo: 'Cerca de 1 ano', ap: 'Combinações e treino com mais intensidade.', fr: 'A criança começa a ajudar os menores.' },
      { c: 'verde', n: 'Verde', idade: '13 a 15 anos', tempo: 'Até os 16 anos', ap: 'Preparação para a faixa azul do adulto.', fr: 'A ponte entre o Kids e a turma adulta.' }
    ]
  };
  const PONT = c => c === 'preta' ? 'var(--vermelho)' : 'var(--f-preta)';
  let tipo = 'adulto', atual = FAIXAS.adulto[0], graus = 0;
  const grande = $('#faixaGrande'), grausEl = $('#faixaGraus'), info = $('#faixaInfo'), cores = $('#faixasCores');
  const pintaGraus = () => { grausEl.innerHTML = '<i></i>'.repeat(graus); };
  let pronto = false;
  const mostraFaixa = f => {
    if (pronto && document.startViewTransition && !matchMedia('(prefers-reduced-motion:reduce)').matches) document.startViewTransition(() => pintaFaixa(f));
    else pintaFaixa(f);
  };
  const pintaFaixa = f => {
    atual = f;
    grande.className = `faixa faixa-grande f-${f.c}`;
    info.innerHTML = `<h3>Faixa ${f.n.toLowerCase()}</h3><p class="fi-frase">${f.fr}</p>
      <dl><div><dt>Idade</dt><dd>${f.idade}</dd></div><div><dt>Tempo médio na faixa</dt><dd>${f.tempo}</dd></div>
      <div style="grid-column:1/-1"><dt>O que você aprende</dt><dd>${f.ap}</dd></div></dl>`;
  };
  const montaCores = () => {
    cores.innerHTML = FAIXAS[tipo].map((f, i) =>
      `<button role="tab" aria-selected="${i === 0}" data-i="${i}"><i style="--cor:var(--f-${f.c});--pont:${PONT(f.c)}"></i><span>${f.n}<small>${f.idade}</small></span></button>`).join('');
    mostraFaixa(FAIXAS[tipo][0]);
  };
  if (grande) {
    window.tabs(cores, 'aria-selected', d => mostraFaixa(FAIXAS[tipo][+d.i]));
    window.tabs($('#faixasTipo'), 'aria-selected', d => { tipo = d.t; montaCores(); });
    window.tabs($('#grausCtrl'), 'aria-pressed', d => { graus = +d.g; pintaGraus(); });
    montaCores(); pintaGraus(); pronto = true;
  }

  /* ---------- glossário ---------- */
  const busca = $('#glossBusca');
  if (busca) {
    const sem = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const itens = $$('#glossario > div');
    busca.addEventListener('input', () => {
      const q = sem(busca.value.trim()); let n = 0;
      itens.forEach(it => { const ok = !q || sem(it.textContent).includes(q); it.hidden = !ok; if (ok) n++; });
      $('#glossario').classList.toggle('filtrado', !!q);
      $('#glossVazio').hidden = n > 0;
    });
  }

  /* ---------- grade de horários ---------- */
  const grade = $('#grade');
  if (grade) {
    const DIAS = [1, 2, 3, 4, 5, 6], wd = new Date().getDay();
    const proximo = (dia, h) => {
      const d = new Date(hoje); let k = (dia - d.getDay() + 7) % 7;
      if (k === 0 && T.passou(d, h)) k = 7;
      d.setDate(d.getDate() + k); return d;
    };
    const desenha = u => {
      const g = T.GRADE[u];
      let h = '<caption class="sr">Horários da unidade ' + T.UNITS[u].nome + '</caption><thead><tr><th scope="col"><span class="sr">Turma</span></th>' +
        DIAS.map(d => `<th scope="col"${d === wd ? ' class="hoje"' : ''}>${T.WD[d]}${d === wd ? '<small>hoje</small>' : ''}</th>`).join('') + '</tr></thead><tbody>';
      for (const m of ORDEM) {
        h += `<tr><th scope="row" class="${COR[m]}"><i></i><b>${T.MODS[m]}</b><small>${IDADE[m]}</small></th>` +
          DIAS.map(d => `<td${d === wd ? ' class="hoje"' : ''}>${(g[m][d] || []).map(x => `<a href="${link(u, m, proximo(d, x), x)}" aria-label="Agendar ${T.MODS[m]} ${T.WDF[d]} às ${x}">${x}</a>`).join('') || '<span class="vazio">—</span>'}</td>`).join('') + '</tr>';
      }
      grade.innerHTML = h + '</tbody>';
      // versão do celular: um bloco por dia, começando por hoje
      const ord = [...DIAS.filter(d => d >= wd), ...DIAS.filter(d => d < wd)];
      $('#gradeCel').innerHTML = ord.map(d => {
        const aulas = ORDEM.flatMap(m => (g[m][d] || []).map(x => ({ m, x }))).sort((a, b) => a.x.localeCompare(b.x));
        return `<li${d === wd ? ' class="hoje"' : ''}><h4>${T.WDF[d]}${d === wd ? ' <small>hoje</small>' : ''}</h4><div>` +
          aulas.map(a => `<a href="${link(u, a.m, proximo(d, a.x), a.x)}" class="${COR[a.m]}"><b>${a.x}</b>${T.MODS[a.m]}</a>`).join('') + '</div></li>';
      }).join('');
    };
    window.tabs($('#gradeUnid'), 'aria-selected', d => desenha(d.u));
    desenha('cruzeiro');
  }

  /* ---------- quanto tempo até a sua faixa ---------- */
  const simV = $('#simVezes');
  if (simV) {
    // meses em cada faixa treinando 3x por semana, e o mínimo que a graduação costuma exigir
    const ETAPAS = [{ c: 'branca', n: 'Branca', m: 24, min: 12 }, { c: 'azul', n: 'Azul', m: 30, min: 24 }, { c: 'roxa', n: 'Roxa', m: 30, min: 18 }, { c: 'marrom', n: 'Marrom', m: 24, min: 12 }];
    const ALVO = ['', 'azul', 'roxa', 'marrom', 'preta'];
    const RITMO = { 1: 1.8, 2: 1.3, 3: 1, 4: .85, 5: .75, 6: .7 };
    const FRASE = {
      1: 'Uma vez por semana já tira você do sofá. Com duas, a evolução muda de figura.',
      2: 'Duas vezes por semana é o mínimo pra evoluir com constância.',
      3: 'Três vezes por semana é o ritmo da maioria dos alunos da Toca.',
      4: 'Quatro treinos por semana: você vai sentir a diferença em poucos meses.',
      5: 'Ritmo de competidor. Não esqueça de descansar.',
      6: 'Ritmo de atleta. Descanso e alimentação viram parte do treino.'
    };
    const tempo = m => {
      const a = Math.round(m / 6) / 2;
      if (a < 1) return Math.round(m) + ' meses';
      const i = Math.floor(a), meio = a % 1 ? ' e meio' : '';
      return i + (i > 1 ? ' anos' : ' ano') + meio;
    };
    let alvo = 1;
    const calc = () => {
      const v = +simV.value, et = ETAPAS.slice(0, alvo).map(e => ({ ...e, t: Math.max(e.min, e.m * RITMO[v]) }));
      const total = et.reduce((s, e) => s + e.t, 0);
      $('#simVezesTxt').textContent = v + (v > 1 ? ' vezes' : ' vez');
      $('#simNum').innerHTML = `Cerca de ${tempo(total)}<small>ou umas ${Math.round(total * 4.33 * v / 10) * 10} aulas</small>`;
      $('#simFrase').textContent = FRASE[v];
      const linha = $('#simLinha');
      if (linha.children.length !== et.length + 1) linha.innerHTML = et.map(e => `<div class="sim-seg f-${e.c}"><span></span></div>`).join('') + '<div class="sim-fim"></div>';
      et.forEach((e, i) => { const s = linha.children[i]; s.style.flex = e.t + ' 1 0'; s.firstChild.innerHTML = `<b>${e.n}</b>${tempo(e.t)}`; });
      linha.lastChild.className = 'sim-fim f-' + ALVO[alvo];
    };
    simV.addEventListener('input', calc);
    window.tabs($('#simAlvo'), 'aria-selected', d => { alvo = +d.a; calc(); });
    calc();
  }

  /* ---------- faixa de progresso do topo ---------- */
  const cinto = $('#cinto');
  if (cinto) {
    const secs = $$('[data-faixa]'), cg = $('#cintoGraus'); let cor = 'branca', gr = 0;
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      cinto.style.width = Math.min(100, scrollY / max * 100) + '%';
      const ref = scrollY + innerHeight * .4;
      let at = secs[0];
      for (const s of secs) if (s.offsetTop <= ref) at = s;
      const f = at.dataset.faixa, grupo = secs.filter(s => s.dataset.faixa === f);
      const ini = grupo[0].offsetTop, ult = grupo[grupo.length - 1], fim = ult.offsetTop + ult.offsetHeight;
      const g = Math.max(0, Math.min(4, Math.floor((ref - ini) / (fim - ini) * 5)));
      if (f !== cor) { cinto.className = 'f-' + f; cor = f; }
      if (g !== gr) { cg.innerHTML = '<u></u>'.repeat(g); gr = g; }
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  /* ---------- números que contam ---------- */
  const semMov = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!semMov && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const b = e.target, ate = +b.dataset.count, suf = b.dataset.suf || ''; let n = 0;
      const passo = () => { n++; b.textContent = n + suf; if (n < ate) setTimeout(passo, 150); };
      b.textContent = '0' + suf; setTimeout(passo, 150);
    }), { threshold: .6 });
    $$('[data-count]').forEach(b => io.observe(b));
  }

  /* ---------- botões principais puxam para o mouse ---------- */
  if (!semMov && matchMedia('(hover:hover) and (pointer:fine)').matches) $$('.btn-lg').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * .22}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
    });
    b.addEventListener('mouseleave', () => b.style.translate = '');
  });

  /* ---------- alavanca: mover o apoio muda a força ---------- */
  const alav = $('#alavRange');
  if (alav) {
    const PESO = 90, X_PESO = 45, X_VOCE = 348;
    const calc = () => {
      const f = +alav.value, kg = Math.round(PESO * (f - X_PESO) / (X_VOCE - f));
      $('#alavApoio').setAttribute('transform', `translate(${f} 0)`);
      $('#alavBarra').setAttribute('transform', `rotate(4 ${f} 130)`);
      $('#alavSeta').setAttribute('y1', 84 - (12 + kg * .55));
      $('#alavVoce').setAttribute('y', 84 - (12 + kg * .55) - 10);
      $('#alavKg').textContent = kg + ' kg';
    };
    alav.addEventListener('input', calc); calc();
  }

  /* ---------- bateu, parou: três toques e o parceiro solta ---------- */
  const bate = $('#bateBtn');
  if (bate) {
    const pts = $$('.bate-pontos i', bate), txt = $('#bateTxt'); let n = 0, t = 0;
    const zera = () => { n = 0; pts.forEach(p => p.classList.remove('on')); bate.classList.remove('soltou'); txt.textContent = 'Bata 3 vezes aqui'; };
    bate.addEventListener('click', () => {
      clearTimeout(t);
      if (n >= 3) return zera();
      pts[n++].classList.add('on');
      if (n === 3) { bate.classList.add('soltou'); txt.textContent = 'Soltou na hora. É assim no tatame.'; t = setTimeout(zera, 3500); }
      else { txt.textContent = n === 1 ? 'Mais duas' : 'Mais uma'; t = setTimeout(zera, 2500); }
    });
  }
})();
