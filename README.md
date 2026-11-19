# FLCO · Radio de código abierto

FLCO es una radio web minimalista para escuchar emisoras públicas por Internet, buscar por país o género, guardar favoritos y cambiar entre **canales numerados 1, 2, 3, 4, 5…**. Tiene un dial de **barras azules animadas** y colores que cambian con cada emisora.

**Proyecto desarrollado con asistencia de inteligencia artificial (IA)**, bajo dirección y revisión humana. El código fuente tiene **[licencia MIT](LICENSE)**, que permite usar, estudiar, modificar y redistribuir el software bajo sus condiciones. La licencia del código no concede derechos sobre las emisiones de terceros.

> Estado: prototipo web en desarrollo. La rama `feature/flco-numbered-radio-dial` no está fusionada con `main`. Las funciones nuevas requieren pruebas manuales en los navegadores de destino.

## Qué puedes hacer

- **Con Internet:** buscar emisoras de todo el mundo con el botón «🌍 Radios de todo el mundo» y ampliar resultados con «Cargar más radios» (60 visibles por tanda, hasta agotar el directorio); buscar emisoras por país, nombre o tema; escucharlas si el flujo es compatible; ver nombre, país, categoría, códec y bitrate cuando el directorio los proporciona; guardar favoritos.
- **Cambiar de canal:** pulsa el número de una emisora o los botones **Anterior** y **Siguiente**. El dial cambia de color y anima barras azules cuando suena el reproductor.
- **Sin Internet:** abrir la interfaz desde su caché tras una primera visita compatible y reproducir **archivos de audio locales** con el selector de archivos. Los favoritos guardan enlaces, no grabaciones; las emisoras de Internet **no funcionan offline**.
- **Ubicación opcional:** pulsa **Radios cerca de mí** y concede permiso. FLCO obtiene el país mediante OpenStreetMap Nominatim y consulta emisoras de ese país en Radio Browser. La búsqueda no mide intensidad RF ni garantiza mejor sonido; los resultados se ordenan por votos del directorio. Se comparten coordenadas con el servicio de geocodificación solo tras tu permiso. Se requiere HTTPS o localhost para geolocalización.\n- **Móvil:** interfaz adaptable y controles táctiles. La reproducción depende del navegador y el formato.

No se muestran ya los gráficos de ondas de audio que fallaban, la televisión ni los paneles de simulación. El diseño usa fondo negro.

## Instalación y uso por sistema operativo

FLCO web **no tiene instaladores nativos** (.deb, .exe, .dmg o APK) ni publicación en tiendas. Se sirve como sitio web local. Los siguientes son métodos orientativos, **no una garantía de compatibilidad con todos los sistemas operativos**.

### Linux (MX Linux, Debian, Ubuntu y distribuciones con Python 3)

```bash
sudo apt update
sudo apt install git python3
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
git fetch origin
git switch --track origin/feature/flco-numbered-radio-dial
python3 -m http.server 8000 --directory web
```

Si ya tienes el repositorio:

```bash
cd ~/FLCO
git fetch origin
git switch --track origin/feature/flco-numbered-radio-dial
python3 -m http.server 8000 --directory web
```

Abre **http://localhost:8000**. Si ya estabas en otra rama de FLCO, guarda primero los cambios sin confirmar antes de cambiar de rama.

### Windows 10/11 (PowerShell, con Git y Python 3 instalados)

```powershell
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
git fetch origin
git switch --track origin/feature/flco-numbered-radio-dial
py -3 -m http.server 8000 --directory web
```

Abre **http://localhost:8000** en Edge o Firefox. Si `py` no existe, prueba `python -m http.server 8000 --directory web`. Instala Git y Python desde sus distribuidores oficiales antes de ejecutar los comandos.

### macOS (Terminal, con Git y Python 3 instalados)

```bash
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
git fetch origin
git switch --track origin/feature/flco-numbered-radio-dial
python3 -m http.server 8000 --directory web
```

Abre **http://localhost:8000** en Safari o Firefox. La compatibilidad de reproducción varía.

### Android / iPhone / iPad

No hay APK ni app nativa. Abre la versión web desde un **servidor HTTPS** alojado para FLCO, o desde un ordenador de tu red que sirva la página. Para el uso offline del Service Worker se necesita **HTTPS o localhost**; una URL HTTP de la IP local del ordenador normalmente no permitirá registrar el Service Worker. El acceso offline puede variar por navegador y política de almacenamiento. No se ha verificado todavía una instalación PWA independiente en Android o iOS.

### Otros sistemas (BSD, ChromeOS, etc.)

Si cuentan con navegador moderno y un servidor HTTP que sirva la carpeta `web`, **podrían** ejecutar la interfaz. No hay soporte ni comandos universales verificados para todos los sistemas. La aplicación Python RTL-SDR puede necesitar dependencias específicas de cada plataforma.

## Uso diario

1. Arranca el servidor y abre FLCO.
2. Escribe un país, «noticias», «música» o el nombre de una emisora y pulsa **Buscar**, o pulsa **🌍 Radios de todo el mundo**. Usa **Cargar más radios** para consultar nuevas páginas del directorio.
3. En los resultados numerados pulsa **1, 2, 3…** o **Escuchar**.
4. Cambia de emisora con **Anterior** o **Siguiente**. Los colores y barras cambian con el canal; no indican intensidad RF.
5. Usa **☆ Guardar** para favoritos y **← Volver** para regresar.
6. Sin Internet, abre la página previamente guardada y elige un **archivo de audio local**. La escucha de emisoras online requiere Internet.

## ¿Qué antena necesito?

| Caso | Antena / hardware |
| --- | --- |
| Escuchar emisoras por Internet | **Ninguna antena de radio**; solo conexión Wi-Fi, Ethernet o datos móviles |
| Reproducir audio local sin Internet | **Ninguna antena** |
| Recibir radio FM real (87,5–108 MHz) sin Internet | **Receptor RTL-SDR USB** compatible y antena telescópica o dipolo ajustado a la banda FM |
| Mejorar recepción FM débil | Antena exterior para banda FM, ubicación despejada y cable coaxial adecuado |
| Explorar otras bandas con SDR | Antena diseñada para la banda de frecuencia que quieras recibir; verifica legalidad y compatibilidad |

**Importante:** la interfaz web todavía **no** controla el RTL-SDR ni reproduce FM por antena. El repositorio conserva un script Python separado `opensdr_explorer.py` para explorar espectro con hardware compatible, pero no sustituye a un receptor FM completo. Una antena sola no basta.

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

Las comprobaciones de sintaxis no garantizan la reproducción de todas las radios. El directorio externo puede estar caído y los flujos pueden requerir formatos no admitidos. El modo offline depende de que el navegador haya guardado la interfaz. Los archivos locales no se suben a un servidor.

## Licencia, autoría y privacidad

**Código abierto MIT. Desarrollado con asistencia de IA.** Consulta [LICENSE](LICENSE). Los favoritos se guardan localmente en el navegador. Las búsquedas online se envían a Radio Browser. El buscador manual no necesita ubicación; el botón opcional de radios cercanas pide permiso y envía coordenadas a OpenStreetMap Nominatim para obtener el país. Las búsquedas de radios se envían a Radio Browser. Los contenidos de terceros conservan sus licencias y condiciones.
