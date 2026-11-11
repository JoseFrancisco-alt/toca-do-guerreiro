# Toca do Guerreiro · Protótipo + Proposta

Protótipo **visual** (sem back-end) e proposta comercial de José Francisco.

- `index.html`: site da academia, didático e feito pra quem nunca treinou. A página vai da faixa branca à preta: o que é jiu-jitsu, a primeira aula minuto a minuto, o que levar, faixas e graus (interativo), glossário do tatame, professores, grade de horários e unidades. As "próximas aulas com vaga" e a grade saem de `data.js`, e cada horário abre o agendamento já preenchido.
- `agendar.html`: página de agendamento da aula grátis. Aceita `?unidade=`, `?mod=`, `?dia=AAAA-MM-DD`, `?hora=HH:MM` e `?origem=balcao|aulao|instagram`. O botão "Salvar na agenda" baixa um arquivo .ics com lembrete.
- `relatorio.html`: versão interativa da proposta, com calculadora de custos.
- `proposta.html` → **`Proposta-Toca-do-Guerreiro.pdf`**: proposta de venda em PDF, com 11 páginas A4.

## Mudar preço ou contato da proposta
1. Edite `window.PROP` no topo de `proposta.html` (implantação, manutenção, por unidade, contato).
2. Rode `bash ferramentas/gerar-pdf.sh`. Precisa do Microsoft Edge e do Node 22+.

Horários, vagas, endereços, nomes de professores (exceto Prof. Augusto) e depoimentos são ilustrativos.

Arquivos: `site.css`/`site.js` são comuns à home e ao agendamento; `style.css`/`script.js` ficam só para `relatorio.html`.

Foto da tela de abertura: salve uma foto de treino em `img/hero.jpg` (paisagem, 1920 px ou mais). Sem ela, aparece o emblema no lugar.
