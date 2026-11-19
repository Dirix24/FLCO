# FLCO — Radio por Internet y explorador SDR

FLCO es una aplicación **de código abierto** en desarrollo para escuchar emisoras públicas de radio por Internet, buscar imágenes y vídeos abiertos, visualizar el audio que se reproduce y explorar señales con hardware RTL-SDR desde una aplicación Python separada.

**Licencia:** [MIT](LICENSE). Puedes estudiar, utilizar, modificar y distribuir el código conforme a la licencia. Las emisoras, vídeos, fotografías y otros contenidos de terceros **no** quedan cubiertos automáticamente por la licencia del código: comprueba sus propias condiciones.

> Estado: prototipo. Esta rama está en desarrollo y no está fusionada con `main`. Las funciones de RF real requieren hardware y trabajo de integración.

## Qué funciona

| Función | Estado | Limitación |
| --- | --- | --- |
| Buscar radio por país, género o nombre en un solo campo | Prototipo web | Directorio externo Radio Browser |
| Escuchar radio pública por Internet y guardar favoritos | Prototipo web | Depende del formato y disponibilidad del flujo |
| Explorar noticias, deportes, música y radios españolas | Prototipo web | Clasificación orientativa del directorio |
| Visualizar ondas y espectro del audio escuchado | Prototipo web | Solo cuando el navegador permite acceder a las muestras; **no es espectro RF** |
| Ver canales de TV por país (1, 2, 3...) | Directorio de enlaces oficiales | Abre webs de canales; no garantiza vídeo directo ni incrustado |
| Medir transferencia desde/hacia servidor FLCO | Prototipo web | Descarga local orientativa; subida requiere servidor POST; no equivale a velocidad de Internet |
| Buscar fotografías y vídeos de noticias | Prototipo web | Archivos de Wikimedia Commons, **no TV en directo** |
| Tiempo de respuesta HTTP | Prototipo web | No es velocidad de Internet ni ping ICMP |
| Buscar radios próximas con permiso de ubicación | Prototipo web | Envía coordenadas a Radio Browser; requiere contexto seguro |
| Espectro y waterfall de antena RTL-SDR | Script Python independiente | Necesita receptor USB, antena y controladores |

**No implementado:** reproducción integrada de todos los canales de TV en directo, recibir audio FM desde la antena en la web, analizar interferencias RF reales en la web, prueba fiable de velocidad pública de Internet, servidor de subida compatible y controlar el SDR desde el teléfono. Los canales son enlaces oficiales a webs de sus proveedores, no retransmisiones propias. FLCO no puede detectar señales RF sin un receptor físico.

## Ejecutar en MX Linux

```bash
sudo apt update
sudo apt install git python3 nodejs
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
git fetch origin
git switch --track origin/feature/flco-live-media-analyzer
python3 -m http.server 8000 --directory web
```

Si ya descargaste el repositorio, omite `git clone` y usa `cd ~/FLCO` antes de `git fetch origin`.

Abre **http://localhost:8000** en Firefox. Para detener el servidor pulsa `Ctrl+C`. No expongas este servidor de pruebas a Internet.

## Cómo usar FLCO

1. Escribe «noticias de España», «deportes», «música» o «España» en el **único buscador**. Selecciona una radio y pulsa **Escuchar**.
2. En **Ondas del audio que estás escuchando**, pulsa **Ver ondas del audio**. Se muestran la forma de onda y el espectro de **audio digital**, si el navegador puede leer el flujo. Si el gráfico queda plano, la radio puede seguir sonando: no significa que no haya señal de antena. **No se calcula interferencia RF ni dBm**.
3. En **Noticias: imágenes y vídeos abiertos**, busca «noticias España» u otra expresión. Los resultados proceden de **Wikimedia Commons** y pueden ser imágenes o archivos de vídeo; no son canales de televisión en directo. Sigue el enlace de cada archivo para revisar fuente y licencia.
4. La búsqueda por ubicación solo se activa si pulsas el botón correspondiente y concedes permiso. Las coordenadas se envían a Radio Browser para la consulta; FLCO no las guarda.

## Explorador SDR por antena (aplicación separada)

Para usar el script Python existente conecta un RTL-SDR USB y una antena, instala las bibliotecas del sistema necesarias para RTL-SDR y ejecuta:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python opensdr_explorer.py
```

Comandos: `freq 100.5`, `scan 88 108`, `help`, `quit`. El script muestra niveles relativos, espectro y waterfall. Todavía no proporciona un reproductor FM completo. Las correcciones de estabilidad se revisan en el [PR #1](https://github.com/Dirix24/FLCO/pull/1).

## Comprobaciones

```bash
node --check web/app.js
node --check web/lab.js
node --check web/explore.js
node --check web/live-media.js
node --check web/channels.js
```

Las comprobaciones de sintaxis no garantizan que todos los flujos, vídeos y navegadores funcionen. Falta probar manualmente las funciones nuevas en MX Linux.

## Privacidad y seguridad

Las búsquedas de radio consultan Radio Browser; la búsqueda multimedia consulta Wikimedia Commons. Los favoritos se guardan en el navegador. La ubicación es opcional y requiere permiso; el servicio externo recibe las coordenadas si se realiza esa búsqueda. No se retransmiten ni se interceptan emisiones privadas.

## Desarrollo

El código fuente está disponible en [GitHub](https://github.com/Dirix24/FLCO). Consulta [la arquitectura](docs/ARCHITECTURE.md) y [la licencia MIT](LICENSE). Esta rama está destinada a revisión, sin fusiones automáticas.

## Televisión por país y canales numerados
Elige un país en **Televisión abierta y canales**. FLCO enumera enlaces a portales oficiales (Canal 1, 2, 3...), sin prometer que todos ofrezcan directo gratuito en cada región. La numeración es interna a FLCO, no frecuencia ni orden de TDT. Algunos portales requieren cuenta o están geobloqueados.

## Datos de radio y errores de análisis
FLCO presenta metadatos disponibles (categoría, país, códec, bitrate declarado y URL). Cuando el navegador impide capturar muestras por restricciones del flujo, **no inventa ondas ni interferencias**; la reproducción de audio puede seguir disponible. No se obtienen mediciones RF sin antena.

## Velocidad
La descarga de prueba mide una transferencia pequeña desde el servidor FLCO, con precisión limitada. La subida necesita un endpoint HTTP POST que el servidor Python simple no proporciona. **En localhost ninguna de estas cifras representa la velocidad real de Internet**. No se deben comparar con un test de velocidad público.
