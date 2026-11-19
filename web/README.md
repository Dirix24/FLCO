# FLCO Radio — fase 1 (prototipo)

Interfaz adaptable a ordenadores y teléfonos para buscar y escuchar emisoras públicas por Internet.

## Iniciar
Desde la raíz del repositorio:

```bash
python -m http.server 8000 --directory web
```

Abre `http://localhost:8000` en el ordenador. Para abrirla desde el teléfono, ambos dispositivos deben estar en la misma red y debes usar la dirección LAN del ordenador (por ejemplo, `http://IP-DEL-ORDENADOR:8000`). **No expongas este servidor de desarrollo a Internet**. En móvil, el audio por HTTP puede tener restricciones; para desplegarlo públicamente utiliza HTTPS.

## Funciones
- Buscar emisoras mediante Radio Browser (servicio de terceros).
- Reproducir flujos HTTPS compatibles con el navegador.
- Introducir una URL de audio manualmente.
- Guardar favoritos en el navegador mediante localStorage.
- Interfaz adaptable a pantallas pequeñas.

## Límites
El directorio externo y los flujos pueden fallar o estar bloqueados. No todas las URLs son archivos de audio compatibles. No hay soporte de listas M3U/PLS, autenticación, receptor SDR web, medidor de red, ubicación ni generador de señales todavía.

## Verificaciones
```bash
node --check web/app.js
python -m unittest discover -s tests -v
```
Revisar manualmente búsqueda, reproducción, errores de red, favoritos, navegación por teclado y visualización en móvil. Estas comprobaciones deben realizarse antes de declarar estable la fase 1.
