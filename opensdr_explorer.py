#!/usr/bin/env python3
"""
OpenSDR Explorer - MVP en un único archivo.

Funciones:
- RTL-SDR
- Espectro FFT
- Waterfall
- Detector básico de señales
- Sintonización
- Demodulación FM básica para emisiones abiertas

Instalación:
pip install numpy matplotlib pyrtlsdr sounddevice
"""

import sys
import threading
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from rtlsdr import RtlSdr

try:
    import sounddevice as sd
    AUDIO_AVAILABLE = True
except ImportError:
    AUDIO_AVAILABLE = False

CENTER_FREQUENCY = 100.0e6
SAMPLE_RATE = 2.4e6
GAIN = "auto"
FFT_SIZE = 4096
WATERFALL_LINES = 150

sdr = None
running = True
waterfall = np.zeros((WATERFALL_LINES, FFT_SIZE), dtype=np.float32)

def connect_sdr():
    global sdr
    print("[+] Conectando RTL-SDR...")
    try:
        sdr = RtlSdr()
        sdr.sample_rate = SAMPLE_RATE
        sdr.center_freq = CENTER_FREQUENCY
        sdr.gain = GAIN
        print("[+] RTL-SDR conectado")
        print(f"[+] Frecuencia: {CENTER_FREQUENCY / 1e6:.3f} MHz")
    except Exception as e:
        print("\n[ERROR] No se pudo conectar al RTL-SDR")
        print(e)
        sys.exit(1)

def read_samples():
    if sdr is None:
        return None
    try:
        return sdr.read_samples(FFT_SIZE)
    except Exception as e:
        print("Error leyendo SDR:", e)
        return None

def calculate_spectrum(samples):
    if samples is None:
        return None
    window = np.hanning(len(samples))
    spectrum = np.fft.fftshift(np.fft.fft(samples * window))
    return 20 * np.log10(np.abs(spectrum) + 1e-12)

def get_frequency_axis():
    return np.linspace(
        CENTER_FREQUENCY - SAMPLE_RATE / 2,
        CENTER_FREQUENCY + SAMPLE_RATE / 2,
        FFT_SIZE
    ) / 1e6

def detect_signals(spectrum):
    average = np.mean(spectrum)
    threshold = average + 12
    peaks = np.where(spectrum > threshold)[0]
    frequencies = get_frequency_axis()
    detected = []

    if len(peaks):
        groups = np.split(peaks, np.where(np.diff(peaks) > 1)[0] + 1)
        for group in groups:
            if len(group):
                index = group[np.argmax(spectrum[group])]
                detected.append((frequencies[index], spectrum[index]))
    return detected

def fm_demodulate(samples):
    return np.diff(np.unwrap(np.angle(samples)))

def set_frequency(mhz):
    global CENTER_FREQUENCY
    try:
        freq = float(mhz) * 1e6
        CENTER_FREQUENCY = freq
        sdr.center_freq = freq
        print(f"[+] Nueva frecuencia: {freq / 1e6:.3f} MHz")
    except Exception as e:
        print("Error cambiando frecuencia:", e)

def scan_range(start_mhz, end_mhz, step_khz=100):
    print(f"\n[SCAN] {start_mhz} MHz -> {end_mhz} MHz")
    frequencies = np.arange(start_mhz * 1e6, end_mhz * 1e6, step_khz * 1e3)
    results = []

    for frequency in frequencies:
        if not running:
            break
        try:
            sdr.center_freq = frequency
            samples = read_samples()
            if samples is not None:
                power = np.mean(np.abs(samples) ** 2)
                results.append((frequency / 1e6, power))
        except Exception as e:
            print(e)

    results.sort(key=lambda x: x[1], reverse=True)
    print("\n===== SEÑALES MÁS FUERTES =====")
    for freq, power in results[:10]:
        print(f"{freq:.4f} MHz Power: {power:.6f}")
    print("===============================\n")
    return results

fig = plt.figure(figsize=(12, 8))
fig.canvas.manager.set_window_title("OpenSDR Explorer")
ax_spectrum = plt.subplot(2, 1, 1)
ax_waterfall = plt.subplot(2, 1, 2)

def update(frame):
    global waterfall
    samples = read_samples()
    if samples is None:
        return

    spectrum = calculate_spectrum(samples)
    frequencies = get_frequency_axis()

    ax_spectrum.clear()
    ax_spectrum.plot(frequencies, spectrum)
    ax_spectrum.set_title(
        f"OpenSDR Explorer - {CENTER_FREQUENCY / 1e6:.3f} MHz"
    )
    ax_spectrum.set_xlabel("Frecuencia (MHz)")
    ax_spectrum.set_ylabel("Potencia (dB)")
    ax_spectrum.grid(True)

    signals = detect_signals(spectrum)
    for freq, power in signals[:10]:
        ax_spectrum.plot(freq, power, "ro")

    waterfall[:-1] = waterfall[1:]
    waterfall[-1] = spectrum

    ax_waterfall.clear()
    ax_waterfall.imshow(
        waterfall,
        aspect="auto",
        origin="lower",
        extent=[frequencies[0], frequencies[-1], 0, WATERFALL_LINES]
    )
    ax_waterfall.set_title("Waterfall")
    ax_waterfall.set_xlabel("Frecuencia (MHz)")
    ax_waterfall.set_ylabel("Tiempo")

def console_thread():
    global running
    print("""
========================================
         OpenSDR Explorer
========================================
Comandos:
freq 100.5       Cambiar frecuencia
scan 88 108      Escanear rango
help             Mostrar ayuda
quit             Salir
========================================
""")

    while running:
        try:
            command = input("> ").strip()
            if not command:
                continue
            parts = command.split()

            if parts[0] == "freq":
                if len(parts) < 2:
                    print("Uso: freq 100.5")
                else:
                    set_frequency(parts[1])

            elif parts[0] == "scan":
                if len(parts) < 3:
                    print("Uso: scan 88 108")
                else:
                    scan_range(float(parts[1]), float(parts[2]))

            elif parts[0] == "help":
                print("freq <MHz>\nscan <inicio MHz> <fin MHz>\nquit")

            elif parts[0] == "quit":
                running = False
                plt.close()
                break

            else:
                print("Comando desconocido")

        except KeyboardInterrupt:
            running = False
            plt.close()
            break
        except Exception as e:
            print("Error:", e)

def main():
    global running
    connect_sdr()

    thread = threading.Thread(target=console_thread, daemon=True)
    thread.start()

    animation = FuncAnimation(
        fig, update, interval=150, cache_frame_data=False
    )

    plt.tight_layout()

    try:
        plt.show()
    except KeyboardInterrupt:
        pass
    finally:
        running = False
        if sdr:
            try:
                sdr.close()
            except Exception:
                pass
        print("OpenSDR Explorer cerrado")

if __name__ == "__main__":
    main()
