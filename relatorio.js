/* Relatório / proposta — demo de mensagens + calculadora */
(() => {
  const $ = window.$;
  const USD = 5.5;
  const brl = (v, cents) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
  const st = { plano: 'enxuto', zap: 'oficial' };

  // demo das mensagens
  const s = window.chatScripts();
  const play = () => { window.playChat($('#chatAluno'), s.aluno); setTimeout(() => window.playChat($('#chatRec'), s.rec), 600); };
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { play(); io.disconnect(); } }, { threshold: .3 });
  io.observe($('#automacao'));
  $('#replay').addEventListener('click', play);

  // calculadora
  function items(ag) {
    const msgs = ag * 4, pro = st.plano === 'pro';
    return [
      { n: 'Domínio tocadoguerreiro.com.br', s: 'Registro.br, R$ 40 por ano', v: 40 / 12 },
      { n: 'Hospedagem do site', s: pro ? 'Vercel Pro (US$ 20)' : 'Vercel / Netlify, plano grátis', v: pro ? 20 * USD : 0, free: !pro },
      { n: 'Banco de dados da agenda', s: pro ? 'Supabase Pro (US$ 25), com backup diário' : 'Supabase, plano grátis', v: pro ? 25 * USD : 0, free: !pro },
      { n: 'Automação dos lembretes', s: pro ? 'n8n em servidor próprio' : 'Rotinas agendadas no próprio banco', v: pro ? 40 : 0, free: !pro },
      st.zap === 'oficial'
        ? { n: 'WhatsApp oficial (Meta)', s: `${msgs.toLocaleString('pt-BR')} mensagens × ~US$ 0,008`, v: msgs * 0.008 * USD }
        : { n: 'WhatsApp não oficial', s: 'Mensalidade fixa por número', v: 100 },
      { n: 'E-mail contato@tocadoguerreiro.com.br', s: pro ? 'Google Workspace, 1 conta' : 'Fora do piloto', v: pro ? 33 : 0, off: !pro }
    ];
  }
  const num = el => { const v = parseFloat((el.value || '').replace(/[^\d,]/g, '').replace(',', '.')); return isNaN(v) ? 0 : v; };

  function render() {
    const ag = +$('#ag').value;
    $('#vAg').textContent = ag;
    const list = items(ag);
    $('#rows').innerHTML = list.map(i => `<tr class="${i.off ? 'off' : ''}"><td>${i.n}${i.free ? '<span class="pill free">grátis</span>' : ''}<small>${i.s}</small></td><td>${brl(i.v, i.v > 0 && i.v < 10)}</td></tr>`).join('');
    const tot = list.reduce((a, i) => a + i.v, 0);
    $('#tot').textContent = brl(Math.round(tot));
    $('#per').textContent = st.plano === 'pro' ? 'Plano profissional' : 'Plano piloto enxuto';
    $('#ano').textContent = brl(Math.round(tot * 12));
    $('#cpa').textContent = brl(tot / ag, true);
    const fm = num($('#feeMonth')), fs = num($('#feeSetup'));
    $('#grand').hidden = !(fm || fs);
    $('#grandMonth').textContent = brl(Math.round(tot + fm));
    $('#grandSetup').textContent = fs ? brl(fs) : 'a combinar';
  }
  ['plano', 'zap'].forEach(id => $('#' + id).addEventListener('change', e => { st[id] = e.detail.v; render(); }));
  ['ag', 'feeMonth', 'feeSetup'].forEach(id => $('#' + id).addEventListener('input', render));
  render();

  $('#printBtn').addEventListener('click', () => window.print());
})();
