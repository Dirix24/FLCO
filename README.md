# FLCO — Radio de código abierto

FLCO es una radio web minimalista y adaptable a **MX Linux y móviles**. Permite buscar emisoras públicas por Internet, escucharlas, guardar favoritos, consultar metadatos y visualizar las ondas del audio cuando el navegador permite acceder a las muestras. También permite abrir archivos de audio del dispositivo **sin Internet**.

**Licencia del código: [MIT](LICENSE).** El código es abierto y puede usarse, modificarse y redistribuirse bajo sus condiciones. Las emisiones y contenidos de terceros tienen licencias independientes.

## Funciones

| Función | Estado |
| --- | --- |
| Buscar emisoras por nombre, país o tema en un único campo | Prototipo funcional, depende de Radio Browser |
| Escuchar emisoras y guardar favoritos | Depende de conexión y compatibilidad del flujo |
| Mostrar país, categoría, códec y bitrate declarados | Cuando los proporciona el directorio |
| Ver forma de onda y espectro del audio | Cuando el navegador permite capturar muestras; **no son señales RF** |
| Botón Volver y diseño móvil | Incluidos |
| Abrir FLCO sin conexión | Tras una visita inicial con conexión y caché del navegador |
| Reproducir archivos locales sin conexión | Incluido, formatos compatibles con el navegador |
| Radio FM real por antena sin Internet | Requiere receptor RTL-SDR USB; no integrado en la web |

Se han retirado de la interfaz los paneles de televisión, simulación, pruebas de velocidad y otros controles experimentales. El explorador RTL-SDR Python sigue en el repositorio, independiente de la radio web.

## Iniciar en MX Linux

```bash
sudo apt update
sudo apt install git python3
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
git fetch origin
git switch --track origin/feature/flco-minimal-radio-mobile
python3 -m http.server 8000 --directory web
```

Si ya tienes el repositorio, sustituye `git clone ...` por `cd ~/FLCO`. Abre `http://localhost:8000` en Firefox y actualiza con `Ctrl+Shift+R`. Para detener el servidor pulsa `Ctrl+C`.

## Escuchar y ver ondas

Busca una radio y pulsa **Escuchar**. Debajo del reproductor aparecerán sus metadatos. Pulsa **Ver ondas** cuando el audio esté reproduciéndose. El visualizador usa muestras digitales reales y cálculos de amplitud/espectro; algunos flujos externos no permiten que el navegador capture su audio. Si ocurre, se informa y no se inventan ondas ni interferencias. **No se miden radiofrecuencia, cobertura ni dBm**.

## Uso sin Internet

1. Abre FLCO al menos una vez con conexión desde `http://localhost:8000` o un sitio HTTPS y espera a que el navegador guarde los archivos básicos mediante Service Worker.
2. Después puedes volver a abrir la página desde la misma dirección, siempre que el navegador conserve su caché y la aplicación esté disponible en ese origen.
3. En **Sin Internet**, selecciona un archivo de audio del teléfono u ordenador y reprodúcelo. Los archivos locales no se suben al servidor.
4. Los favoritos siguen visibles si el almacenamiento del navegador se conserva, pero las emisoras de Internet **no pueden emitir sin conexión**.

**Importante:** un servidor local en MX Linux puede funcionar sin salida a Internet mientras el ordenador siga encendido. En el móvil, la primera visita a la dirección local requiere conexión con el ordenador; la caché offline depende del navegador. Sin receptor RTL-SDR, FLCO no puede sintonizar radio FM por antena.

## Explorador RTL-SDR independiente

El repositorio conserva `opensdr_explorer.py` para uso con un RTL-SDR USB. Requiere hardware, controladores y dependencias del sistema:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python opensdr_explorer.py
```

No hay todavía un puente seguro entre el receptor y la interfaz web.

## Verificación

```bash
node --check web/app.js
node --check web/live-media.js
node --check web/offline.js
node --check web/sw.js
```

La sintaxis no sustituye pruebas reales en Firefox, Android y iPhone. La compatibilidad de análisis de audio varía por navegador y emisora.

## Privacidad y contribuciones

Las búsquedas de emisoras consultan el directorio externo Radio Browser. Los favoritos se guardan en el navegador. Los archivos locales se reproducen mediante URL temporal del dispositivo sin subirse. No se solicita ubicación en esta versión. Puedes revisar el código y contribuir mediante GitHub. **No hay fusiones automáticas a `main`.**
