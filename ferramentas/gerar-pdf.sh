#!/usr/bin/env bash
# Gera Proposta-Toca-do-Guerreiro.pdf a partir de proposta.html (precisa do Microsoft Edge e Node 22+).
# Mudou preço/contato? Edite window.PROP no topo de proposta.html e rode:  bash ferramentas/gerar-pdf.sh
cd "$(dirname "$0")/.."
P="$(pwd -W 2>/dev/null || pwd)"
node ferramentas/edge.mjs "file:///$P/proposta.html" "Proposta-Toca-do-Guerreiro.pdf" 1240 1754 0 pdf
