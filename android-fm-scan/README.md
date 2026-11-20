# FLCO · Diagnóstico Android sin Internet (experimental)

Aplicación nativa Android mínima que examina **localmente** la disponibilidad USB host y dispositivos USB, reconociendo algunos identificadores RTL-SDR (Realtek RTL2832U). No requiere permiso INTERNET ni transmite información.

**No es todavía un receptor FM funcional**. La detección USB no demuestra que el dispositivo pueda sintonizar o reproducir audio: hacen falta permiso USB, controlador, demodulación y una prueba real de recepción. El receptor FM integrado no puede detectarse/controlarse de forma universal con la API pública Android. No inventa un resultado «100 % verificado».

Para compilar: abrir `android-fm-scan` en Android Studio compatible con AGP 8.7.3, instalar SDK 35 y compilar el módulo `app`. No se ha compilado ni probado en dispositivos reales en este entorno.

Siguiente fase: integrar control USB SDR y reproducción FM en la app nativa, además de adaptadores específicos para chips FM internos cuando el fabricante exponga APIs accesibles. Para iOS no existe un acceso general al receptor FM interno desde una aplicación web.
