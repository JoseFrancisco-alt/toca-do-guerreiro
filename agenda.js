/* Agendamento — protótipo visual, nada é enviado */
(() => {
  const T = window.TOCA, $ = window.$, $$ = window.$$;
  const q = new URLSearchParams(location.search);
  const st = { unit: null, mod: null, date: null, hora: null, step: 1 };

  const origem = T.ORIGENS[q.get('origem')];
  if (origem) { const o = $('#origin'); o.hidden = false; o.textContent = 'Você chegou pelo ' + origem + '.'; }

  const show = (n, quiet) => {
    $$('.panel').forEach(p => p.classList.toggle('active', +p.dataset.panel === n));
    $$('#steps li').forEach(li => { const s = +li.dataset.step; li.classList.toggle('active', s === n); li.classList.toggle('done', s < n); });
    $('#progress').style.width = Math.min(100, (n - 1) * 25) + '%';
    st.step = n;
    if (!quiet && innerWidth < 900) window.goTo($('#wizard'));
  };
  const mark = b => $$('.choice', b.parentNode).forEach(x => x.classList.toggle('sel', x === b));
  const next = () => show(!st.unit ? 1 : !st.mod ? 2 : 3);

  $$('[data-panel="1"] .choice').forEach(b => b.addEventListener('click', () => {
    st.unit = b.dataset.unit; mark(b); if (st.mod) buildDays(); setTimeout(next, 180);
  }));
  $$('[data-panel="2"] .choice').forEach(b => b.addEventListener('click', () => {
    st.mod = b.dataset.mod; mark(b); if (st.unit) buildDays(); setTimeout(next, 180);
  }));
  $$('[data-back]').forEach(b => b.addEventListener('click', () => show(Math.max(1, st.step - 1))));

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const horasLivres = d => (T.GRADE[st.unit][st.mod][d.getDay()] || []).filter(h => !T.passou(d, h));

  function buildDays(preDia) {
    const box = $('#days'); box.innerHTML = ''; st.date = null;
    $('#slots').innerHTML = '<p class="hint">Escolha um dia acima.</p>';
    for (let i = 0; i < 14; i++) {
      const d = new Date(hoje); d.setDate(d.getDate() + i);
      const hrs = horasLivres(d);
      const btn = document.createElement('button');
      btn.className = 'day' + (i === 0 ? ' hoje' : ''); btn.disabled = !hrs.length; btn.type = 'button';
      btn.innerHTML = `<small>${i === 0 ? 'hoje' : T.WD[d.getDay()]}</small><b>${d.getDate()}</b><i>${hrs.length ? hrs.length + (hrs.length > 1 ? ' horários' : ' horário') : 'sem aula'}</i>`;
      btn.addEventListener('click', () => { $$('.day').forEach(x => x.classList.toggle('sel', x === btn)); st.date = d; buildSlots(d); });
      box.appendChild(btn);
      if (preDia && T.iso(d) === preDia && hrs.length) { btn.classList.add('sel'); st.date = d; }
    }
    if (st.date) buildSlots(st.date);
  }
  function buildSlots(d, preHora) {
    const box = $('#slots'); box.innerHTML = '';
    const todas = T.GRADE[st.unit][st.mod][d.getDay()] || [];
    todas.forEach((h, i) => {
      if (T.passou(d, h)) return;
      const vagas = T.vagas(h, d, i);
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'slot' + (vagas === 0 ? ' full' : '') + (h === preHora && vagas ? ' pre' : '');
      b.innerHTML = `${h}<small>${vagas === 0 ? 'lotado' : vagas + (vagas > 1 ? ' vagas' : ' vaga')}</small>`;
      b.addEventListener('click', () => { st.hora = h; fillSummary(); show(4); });
      box.appendChild(b);
    });
  }
  const dataFmt = d => `${T.WDF[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  function fillSummary() {
    $('#summary').innerHTML = `<span>Unidade <b>${T.UNITS[st.unit].nome}</b></span><span>Turma <b>${T.MODS[st.mod]}</b></span><span>Dia <b>${dataFmt(st.date)}</b> às <b>${st.hora}</b></span>`;
    $('.kid-only').hidden = st.mod !== 'kids';
  }

  // pré-seleção vinda do site (?unidade= &mod= &dia= &hora=)
  const pu = q.get('unidade'), pm = q.get('mod'), pd = q.get('dia'), ph = q.get('hora');
  if (T.UNITS[pu]) { st.unit = pu; mark($(`[data-unit="${pu}"]`)); }
  if (T.MODS[pm]) { st.mod = pm; mark($(`[data-panel="2"] [data-mod="${pm}"]`)); }
  if (st.unit && st.mod) {
    buildDays(pd);
    if (st.date && ph) buildSlots(st.date, ph);
  }
  show(!st.unit ? 1 : !st.mod ? 2 : 3, true);

  const zap = $('input[name="zap"]');
  zap.addEventListener('input', () => {
    const v = zap.value.replace(/\D/g, '').slice(0, 11); let o = v;
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
    if (!ok) { f.querySelector('.err').focus(); return; }
    const nome = f.nome.value.trim().split(' ')[0];
    $('#doneText').innerHTML = `${nome}, sua aula de <b>${T.MODS[st.mod]}</b> no <b>${T.UNITS[st.unit].nome}</b> ficou para <b>${dataFmt(st.date)} às ${st.hora}</b>. A confirmação já foi para o seu WhatsApp.`;
    show(5);
    $('#phonePreview').hidden = false;
    const s = window.chatScripts({ nome, unidade: T.UNITS[st.unit].nome, mod: T.MODS[st.mod], data: dataFmt(st.date), hora: st.hora, crianca: f.crianca.value.trim() });
    window.playChat($('#chatAluno'), s.aluno.slice(0, 1));
  });

  $('#calBtn').addEventListener('click', () => {
    const [hh, mm] = st.hora.split(':').map(Number);
    const inicio = new Date(st.date); inicio.setHours(hh, mm, 0, 0);
    window.baixarIcs({
      titulo: `Aula experimental de jiu-jitsu (${T.MODS[st.mod]})`,
      inicio, local: `Toca do Guerreiro - ${T.UNITS[st.unit].end}`,
      descricao: 'Leve roupa leve\\, água e chinelo. Chegue 10 min antes. Kimono emprestado.'
    });
  });
})();
