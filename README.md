# FLCO — Radio inteligente y laboratorio de señales

**FLCO** es un proyecto de código abierto en desarrollo para **buscar y escuchar emisoras de radio**, explorar señales con un receptor SDR y aprender sobre radiofrecuencia. Su objetivo es funcionar desde **ordenadores y teléfonos** mediante una interfaz web, con funciones de hardware disponibles cuando se conecte un receptor compatible.

> **Estado: prototipo / desarrollo.** La interfaz de radio por Internet está implementada en la rama `feature/flco-radio-platform-phase-1`, pero su reproducción en navegadores y dispositivos reales todavía necesita validación. El explorador RTL-SDR existente continúa como módulo independiente. No existe aún una versión 1.0 estable.

## Qué funciona hoy y qué está pendiente

| Función | Estado | Observaciones |
| --- | --- | --- |
| Búsqueda de emisoras por Internet | Prototipo | Directorio externo Radio Browser |
| Reproducción de emisoras en navegador | Prototipo | Flujos HTTPS compatibles con HTML5; no todas las emisoras funcionarán |
| Introducir una URL de audio | Prototipo | Solo enlaces HTTPS |
| Favoritos | Prototipo | Guardados en el navegador local |
| Interfaz adaptable a PC y móvil | Prototipo | Falta validación en dispositivos |
| Espectro FFT y waterfall con RTL-SDR | MVP existente | Script Python independiente; requiere hardware |
| Escaneo de frecuencias con RTL-SDR | MVP existente | Detecta niveles relativos, no identifica emisoras automáticamente |
| Escuchar audio FM captado por RTL-SDR | Pendiente | La función de demodulación existente no constituye un reproductor completo |
| Laboratorio de señales sintéticas (onda, AM, ruido) | Prototipo | Solo simulación digital, sin RF |
| Tiempo de respuesta HTTP al servidor web | Prototipo | No mide velocidad de Internet; localhost es local |
| Detección y análisis de interferencias | Pendiente | Se desarrollará con DSP y pruebas |
| Velocidad de conexión y latencia | Pendiente | Distinta de la potencia de una señal de radio |
| Emisoras sugeridas por ubicación | Pendiente | Consentimiento explícito y búsqueda manual alternativa |
| Laboratorio de señales sintéticas | Pendiente | Generación digital local, sin transmisión por antena |
| Conexión web segura al SDR del ordenador | Pendiente | API autenticada y permisos |

## Empezar sin antena: radio por Internet

Necesitas Python 3 para iniciar el servidor web local; **no necesitas RTL-SDR** para este modo.

```bash
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
git switch feature/flco-radio-platform-phase-1
python -m http.server 8000 --directory web
```

En el ordenador, abre **http://localhost:8000**.

Para usar un teléfono conectado a la misma red, abre `http://IP-LOCAL-DEL-ORDENADOR:8000`, sustituyendo el marcador por la dirección LAN del ordenador. Puede ser necesario permitir el acceso en el cortafuegos. **El servidor de desarrollo no debe exponerse a Internet.** Para un despliegue público se requiere un servidor HTTPS adecuado.

Desde la interfaz puedes buscar emisoras, intentar reproducirlas, introducir un enlace de audio HTTPS y guardar favoritos. La disponibilidad de los resultados depende del directorio externo y de cada emisora.

## Explorar frecuencias con antena: modo RTL-SDR existente

Necesitas un receptor **RTL-SDR USB compatible**, antena y los controladores de tu sistema. Un ordenador o teléfono corriente no recibe FM por software si carece de receptor de radio compatible.

```bash
python -m venv .venv
# Linux / macOS:
source .venv/bin/activate
# Windows (PowerShell):
# .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
python opensdr_explorer.py
```

Comandos de la consola del explorador:

```text
freq 100.5
scan 88 108
help
quit
```

Este módulo representa espectros y busca picos de potencia. **No reproduce todavía el audio de las emisoras FM recibidas por antena.** Sus mejoras de estabilidad están propuestas por separado en el [PR #1](https://github.com/Dirix24/FLCO/pull/1).

## Estructura actual

```text
FLCO/
├── opensdr_explorer.py       # MVP SDR original (Python)
├── requirements.txt          # Dependencias del MVP SDR
├── web/
│   ├── index.html            # Interfaz de radio por Internet
│   ├── styles.css
│   ├── lab.js              # Simulador y prueba HTTP
│   ├── app.js
│   └── README.md             # Instrucciones de la interfaz
├── docs/
│   └── ARCHITECTURE.md       # Diseño modular y fases
└── .github/workflows/
    └── web-checks.yml        # Comprobación de sintaxis JavaScript
```

## Plan de desarrollo

1. **Radio por Internet:** búsqueda, reproducción, favoritos y experiencia móvil; simulador y respuesta HTTP básica añadidos como prototipos.
2. **Radio por antena:** estabilizar el SDR, añadir demodulación y audio FM real.
3. **Espectro e interferencias:** mediciones de ruido, señales y ocupación de bandas.
4. **Conexión:** velocidad, latencia y estabilidad de Internet; métricas inalámbricas solo cuando el dispositivo lo permita.
5. **Ubicación opcional:** emisoras por ciudad o geolocalización consentida; la proximidad no garantiza recepción.
6. **Laboratorio:** señales digitales sintéticas, tonos, AM/FM simulada y visualización.
7. **Integración y versión estable:** API local autenticada, pruebas con hardware y navegadores, empaquetado y documentación.

Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para los detalles técnicos y criterios de aceptación.

## Comprobaciones

Para la interfaz web:

```bash
node --check web/app.js
```

Para comprobar manualmente el reproductor, inicia el servidor web, busca una emisora, prueba el audio y verifica los favoritos en un navegador de escritorio y otro móvil. La comprobación de sintaxis **no demuestra** que el audio funcione.

## Privacidad, legalidad y límites

- La fase web actual **no solicita ubicación**. Una futura función de ubicación deberá pedir permiso y permitir introducir la ciudad manualmente.
- Los favoritos se guardan en el almacenamiento local del navegador, sin cuenta ni sincronización.
- La búsqueda consulta un directorio de terceros; el navegador puede conectar directamente con las emisoras elegidas.
- No se debe acceder a comunicaciones privadas o protegidas sin autorización.
- **Generar señales sintéticas no equivale a transmitir radiofrecuencia.** FLCO no transmite por antena.
- Las mediciones de velocidad de Internet no son mediciones de intensidad de radio.
- Las frecuencias y la recepción real dependen del hardware, la antena, el entorno y la normativa aplicable.

## Desarrollo y contribuciones

La implementación de radio por Internet se revisa en el [PR #2](https://github.com/Dirix24/FLCO/pull/2), que permanece **en borrador**. Los cambios no deben fusionarse hasta superar las pruebas y la revisión técnica.

Si quieres contribuir, abre un issue con el problema, los pasos para reproducirlo, tu sistema operativo y el hardware SDR si corresponde.

## Licencia

**Pendiente de confirmar por el titular del repositorio.** No se debe asumir una licencia MIT ni ninguna otra sin comprobar que existe un archivo de licencia válido en el proyecto.
