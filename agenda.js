/* Agendamento — protótipo visual, nada é enviado */
(() => {
  const T = window.TOCA, $ = window.$, $$ = window.$$;
  const q = new URLSearchParams(location.search);
  const st = { unit: null, mod: null, date: null, hora: null, step: 1 };

  const origem = T.ORIGENS[q.get('origem')];
  if (origem) { const o = $('#origin'); o.hidden = false; o.textContent = '● Você veio pelo ' + origem; }

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
    st.unit = b.dataset.unit; mark(b); if (st.mod) buildDays(); setTimeout(next, 220);
  }));
  $$('[data-panel="2"] .choice').forEach(b => b.addEventListener('click', () => {
    st.mod = b.dataset.mod; mark(b); if (st.unit) buildDays(); setTimeout(next, 220);
  }));
  $$('[data-back]').forEach(b => b.addEventListener('click', () => show(Math.max(1, st.step - 1))));

  // pré-seleção vinda do site (?unidade= / ?mod=)
  const pu = q.get('unidade'), pm = q.get('mod');
  if (T.UNITS[pu]) { st.unit = pu; mark($(`[data-unit="${pu}"]`)); }
  if (T.MODS[pm]) { st.mod = pm; mark($(`[data-panel="2"] [data-mod="${pm}"]`)); }
  if (st.unit && st.mod) buildDays();
  show(!st.unit ? 1 : !st.mod ? 2 : 3, true);

  function buildDays() {
    const box = $('#days'); box.innerHTML = '';
    $('#slots').innerHTML = '<p class="hint">Selecione um dia acima.</p>';
    const g = T.GRADE[st.unit][st.mod];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const hrs = g[d.getDay()];
      const btn = document.createElement('button');
      btn.className = 'day'; btn.disabled = !hrs;
      btn.innerHTML = `<small>${T.WD[d.getDay()]}</small><b>${d.getDate()}</b><i>${hrs ? hrs.length + ' hor.' : '—'}</i>`;
      btn.addEventListener('click', () => { $$('.day').forEach(x => x.classList.toggle('sel', x === btn)); st.date = d; buildSlots(hrs); });
      box.appendChild(btn);
    }
  }
  function buildSlots(hrs) {
    const box = $('#slots'); box.innerHTML = '';
    hrs.forEach((h, i) => {
      const vagas = (h.charCodeAt(1) + st.date.getDate() + i) % 6;
      const b = document.createElement('button');
      b.className = 'slot' + (vagas === 0 ? ' full' : '');
      b.innerHTML = `${h}<small>${vagas === 0 ? 'lotado' : vagas + ' vaga' + (vagas > 1 ? 's' : '') + ' exp.'}</small>`;
      b.addEventListener('click', () => { st.hora = h; fillSummary(); show(4); });
      box.appendChild(b);
    });
  }
  const dataFmt = d => `${T.WDF[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  function fillSummary() {
    $('#summary').innerHTML = `<span>📍 <b>${T.UNITS[st.unit].nome}</b></span><span>🥋 <b>${T.MODS[st.mod]}</b></span><span>🗓 <b>${dataFmt(st.date)}</b> às <b>${st.hora}</b></span>`;
    $('.kid-only').hidden = st.mod !== 'kids';
  }

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
    if (!ok) return;
    const nome = f.nome.value.trim().split(' ')[0];
    $('#doneText').innerHTML = `${nome}, sua aula de <b>${T.MODS[st.mod]}</b> no <b>${T.UNITS[st.unit].nome}</b> ficou pra <b>${dataFmt(st.date)} às ${st.hora}</b>. A confirmação já chegou no seu WhatsApp.`;
    show(5);
    $('#phonePreview').hidden = false;
    const s = window.chatScripts({ nome, unidade: T.UNITS[st.unit].nome, mod: T.MODS[st.mod], data: dataFmt(st.date), hora: st.hora, crianca: f.crianca.value.trim() });
    window.playChat($('#chatAluno'), s.aluno.slice(0, 1));
  });

  $('#calBtn').addEventListener('click', e => e.preventDefault());
})();
