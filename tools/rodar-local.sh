#!/bin/zsh
# Roda a rotina diária no Mac (agendada pelo launchd às 7h). Alternativa à rotina na nuvem.
# Instalar:  cp tools/com.victor.sairouficar.plist ~/Library/LaunchAgents/ && launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.victor.sairouficar.plist
# Remover:   launchctl bootout gui/$(id -u)/com.victor.sairouficar && rm ~/Library/LaunchAgents/com.victor.sairouficar.plist
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "$(dirname "$0")/.." || exit 1
mkdir -p "$HOME/Library/Logs/sair-ou-ficar"
LOG="$HOME/Library/Logs/sair-ou-ficar/$(date +%F).log"
{
  echo "== início $(date)"
  git pull --ff-only origin main || { echo "pull falhou"; exit 1; }
  claude -p "Você é a rotina diária do estudo \"Sair ou Ficar\". Leia e siga à risca tools/ROTINA.md: pesquise as novidades dos últimos 3 dias, atualize só os JSON em data/, rode python3 tools/embed.py e todos os testes, registre em atualizacoes/AAAA-MM-DD.md e, se houve mudança material e os testes passaram, faça commit e git push origin main. Se nada material aconteceu, não faça commit. Termine com um resumo em português." \
    --model claude-opus-5-5 \
    --allowedTools "Bash Read Write Edit Glob Grep WebSearch WebFetch" \
    --permission-mode acceptEdits
  echo "== fim $(date) código $?"
} >> "$LOG" 2>&1
