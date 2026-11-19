# FLCO Web

Radio por Internet con buscador único, favoritos, acceso a canales de noticias/deportes/música, análisis de **audio digital** cuando el navegador permite capturarlo, y búsqueda de imágenes y vídeos abiertos en Wikimedia Commons. No son emisiones de televisión en directo. No existe recepción RF en el navegador sin integrar hardware RTL-SDR.

Ejecutar desde la raíz: `python3 -m http.server 8000 --directory web`; abrir `http://localhost:8000`.

Las muestras de audio externas pueden estar restringidas por el navegador, en cuyo caso el gráfico no mostrará la señal aunque la radio se escuche. Los vídeos y fotos de Commons tienen licencias propias: revisar cada archivo. La geolocalización es opcional y envía coordenadas a Radio Browser solo tras consentimiento. La medición HTTP no es un test de velocidad.

Comprobar sintaxis:
```bash
node --check web/app.js
node --check web/lab.js
node --check web/explore.js
node --check web/live-media.js
```

Licencia del **código**: [MIT](../LICENSE). No cubre contenido de terceros.

## Televisión y red
En **Televisión abierta y canales**, selecciona un país para ver portales oficiales numerados. Los enlaces se abren fuera de FLCO; no garantizan emisión en directo ni disponibilidad territorial. Los datos de radio son metadatos del directorio, no RF. La descarga desde el servidor web es una prueba pequeña y orientativa; la subida requiere un servidor POST (no incluido en `python3 -m http.server`). En localhost no se mide Internet.

`node --check web/channels.js`
