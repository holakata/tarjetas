# Kata Studio · tarjetas

Tarjetas de cliente frecuente, tarjetas de regalo y panel de recepción para los negocios de Kata Studio.

- `t/?n=<negocio>`: tarjeta del cliente (sellos, premio, cumpleaños).
- `regalo/?g=<código>`: tarjeta de regalo.
- `panel/`: panel de recepción (QR del mostrador, canjear, clientes, tarjetas de regalo).

Datos en Supabase (proyecto kata-studio). Todo el acceso pasa por funciones de la base de datos; las tablas no se leen directo.

## Publicar cambios
Antes de cada commit que cambie páginas, correr `./publicar-version.sh`. Así las tarjetas abiertas o guardadas en la pantalla de inicio se recargan solas con la versión nueva.
