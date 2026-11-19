# FLCO Radio Web

Radio web minimalista con resultados numerados, dial de barras azules decorativas, botones anterior/siguiente, información de emisoras, favoritos y reproducción de archivos locales sin Internet. No se muestra el visualizador de ondas que dependía de permisos de captura. Las barras del dial no miden ondas ni interferencias.

Iniciar desde la raíz: `python3 -m http.server 8000 --directory web` y abrir `http://localhost:8000`.

El Service Worker guarda la interfaz tras una primera visita en HTTPS o localhost. Las radios online requieren Internet; los archivos locales no. El diseño es responsive para móviles, aunque la compatibilidad requiere pruebas. Consulta [README principal](../README.md) para instalación, desinstalación, antenas y limitaciones por sistema operativo.

Código abierto bajo [MIT](../LICENSE). Desarrollado con asistencia de IA.

La interfaz usa fondo negro. **Radios cerca de mí** solicita ubicación únicamente tras pulsar el botón; obtiene el país mediante OpenStreetMap Nominatim y consulta emisoras de ese país en Radio Browser. No mide cobertura ni intensidad RF. La geolocalización requiere HTTPS o localhost.
