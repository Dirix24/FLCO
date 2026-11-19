# FLCO

FLCO Explorer es un proyecto educativo de **Software Defined Radio (SDR)** escrito en Python.

Permite conectar un receptor compatible, visualizar el espectro de radio, mostrar una cascada (*waterfall*), cambiar la frecuencia y realizar un escaneo básico para localizar señales relativamente fuertes.

> ⚠️ Este proyecto está pensado para la experimentación y la recepción de emisiones que sean legalmente accesibles en tu jurisdicción.

## Características

- 📡 Soporte básico para RTL-SDR mediante `pyrtlsdr`
- 📊 Visualización del espectro mediante FFT
- 🌊 Waterfall o cascada de señales
- 🔍 Detector básico de picos/señales
- 🎚️ Cambio de frecuencia desde la consola
- 🔎 Escaneo de un rango de frecuencias
- 🐍 Implementación sencilla en Python
- 📁 Código principal en un único archivo

## Requisitos

### Hardware

Necesitas un receptor SDR compatible, por ejemplo:

- RTL-SDR compatible con las librerías utilizadas

### Software

- Python 3.9 o superior
- NumPy
- Matplotlib
- pyrtlsdr
- SoundDevice (opcional; no es necesario para el espectro y el escaneo)

## Instalación

Clona tu repositorio:

```bash
git clone https://github.com/Dirix24/FLCO.git
cd FLCO
```

Crea un entorno virtual:

```bash
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Instala las dependencias:

```bash
pip install numpy matplotlib pyrtlsdr sounddevice
```

También puedes utilizar el archivo `requirements.txt` incluido:

```bash
pip install -r requirements.txt
```

## Ejecución

Conecta tu receptor SDR y ejecuta:

```bash
python opensdr_explorer.py
```

## Comandos

### Cambiar frecuencia

```text
freq 100.5
```

Esto intenta sintonizar 100.5 MHz.

### Escanear un rango

```text
scan 88 108
```

Realiza un escaneo básico entre 88 MHz y 108 MHz y muestra las señales con mayor potencia relativa.

### Ayuda

```text
help
```

### Salir

```text
quit
```

## Estructura del proyecto

```text
opensdr-explorer/
│
├── opensdr_explorer.py
├── requirements.txt
├── README.md
├── LICENSE
└── .gitignore
```

## Funcionamiento

El programa recibe muestras IQ desde el dispositivo SDR.

Después:

1. Se aplica una ventana.
2. Se calcula una FFT.
3. Se convierte el resultado a una escala logarítmica aproximada.
4. Se representa el espectro.
5. Se añaden las nuevas líneas al waterfall.
6. Se buscan picos por encima de un umbral relativo.

## Comprobaciones sin hardware

Puedes comprobar la sintaxis y la validación de frecuencias con la biblioteca estándar:

```bash
python -m unittest discover -s tests -v
```

Estas pruebas **no sustituyen** una validación con un RTL-SDR físico. El rango de sintonización admitido por el programa es orientativo (24–1766 MHz); depende del receptor concreto.

El escaneo es bloqueante mientras mantiene el acceso exclusivo al receptor y restaura la frecuencia anterior al finalizar. No se recomienda utilizar el dispositivo desde otros programas simultáneamente.

## Limitaciones actuales

Este proyecto es un MVP educativo. Todavía puede mejorarse en varios aspectos:

- Mejor interfaz gráfica con PySide6.
- Controles visuales para frecuencia y ganancia.
- Selección de dispositivo SDR.
- Escáner no bloqueante.
- Mejor detección de señales.
- Configuración persistente.
- Lista de favoritos.
- Grabación de datos IQ para experimentación.
- Soporte adicional mediante SoapySDR.
- Procesamiento DSP más avanzado para formatos abiertos compatibles.

## Posibles mejoras

Una futura versión podría incluir:

```text
┌──────────────────────────────────────────────┐
│ OpenSDR Explorer                             │
├──────────────────────────────────────────────┤
│ Dispositivo: [ RTL-SDR ▼ ]                   │
│ Frecuencia: [ 100.500 MHz ] [ Sintonizar ]   │
│ Ganancia:    [ Auto ▼ ]                      │
├──────────────────────────────────────────────┤
│                                              │
│              ESPECTRO                        │
│                                              │
├──────────────────────────────────────────────┤
│              WATERFALL                       │
│                                              │
├──────────────────────────────────────────────┤
│ Señales detectadas                           │
│ • 99.500 MHz                                 │
│ • 100.500 MHz                                │
│ • 101.700 MHz                                │
└──────────────────────────────────────────────┘
```

## Solución de problemas

### No se detecta el RTL-SDR

Comprueba:

- Que el dispositivo está conectado.
- Que el sistema operativo reconoce el dispositivo.
- Que los controladores necesarios están instalados.
- Que ninguna otra aplicación está utilizando el SDR.

### Error al instalar pyrtlsdr

En algunos sistemas necesitas instalar previamente las bibliotecas y controladores de RTL-SDR.

Consulta la documentación de tu sistema operativo y del fabricante del hardware para realizar una instalación compatible.

### El gráfico funciona lentamente

Puedes reducir:

```python
FFT_SIZE = 4096
```

Por ejemplo:

```python
FFT_SIZE = 2048
```

También puedes aumentar el intervalo de actualización:

```python
interval=250
```

## Uso responsable

El software SDR puede recibir muchas clases de emisiones dependiendo del hardware y de la legislación local.

Este proyecto no está diseñado para:

- Romper cifrado.
- Eludir mecanismos de seguridad.
- Obtener acceso a comunicaciones protegidas.
- Interferir, transmitir o bloquear comunicaciones.

Utiliza el proyecto únicamente de acuerdo con las leyes y regulaciones aplicables.

## Contribuciones

Las mejoras y contribuciones son bienvenidas.

Ideas especialmente interesantes:

- Mejor interfaz gráfica.
- Mejor rendimiento.
- Soporte para más dispositivos SDR.
- Tests automatizados.
- Documentación.
- Mejor detector de señales.
- Procesamiento de señales abiertas y legalmente accesibles.

## Licencia

Puedes utilizar una licencia MIT para un proyecto abierto y sencillo.

Crea un archivo `LICENSE` con la licencia que prefieras antes de publicar el repositorio.

---

**FLCO** — proyecto educativo de exploración del espectro mediante SDR.
