# FLCO Web — radio minimalista

Interfaz responsive para móvil y MX Linux. Buscador único de radios, favoritos, reproducción de audio, metadatos de emisoras y gráficos del audio capturable por el navegador. Sin televisión ni paneles simulados.

`python3 -m http.server 8000 --directory web` y abrir `http://localhost:8000`.

El Service Worker guarda archivos básicos de la interfaz después de una primera visita online, para poder reabrirla sin conexión en navegadores compatibles. La escucha sin Internet usa archivos de audio locales, no emisoras remotas. Los favoritos no almacenan grabaciones. El audio de emisoras puede impedir su análisis por restricciones del navegador; nunca se inventan ondas. Para radio FM por antena se necesita un receptor RTL-SDR.

Licencia del código: [MIT](../LICENSE). Los medios de terceros mantienen sus propias licencias.

Verificar sintaxis: `node --check web/app.js && node --check web/live-media.js && node --check web/offline.js && node --check web/sw.js`.
