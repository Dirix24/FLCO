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
- Búsqueda opcional por país y por proximidad geográfica con consentimiento; las coordenadas se envían a Radio Browser y no se guardan localmente.
- Espectro simulado con señales y ruido, sin SDR ni calibración RF.
- Laboratorio de señales sintéticas: seno, cuadrada, AM y ruido; no transmite RF.
- Prueba voluntaria de tiempo de respuesta HTTP al propio servidor; no mide descarga/subida ni ping de Internet.

## Límites
El directorio externo y los flujos pueden fallar o estar bloqueados. No todas las URLs son archivos de audio compatibles. No hay soporte de listas M3U/PLS, autenticación, receptor SDR web, medidor real de velocidad de red, recepción de RF en la web ni transmisión RF todavía.

## Verificaciones
```bash
node --check web/app.js
node --check web/lab.js
node --check web/explore.js
python -m unittest discover -s tests -v
```
Revisar manualmente búsqueda, reproducción, errores de red, favoritos, navegación por teclado y visualización en móvil. Estas comprobaciones deben realizarse antes de declarar estable la fase 1.

## Buscador único
Escribe «España», «noticias de España», «deportes» o «rock México» en el mismo campo. FLCO interpreta países y géneros comunes y muestra la categoría según las etiquetas del directorio externo, que pueden ser incompletas o erróneas. Para búsquedas no reconocidas se busca por nombre de emisora. El ruido simulado no tiene frecuencia tonal.
