#!/usr/bin/env python3
"""Servidor FLCO local: sintonización FM con RTL-SDR y audio MP3 por localhost.

Requiere rtl_fm (rtl-sdr), ffmpeg y un receptor RTL-SDR USB compatible.
No utiliza Internet; sirve únicamente en 127.0.0.1.
"""
import argparse
import json
import shutil
import subprocess
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

WEB = Path(__file__).resolve().parent / "web"
MIN_FM = 87.5
MAX_FM = 108.0


def parse_frequency(raw):
    try:
        freq = float(raw)
    except (ValueError, TypeError):
        raise ValueError("Frecuencia inválida") from None
    if not MIN_FM <= freq <= MAX_FM:
        raise ValueError("La frecuencia debe estar entre 87.5 y 108.0 MHz")
    return round(freq, 1)


def receiver_available():
    return bool(shutil.which("rtl_fm") and shutil.which("ffmpeg"))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB), **kwargs)

    def do_GET(self):
        parsed = urlsplit(self.path)
        if parsed.path == "/api/fm/status":
            self.json_response(200, {
                "available": receiver_available(),
                "receiver": "RTL-SDR USB",
                "range_mhz": [MIN_FM, MAX_FM],
                "message": "Conecta un RTL-SDR y su antena FM; se necesitan rtl_fm y ffmpeg."
            })
            return
        if parsed.path == "/api/fm/stream":
            try:
                frequency = parse_frequency(parse_qs(parsed.query).get("freq", [None])[0])
            except ValueError as error:
                self.json_response(400, {"error": str(error)})
                return
            if not receiver_available():
                self.json_response(503, {"error": "Instala rtl_fm y ffmpeg y conecta un RTL-SDR USB."})
                return
            self.stream_fm(frequency)
            return
        super().do_GET()

    def json_response(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def stream_fm(self, frequency):
        # rtl_fm produce muestras PCM de 16 bits mono; ffmpeg las convierte a MP3.
        # Se evita shell=True y se valida estrictamente la frecuencia.
        rtl = None
        encoder = None
        try:
            rtl = subprocess.Popen(
                ["rtl_fm", "-f", f"{frequency:.1f}M", "-M", "wbfm",
                 "-s", "200000", "-r", "48000", "-E", "deemp"],
                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL
            )
            encoder = subprocess.Popen(
                ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
                 "-f", "s16le", "-ar", "48000", "-ac", "1", "-i", "pipe:0",
                 "-codec:a", "libmp3lame", "-b:a", "128k", "-f", "mp3", "pipe:1"],
                stdin=rtl.stdout, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL
            )
            rtl.stdout.close()
            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Cache-Control", "no-store, no-cache")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            while True:
                data = encoder.stdout.read(16384)
                if not data:
                    break
                self.wfile.write(data)
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass
        except OSError as error:
            print(f"Error al abrir el receptor FM: {error}")
        finally:
            for proc in (encoder, rtl):
                if proc is not None:
                    if proc.poll() is None:
                        proc.terminate()
                    try:
                        proc.wait(timeout=2)
                    except subprocess.TimeoutExpired:
                        proc.kill()
                        proc.wait()

    def log_message(self, fmt, *args):
        super().log_message(fmt, *args)


def main():
    parser = argparse.ArgumentParser(description="FLCO: radio FM local sin Internet con RTL-SDR")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("El puerto debe estar entre 1 y 65535")
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"FLCO FM local: http://127.0.0.1:{args.port}/")
    print("Solo localhost. Para FM real conecta un RTL-SDR USB y antena FM.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
