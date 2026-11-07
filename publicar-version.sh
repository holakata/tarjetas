#!/bin/sh
# Marca una versión nueva antes de cada publicación.
# Las tarjetas y el panel abiertos (o guardados en la pantalla de inicio) la detectan y se recargan solos.
set -e
cd "$(dirname "$0")"
v=$(date -u +%Y%m%d%H%M%S)
for f in panel/index.html regalo/index.html t/index.html; do
  sed -i "s|<meta name=\"kata-version\" content=\"[^\"]*\">|<meta name=\"kata-version\" content=\"$v\">|" "$f"
done
printf '{"v":"%s"}\n' "$v" > version.json
echo "Versión $v"
