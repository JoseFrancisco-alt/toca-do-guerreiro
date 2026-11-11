/* Dados ilustrativos do protótipo (sem back-end) */
window.TOCA = {
  SITE: 'https://josefrancisco-alt.github.io/toca-do-guerreiro/',
  UNITS: {
    cruzeiro: { nome: 'Cruzeiro', end: 'CT Cruzeiro (endereço a confirmar)' },
    santalucia: { nome: 'Santa Lúcia', end: 'Filial Santa Lúcia (endereço a confirmar)' }
  },
  MODS: { kids: 'Kids', feminino: 'Feminina', adulto: 'Adulto' },
  // 0=dom ... 6=sáb
  GRADE: {
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
  },
  WD: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  WDF: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  ORIGENS: { balcao: 'QR do balcão', aulao: 'QR do aulão / panfleto', instagram: 'link da bio do Instagram' },
  // vagas para aula experimental (simuladas, mas estáveis por dia e horário)
  vagas(h, date, i) { return (h.charCodeAt(1) + date.getDate() + i) % 6; },
  iso(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; },
  // horários de hoje que já passaram (com 30 min de folga) não contam
  passou(d, h) {
    const now = new Date();
    if (d.toDateString() !== now.toDateString()) return false;
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm < now.getHours() * 60 + now.getMinutes() + 30;
  }
};
