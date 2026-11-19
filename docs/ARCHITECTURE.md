# Arquitectura objetivo de FLCO

## Estado de partida
El MVP existente usa `opensdr_explorer.py` (Python, NumPy, Matplotlib, pyrtlsdr) con FFT, waterfall, sintonización y escaneo. No dispone de audio FM reproducible completo, servidor web ni interfaz móvil. La estabilización de este módulo se revisa por separado en el PR #1.

## Principios
- **Primero escuchar**: la radio por Internet debe funcionar sin hardware adicional.
- **Misma interfaz en ordenador y móvil**: web adaptable, sin asumir acceso USB desde el navegador.
- **Privacidad**: ubicación desactivada por defecto; consentimiento específico, sin historial de posiciones por defecto.
- **Recepción responsable**: limitarse a señales y emisoras accesibles legalmente. El laboratorio crea señales sintéticas en memoria; no transmite por RF.
- **Seguridad**: ningún endpoint SDR expuesto públicamente por defecto; futura API local con autenticación y controles de acceso.
- **Progresión comprobable**: no anunciar funcionalidades hasta que tengan pruebas y validación.

## Módulos propuestos

```text
Navegador PC / teléfono
    ├── Radio por Internet (búsqueda, audio, favoritos)
    ├── Panel de conexión (métricas separadas)
    ├── Ubicación opcional (emisoras sugeridas, no cobertura garantizada)
    ├── Espectro / waterfall / interferencias
    └── Laboratorio de señales sintéticas
                   │
            API local autenticada (fase posterior)
                   │
            Servicio Python en PC
                   ├── Control exclusivo de SDR
                   ├── DSP: FFT, FM, filtrado y detección
                   ├── Audio FM local / retransmisión autorizada en LAN
                   └── Simulador y pruebas sin hardware
```

## Distinciones técnicas
- **Velocidad de Internet**: descarga/subida/latencia requieren pruebas de red y no miden la intensidad RF.
- **Wi-Fi y datos móviles**: métricas RF solo si el sistema operativo y sus permisos las exponen.
- **Ubicación**: un catálogo de emisoras cercanas no garantiza recepción física; el escaneo SDR sí permite medir señales en la antena.
- **Teléfono**: para captar RF por antena requiere un receptor compatible o conectarse a un servicio SDR del ordenador.
- **Generar señales**: la síntesis digital es distinta de transmitir ondas de radio; transmisión no forma parte del alcance inicial.

## Fases y criterios de aceptación
1. **Web radio (este PR)**: interfaz adaptable, directorio público externo, audio HTML5, URL manual y favoritos locales. Validar navegador PC y Android/iOS; disponibilidad de emisoras y CORS dependen del proveedor.
2. **SDR y audio FM**: extraer el código del MVP a un paquete Python, bloquear acceso concurrente, incorporar pruebas con muestras sintéticas y un demodulador FM reproducible. Probar con RTL-SDR real.
3. **Espectro e interferencias**: FFT calibrada en unidades relativas, ruido, ocupación y detección; evitar confundir picos con emisoras identificadas.
4. **Conexión**: medir latencia y velocidad mediante pruebas explícitas con aviso de consumo de datos; métricas Wi-Fi opcionales cuando existan.
5. **Ubicación**: solicitar permiso solo al activar la función, permitir búsqueda manual de ciudad y no almacenar coordenadas por defecto.
6. **Laboratorio**: generar tonos, AM/FM simuladas y ruido de forma local; comparar espectros y exportar muestras.
7. **Integración**: API autenticada, streaming local y pruebas de seguridad; documentación de despliegue, CI y empaquetado.

## Limitaciones de la fase 1
- No incluye recepción RTL-SDR en el navegador ni audio FM por antena.
- El directorio Radio Browser es un servicio de terceros: no se garantiza su disponibilidad ni que sus flujos admitan CORS o sean reproducibles.
- Solo se aceptan flujos HTTPS para evitar contenido mixto en despliegues HTTPS; algunos formatos no son compatibles con HTMLAudioElement.
- Los favoritos se guardan en el navegador, no se sincronizan entre dispositivos.
- No hay backend ni transmisión de radio.

## Prototipo de descubrimiento y simulación
La rama `feature/flco-spectrum-discovery-phase-3` añade búsqueda por país, consulta opcional por geolocalización a Radio Browser y un espectro matemático con ruido e interferencia simulados. La geolocalización requiere contexto seguro (HTTPS o localhost), consentimiento explícito y conectividad con el directorio. **No se almacenan coordenadas en FLCO**, pero el servicio externo recibe la ubicación enviada para realizar la búsqueda. No se afirma que las emisoras encontradas sean captables por antena. El espectro simulado no representa mediciones reales ni frecuencias calibradas.
