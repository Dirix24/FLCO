# FLCO — Radio inteligente y explorador SDR

FLCO es un proyecto en desarrollo para **escuchar emisoras por Internet** desde MX Linux, otros ordenadores y teléfonos, y explorar señales abiertas mediante un receptor RTL-SDR. Incluye un pequeño laboratorio de señales **simuladas**.

> **Estado:** prototipo. Las funciones web están en esta rama de desarrollo; la recepción SDR continúa como aplicación Python independiente. No hay todavía una versión estable con todas las funciones integradas.

## Funciones disponibles

| Función | Estado | Requisitos |
| --- | --- | --- |
| Buscar emisoras por país, tema o nombre en un solo campo | Prototipo web | Internet; directorio externo Radio Browser |
| Escuchar emisoras y URL de audio HTTPS | Prototipo web | Navegador compatible con el flujo |
| Guardar favoritos | Prototipo web | Almacenamiento local del navegador |
| Reproducir tonos de prueba en altavoces | Prototipo web | Audio real generado por Web Audio, no RF |
| Explorar canales públicos por Noticias, Deportes, Música o España | Prototipo web | Directorio Radio Browser; enlaces pueden fallar |
| Generar ondas de prueba (seno, cuadrada, AM y ruido) | Prototipo web | Sin antena; no transmite RF |
| Espectro e interferencia simulados | Prototipo web | Datos matemáticos, no medición SDR |
| Buscar emisoras por país o proximidad | Prototipo web | Geolocalización solo con permiso; directorio externo |
| Medir respuesta HTTP al servidor FLCO | Prototipo web | No mide velocidad real de Internet |
| Visualizar espectro y waterfall RTL-SDR | Aplicación Python existente | Receptor USB y antena |
| Escanear frecuencias RTL-SDR | Aplicación Python existente | Receptor USB y antena |

**Pendiente:** escuchar FM recibida por antena, analizar interferencias reales, medir descarga/subida, descubrir emisoras según ubicación autorizada, conectar el SDR del ordenador al teléfono y pruebas integrales.

## Probar la radio web en MX Linux

Instala Python y Git si no los tienes:

```bash
sudo apt update
sudo apt install git python3
```

Si **no tienes el repositorio descargado**:

```bash
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
git fetch origin
git switch --track origin/fix/flco-main-compatible
```

Si **ya tienes el repositorio descargado**:

```bash
cd ~/FLCO
git fetch origin
git switch --track origin/fix/flco-main-compatible
```

Si la rama ya existe localmente, usa `git switch fix/flco-main-compatible` y `git pull --ff-only`. Guarda o confirma los cambios locales antes de cambiar de rama.

Inicia la interfaz:

```bash
python3 -m http.server 8000 --directory web
```

Abre **http://localhost:8000** en Firefox. Detén el servidor con `Ctrl+C`.

Para abrirlo desde un teléfono en la misma red, utiliza la dirección LAN del ordenador y el puerto 8000. No expongas el servidor de desarrollo a Internet. El navegador móvil puede limitar algunas funciones si la página no usa HTTPS.

## Probar el laboratorio web

En la página:
1. Escribe «España», «noticias de España», «deportes» o un nombre en el buscador único y pulsa **Buscar radios**. Los resultados muestran etiquetas orientativas de Noticias, Deportes, Música o categoría no confirmada. Pulsa **Escuchar**. Algunas estaciones no reproducen audio por formatos incompatibles o enlaces caídos.
2. Guarda una emisora en **Favoritos**.
3. En **Laboratorio de señales simuladas**, selecciona una onda, cambia la frecuencia y pulsa **Generar señal**.
4. En **Explorador de espectro simulado**, cambia el ruido y observa la interferencia matemática.
5. Busca por país o usa **Buscar usando mi ubicación** únicamente si quieres compartir coordenadas con Radio Browser. En Firefox, geolocalización suele exigir HTTPS o localhost.
6. En **Comprobar respuesta de conexión**, pulsa **Medir respuesta HTTP**. Si usas localhost, el resultado refleja principalmente el servidor local, no tu conexión a Internet.

## Explorador RTL-SDR existente (independiente)

Para esta función necesitas un receptor RTL-SDR USB, antena y controladores compatibles. No es necesario instalar estas dependencias para la radio web.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python opensdr_explorer.py
```

Comandos: `freq 100.5`, `scan 88 108`, `help`, `quit`.

Este programa representa señales y potencia relativa; **todavía no reproduce audio FM**. Las mejoras de estabilidad se revisan en el [PR #1](https://github.com/Dirix24/FLCO/pull/1).

## Organización

```text
FLCO/
├── opensdr_explorer.py       # Explorador SDR original
├── requirements.txt          # Dependencias SDR
├── web/
│   ├── index.html            # Radio y laboratorio web
│   ├── app.js                # Búsqueda, audio, favoritos
│   ├── explore.js            # Espectro simulado y emisoras próximas
│   ├── lab.js                # Señales simuladas y respuesta HTTP
│   ├── styles.css
│   └── README.md
├── docs/ARCHITECTURE.md      # Arquitectura y fases
└── .github/workflows/web-checks.yml
```

## Comprobar sintaxis

Con Node.js instalado:

```bash
node --check web/app.js
node --check web/lab.js
node --check web/explore.js
```

Estas comprobaciones no sustituyen las pruebas de audio, navegadores o hardware. La integración continua comprueba la sintaxis JavaScript.

## Próximas fases

1. Estabilizar la radio web y comprobarla en MX Linux y teléfonos.
2. Integrar recepción y reproducción de audio FM con RTL-SDR.
3. Medir señales e interferencias reales y representar espectro y waterfall en la web.
4. Añadir pruebas voluntarias de velocidad de red y latencia.
5. Ofrecer búsqueda por ciudad y ubicación opcional con permiso.
6. Ampliar el laboratorio con análisis espectral y señales digitales.
7. Crear una API local autenticada para acceder al receptor conectado al ordenador.

Consulta [la arquitectura](docs/ARCHITECTURE.md).

## Seguridad y privacidad

FLCO no solicita ubicación en la versión actual. Los favoritos se guardan localmente. Las búsquedas utilizan un servicio externo y la reproducción conecta con las emisoras seleccionadas. El laboratorio genera señales matemáticas en memoria: **no transmite radiofrecuencia**. Utiliza el receptor SDR únicamente para emisiones legalmente accesibles.

## Desarrollo

Esta rama se ha creado **a partir del main actual** para facilitar una revisión sin arrastrar conflictos del historial anterior. No se fusionará automáticamente.

## Licencia

Consulta el archivo `LICENSE` del repositorio, si está presente, para conocer los términos aplicables. No se presupone ninguna licencia sin verificarla.

### Buscador único
El buscador interpreta países y categorías habituales (noticias, deportes, música y géneros). Usa etiquetas de Radio Browser: la clasificación no está verificada y puede faltar. Las búsquedas de términos no reconocidos se tratan como nombres de emisoras.

## Escuchar un tono real y explorar canales abiertos
En la web, selecciona una onda **senoidal** o **cuadrada** y pulsa **Escuchar tono de prueba**. El navegador emite sonido por los altavoces a volumen reducido, sin usar antena ni transmitir RF. Pulsa **Detener tono** para silenciarlo. La onda AM y el ruido continúan solo como visualización. En **Explorar radios abiertas** pulsa Noticias, Deportes, Música o Todas para consultar emisoras públicas por Internet. No es recepción FM con antena. Para recibir FM real hará falta integrar un receptor RTL-SDR y una cadena de demodulación y audio.
