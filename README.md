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

**Objetivo de FLCO:** aprovechar un receptor FM integrado del teléfono cuando el dispositivo y una integración nativa lo permitan, o un receptor SDR compatible conectado al portátil. **En la rama experimental ya existe un servidor local para RTL-SDR USB en portátiles/PC**, pero el acceso a chips FM integrados de teléfonos todavía no está implementado. El navegador no ofrece acceso universal a la antena/chip FM del móvil, y las antenas de Wi-Fi de los portátiles no sintonizan emisoras FM por sí solas. Para radio real sin Internet se necesita **receptor + antena + software/controladores**; no basta con la antena. La rama experimental incluye `fm_server.py`, que usa `rtl_fm` y `ffmpeg` para entregar audio FM al navegador local. `opensdr_explorer.py` sigue disponible como explorador separado. El receptor RTL-SDR, su antena y los controladores deben funcionar en el equipo. **No se ha probado aún con hardware real.**

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

## FM real sin Internet (experimental, Linux con RTL-SDR USB)

Este modo recibe ondas FM reales mediante un **receptor RTL-SDR USB y una antena FM**, sin utilizar Internet. La web por sí sola no puede captar radio. El servidor local escucha únicamente en `127.0.0.1` y sirve la interfaz y el audio desde el mismo ordenador.

Instala las herramientas (la instalación de paquetes puede necesitar Internet una vez):

```bash
sudo apt install rtl-sdr ffmpeg
```

Conecta el RTL-SDR USB y la antena FM. Desde la carpeta FLCO en la rama experimental:

```bash
python3 fm_server.py
```

Abre **http://127.0.0.1:8000/** en el mismo equipo, busca la sección **FM por antena**, selecciona una frecuencia entre 87,5 y 108 MHz y pulsa **Sintonizar FM**. Los botones **Anterior** y **Siguiente** permiten ajustar la frecuencia en pasos de 0,1 MHz mientras se escucha FM.

**Requisitos y límites:** se necesitan `rtl_fm`, `ffmpeg` con codificador `libmp3lame`, un dispositivo RTL-SDR compatible y permisos de acceso USB. Algunos equipos requieren configurar reglas udev o descargar un controlador que esté ocupando el dispositivo. La recepción puede fallar si no hay antena o señal. Solo se ha implementado FM de radiodifusión, no AM. Este servidor no da acceso remoto ni puede utilizar el receptor FM integrado de un móvil. No se ha verificado aún la calidad del audio ni la compatibilidad de todos los modelos.

Comprobaciones sin antena: `python3 -m py_compile fm_server.py`, `node --check web/fm.js`. Para verificar recepción real, hay que conectar hardware y probar audio, cambios de frecuencia y desconexión.

## Antenas recomendadas para recibir FM sin Internet

| Dispositivo | Antena recomendada | Qué más se necesita |
| --- | --- | --- |
| **Android con radio FM integrada y habilitada** | **Auriculares con cable de 3,5 mm**, que actúan como antena en los modelos compatibles; no sirven auriculares Bluetooth como antena. Un adaptador USB-C no garantiza que funcione. | Chip FM habilitado y una aplicación/controlador del fabricante. **FLCO aún no controla ese chip**. |
| **Android con RTL-SDR externo** | **Dipolo telescópico VHF/FM** conectado al RTL-SDR, ajustado aproximadamente a 70–75 cm por brazo cerca de 100 MHz. | Adaptador USB-C OTG, alimentación USB suficiente, RTL-SDR y una app/controlador Android compatible. **FLCO Android solo detecta algunos receptores: aún no sintoniza audio**. |
| **Portátil/PC con RTL-SDR USB** | **Dipolo telescópico VHF/FM**, aproximadamente 70–75 cm por brazo cerca de 100 MHz, preferiblemente junto a una ventana y lejos de interferencias. | RTL-SDR USB, `rtl_fm`, `ffmpeg` y `fm_server.py`. Es el modo FM experimental implementado en esta rama. |
| **Portátil/PC, señal FM fuerte** | Antena telescópica de aproximadamente **75 cm** conectada al receptor SDR, si tiene conector y plano de tierra adecuados. | Receptor SDR: la antena Wi-Fi del portátil no sustituye al sintonizador FM. |
| **iPhone/iPad** | No hay antena interna FM accesible universalmente a FLCO. | Un receptor externo y una integración nativa específica; **no implementado**. |

Las medidas son orientativas: a 100 MHz, un cuarto de longitud de onda son unos **75 cm**, útil como longitud inicial de cada brazo de un dipolo de media onda o de un elemento vertical de cuarto de onda. Ajusta longitud, orientación y ubicación según la recepción. **La antena no proporciona Internet ni lo necesita**, pero sí requiere un receptor capaz de demodular FM.

Referencias: [guía de antenas dipolo RTL-SDR](https://www.rtl-sdr.com/using-our-new-dipole-antenna-kit/), [Huawei: requisitos de auriculares y chip FM](https://consumer.huawei.com/ph/support/content/en-us15805916/).

## Estado de las pruebas (sin hardware)

Se ha revisado el código del servidor y el escáner Android. Se han añadido pruebas automáticas en `tests/test_fm_server.py` para validar frecuencias permitidas, entradas inválidas, dependencias y vinculación exclusiva a localhost. Ejecutar:

```bash
python3 -m unittest discover -s tests -p 'test_fm_server.py' -v
python3 -m py_compile fm_server.py
node --check web/fm.js
```

**No se ha confirmado todavía la ejecución satisfactoria de esas pruebas ni la compilación Android.** Tampoco se ha conectado un RTL-SDR real, verificado audio, realizado escaneo de emisoras FM por antena ni probado el receptor FM interno de teléfonos. Hasta completar esas comprobaciones, el soporte FM real debe considerarse **experimental, no verificado**. Detectar un dispositivo USB no equivale a recibir radio.

## Probar FLCO sin antena (simulación de audio)

Abre la interfaz web y pulsa **«Probar sin antena (simulación)»** en **FM por antena**. FLCO genera un tono de prueba con Web Audio, sin Internet, receptor USB ni antena. Al cambiar la frecuencia, cambia el tono; los botones de navegación permiten recorrer el dial. Pulsa **«Detener FM»** para silenciarlo.

**No es una emisora real**: el sonido es generado matemáticamente y no demuestra recepción de ondas, calidad de señal ni compatibilidad del móvil. El botón de recepción FM real permanece separado y solo se habilita si el servidor local detecta las herramientas de software necesarias (esto tampoco garantiza que exista hardware conectado).

### Comprobaciones automáticas

El flujo `.github/workflows/fm-checks.yml` ejecuta pruebas unitarias Python, sintaxis JavaScript y un intento de compilación Android en GitHub Actions al actualizar la rama. Los resultados de CI deben consultarse en la pestaña **Actions** del repositorio; **añadir el flujo no implica que haya pasado**. La prueba acústica del navegador y la recepción física requieren comprobación adicional.


## Búsqueda de señales FM (rama experimental)

Se conserva el **reproductor de emisoras por Internet**, la búsqueda por país, los favoritos y los **archivos locales sin Internet**. En la misma interfaz, el botón **«Buscar señales FM»** realiza un barrido físico de 87,5 a 108 MHz mediante `rtl_power` en un RTL-SDR USB conectado al ordenador. Muestra **frecuencias candidatas**, seleccionables para probar la recepción con `rtl_fm`; no confirma que cada pico corresponda a una emisora audible. La búsqueda necesita receptor SDR y antena adecuados, pero **no necesita Internet**. En teléfonos sin acceso a receptor FM, el navegador no puede hacer ese barrido. El modo de simulación sigue separado y no recibe radio.

Para utilizarlo: instala `rtl-sdr` y `ffmpeg`, conecta RTL-SDR y antena FM, ejecuta `python3 fm_server.py` y abre `http://127.0.0.1:8000/`. **No se ha probado con hardware físico**; los resultados dependen de drivers, ganancia, antena e interferencias. El reproductor online sigue requiriendo Internet.
