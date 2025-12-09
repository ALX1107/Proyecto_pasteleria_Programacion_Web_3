#!/usr/bin/env bash
# Uso: ./scripts/push_to_remote.sh <rama_local> <rama_remota>
# Por defecto empuja la rama local especificada hacia 'main' en el remoto.
set -euo pipefail

LOCAL_BRANCH="${1:-work}"
REMOTE_BRANCH="${2:-main}"
REMOTE_URL="${GIT_REMOTE_URL:-https://github.com/ALX1107/Proyecto_final_Pasteleria.git}"

echo "Configurando remoto 'origin' -> ${REMOTE_URL}"
git remote remove origin 2>/dev/null || true
git remote add origin "${REMOTE_URL}"

echo "Haciendo push de ${LOCAL_BRANCH} a origin/${REMOTE_BRANCH}..."
git push -u origin "${LOCAL_BRANCH}:${REMOTE_BRANCH}"
echo "Listo. La rama remota visible es '${REMOTE_BRANCH}'."
