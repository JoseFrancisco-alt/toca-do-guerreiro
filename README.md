# Toca do Guerreiro · Protótipo + Proposta

Protótipo **visual** (sem back-end) e proposta comercial de José Francisco.

- `index.html`: site da academia, com efeitos do site do Manoel.ink: cortina de cor por seção, títulos que engrossam no scroll, nome que se abre, manifesto que acende, turmas empilhando e **Professores** em carrossel travado.
- `agendar.html`: página de agendamento da aula grátis. Aceita `?unidade=`, `?mod=` e `?origem=balcao|aulao|instagram`.
- `relatorio.html`: versão interativa da proposta, com calculadora de custos.
- `proposta.html` → **`Proposta-Toca-do-Guerreiro.pdf`**: proposta de venda em PDF, com 11 páginas A4.

## Mudar preço ou contato da proposta
1. Edite `window.PROP` no topo de `proposta.html` (implantação, manutenção, por unidade, contato).
2. Rode `bash ferramentas/gerar-pdf.sh`. Precisa do Microsoft Edge e do Node 22+.

Horários, vagas, endereços, nomes de professores (exceto Prof. Augusto) e depoimentos são ilustrativos.
