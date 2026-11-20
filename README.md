# FLCO · Radio de código abierto

FLCO es una radio web minimalista para escuchar emisoras públicas por Internet, buscar por país o género, guardar favoritos y cambiar entre **canales numerados 1, 2, 3, 4, 5…**. Tiene un dial de **barras azules animadas** y colores que cambian con cada emisora. Estas barras son **decorativas** y no pretenden medir ondas ni interferencias.

**Proyecto desarrollado con asistencia de inteligencia artificial (IA)**, bajo dirección y revisión humana. El código fuente tiene **[licencia MIT](LICENSE)**, que permite usar, estudiar, modificar y redistribuir el software bajo sus condiciones. La licencia del código no concede derechos sobre las emisiones de terceros.

> Estado: prototipo web en desarrollo. Los canales locales persistentes están propuestos en la rama `feat/flco-radio-offline-presets` (PR #22), todavía sin fusionar con `main` ni verificar en dispositivos reales.

## Qué puedes hacer

- **Con Internet:** buscar emisoras por país, nombre o tema; escucharlas si el flujo es compatible; ver nombre, país, categoría, códec y bitrate cuando el directorio los proporciona; guardar favoritos.
- **Cambiar de canal:** pulsa el número de una emisora o los botones **Anterior** y **Siguiente**. El dial cambia de color y anima barras azules cuando suena el reproductor.
- **Sin Internet (rama experimental):** abrir la interfaz desde su caché tras una primera visita compatible, importar varios archivos de audio y guardarlos en el almacenamiento local del navegador (IndexedDB). Esos archivos se convierten en **canales numerados** que puedes recorrer con **Anterior** y **Siguiente**, incluso tras recargar, mientras el navegador conserve los datos. Los favoritos de emisoras online solo guardan enlaces: **no funcionan offline**. La disponibilidad depende del espacio y las políticas de almacenamiento del navegador.
- **Móvil:** interfaz adaptable y controles táctiles. La reproducción depende del navegador y el formato.

No se muestran ya los gráficos de ondas de audio que fallaban, la televisión ni los paneles de simulación.

## Instalación y uso por sistema operativo

FLCO web **no tiene instaladores nativos** (.deb, .exe, .dmg o APK) ni publicación en tiendas. Se sirve como sitio web local. Los siguientes son métodos orientativos, **no una garantía de compatibilidad con todos los sistemas operativos**.

### Linux (MX Linux, Debian, Ubuntu y distribuciones con Python 3)

```bash
sudo apt update
sudo apt install git python3
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
git fetch origin
git switch --track origin/feat/flco-radio-offline-presets
python3 -m http.server 8000 --directory web
```

Si ya tienes el repositorio:

```bash
cd ~/FLCO
git fetch origin
git switch --track origin/feat/flco-radio-offline-presets
python3 -m http.server 8000 --directory web
```

Abre **http://localhost:8000**. Si ya estabas en otra rama de FLCO, guarda primero los cambios sin confirmar antes de cambiar de rama.

### Windows 10/11 (PowerShell, con Git y Python 3 instalados)

```powershell
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
git fetch origin
git switch --track origin/feat/flco-radio-offline-presets
py -3 -m http.server 8000 --directory web
```

Abre **http://localhost:8000** en Edge o Firefox. Si `py` no existe, prueba `python -m http.server 8000 --directory web`. Instala Git y Python desde sus distribuidores oficiales antes de ejecutar los comandos.

### macOS (Terminal, con Git y Python 3 instalados)

```bash
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
git fetch origin
git switch --track origin/feat/flco-radio-offline-presets
python3 -m http.server 8000 --directory web
```

Abre **http://localhost:8000** en Safari o Firefox. La compatibilidad de reproducción varía.

### Android / iPhone / iPad

No hay APK ni app nativa. Abre la versión web desde un **servidor HTTPS** alojado para FLCO, o desde un ordenador de tu red que sirva la página. Para el uso offline del Service Worker se necesita **HTTPS o localhost**; una URL HTTP de la IP local del ordenador normalmente no permitirá registrar el Service Worker. El acceso offline puede variar por navegador y política de almacenamiento. No se ha verificado todavía una instalación PWA independiente en Android o iOS.

### Otros sistemas (BSD, ChromeOS, etc.)

Si cuentan con navegador moderno y un servidor HTTP que sirva la carpeta `web`, **podrían** ejecutar la interfaz. No hay soporte ni comandos universales verificados para todos los sistemas. La aplicación Python RTL-SDR puede necesitar dependencias específicas de cada plataforma.

## Uso diario

1. Arranca el servidor y abre FLCO.
2. Escribe un país, «noticias», «música» o el nombre de una emisora y pulsa **Buscar**.
3. En los resultados numerados pulsa **1, 2, 3…** o **Escuchar**.
4. Cambia de emisora con **Anterior** o **Siguiente**. Los colores y barras cambian con el canal; no indican intensidad RF.
5. Usa **☆ Guardar** para favoritos y **← Volver** para regresar.
6. En la rama experimental, importa archivos desde **Sin Internet** para guardarlos como canales locales. Desconecta Internet, vuelve a abrir la web ya cacheada y usa **Sintonizar radio sin Internet** o **Anterior/Siguiente**. Los canales locales reproducen archivos guardados, no emisiones FM en directo.

## ¿Qué antena necesito?

| Caso | Antena / hardware |
| --- | --- |
| Escuchar emisoras por Internet | **Ninguna antena de radio**; solo conexión Wi-Fi, Ethernet o datos móviles |
| Reproducir audio local sin Internet | **Ninguna antena** |
| Radio FM en teléfono con receptor FM integrado | Algunos teléfonos incluyen chip/receptor FM y pueden utilizar los auriculares con cable como antena; depende del modelo, firmware, controladores y una aplicación nativa compatible. **FLCO web no puede acceder directamente a ese receptor desde el navegador** |
| Radio FM en portátil | La antena Wi-Fi/Bluetooth del portátil **no es un receptor FM/AM**. La mayoría de portátiles no incorporan sintonizador de radio. Para recibir FM sin Internet se necesita un receptor compatible (por ejemplo RTL-SDR USB) y antena adecuada |
| Recibir radio FM real (87,5–108 MHz) sin Internet | **Receptor RTL-SDR USB** compatible y antena telescópica o dipolo ajustado a la banda FM; el software de recepción aún debe integrarse |
| Mejorar recepción FM débil | Antena exterior para banda FM, ubicación despejada y cable coaxial adecuado |
| Explorar otras bandas con SDR | Antena diseñada para la banda de frecuencia que quieras recibir; verifica legalidad y compatibilidad |

**Objetivo de FLCO:** aprovechar un receptor FM integrado del teléfono cuando el dispositivo y una integración nativa lo permitan, o un receptor SDR compatible conectado al portátil. **No está implementado**: el navegador no ofrece acceso universal a la antena/chip FM del móvil, y las antenas de Wi-Fi de los portátiles no sintonizan emisoras FM por sí solas. Para radio real sin Internet se necesita **receptor + antena + software/controladores**; no basta con la antena. El repositorio conserva `opensdr_explorer.py` para explorar espectro con hardware compatible, pero la interfaz web todavía no controla el SDR ni decodifica FM.

## Desinstalar

**Primero** detén el servidor con `Ctrl+C`. Los siguientes comandos borran únicamente la carpeta del clon de FLCO: revisa la ruta y **haz copia de cualquier cambio o archivo personal antes de borrarla**. No desinstalan Git, Python ni los controladores SDR.

Linux/macOS, desde el directorio que contiene la carpeta FLCO:

```bash
rm -r ./FLCO
```

Windows PowerShell, desde el directorio que contiene la carpeta FLCO:

```powershell
Remove-Item -LiteralPath .\FLCO -Recurse
```

En Android/iOS elimina los datos de sitio de FLCO desde la configuración del navegador y, si habías creado un acceso directo a la pantalla de inicio, elimínalo. Esto también puede borrar favoritos guardados. En Linux/macOS/Windows puedes limpiar los datos del sitio en el navegador para quitar la caché offline y los favoritos. **No ejecutes los comandos de borrado dentro de la propia carpeta FLCO.**

## Verificaciones y límites

```bash
node --check web/app.js
node --check web/dial.js
node --check web/offline.js
node --check web/sw.js
```

Las comprobaciones de sintaxis no garantizan la reproducción de todas las radios. El directorio externo puede estar caído y los flujos pueden requerir formatos no admitidos. El modo offline depende de que el navegador haya guardado la interfaz. Los archivos locales no se suben a un servidor; en la rama experimental se guardan en IndexedDB y pueden perderse si el usuario borra los datos del sitio o el navegador libera almacenamiento. La función de recepción FM/AM mediante hardware está pendiente de implementación y pruebas.

## Licencia, autoría y privacidad

**Código abierto MIT. Desarrollado con asistencia de IA.** Consulta [LICENSE](LICENSE). Los favoritos se guardan localmente en el navegador. Las búsquedas online se envían a Radio Browser. FLCO no necesita permisos de geolocalización para el buscador actual. Los contenidos de terceros conservan sus licencias y condiciones.
