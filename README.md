# Toca do Guerreiro · Protótipo + Proposta

Protótipo **visual** (sem back-end) do site da Toca do Guerreiro Jiu-Jitsu e proposta comercial de José Francisco.

## Páginas
| Arquivo | O que é |
|---|---|
| `index.html` | Site da academia: abertura, turmas, primeira aula, faixas, professores, horários, unidades, dúvidas |
| `agendar.html` | Agendamento da aula grátis. Aceita `?unidade=`, `?mod=` e `?origem=balcao\|aulao\|instagram` |
| `proposta.html` → `Proposta-Toca-do-Guerreiro.pdf` | Proposta de venda em PDF (4 páginas A4; outras 7 escondidas com a classe `fora`) |

## Pastas
```
css/         site.css (comum) · home.css · agendar.css · proposta.css
js/          data.js (horários e unidades) · site.js (comum) · home.js · agenda.js
img/         logo.svg (Toca) · jf-logo.svg (José Francisco) · hero.jpg
img/fotos/   fotos do Instagram da Toca
img/shots/   prints do site usados no PDF
ferramentas/ gerar-pdf.sh + edge.mjs (gera o PDF e os prints com o Edge)
```

## Mudar preço ou contato da proposta
1. Edite `window.PROP` no topo de `proposta.html`.
2. Pra voltar com uma página escondida, tire `fora` do `class` da `<section>` dela.
3. Rode `bash ferramentas/gerar-pdf.sh`. Precisa do Microsoft Edge e do Node 22+.

## Pendências pra versão final
- Foto da turma Kids: salvar em `img/fotos/kids.jpg` e copiar a regra `#t-fem .turma-topo` em `css/home.css`.
- Nomes e fotos dos professores, horários reais, endereços e depoimentos verdadeiros.
