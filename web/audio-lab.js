"use strict";
// Audio generado físicamente por el navegador (altavoces), NO recepción SDR ni transmisión RF.
(function () {
  const $ = id => document.getElementById(id);
  let context = null, oscillator = null, gain = null;
  function stop() {
    if (oscillator) {
      try { oscillator.stop(); } catch (_) {}
      oscillator.disconnect();
      oscillator = null;
    }
    if (gain) { gain.disconnect(); gain = null; }
    $("tone-info").textContent = "Audio de prueba detenido.";
  }
  $("play-tone").addEventListener("click", async () => {
    stop();
    const type = $("waveform").value;
    const hz = Number($("signal-frequency").value);
    if (!Number.isFinite(hz) || hz < 10 || hz > 2000) {
      $("tone-info").textContent = "Introduce una frecuencia válida de 10 a 2000 Hz.";
      return;
    }
    if (type === "noise" || type === "am") {
      $("tone-info").textContent = "La escucha de prueba admite onda senoidal o cuadrada. El ruido y la AM se visualizan sin sonido.";
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      $("tone-info").textContent = "Este navegador no admite Web Audio.";
      return;
    }
    try {
      if (!context) context = new AudioContextClass();
      await context.resume();
      oscillator = context.createOscillator();
      gain = context.createGain();
      oscillator.type = type === "square" ? "square" : "sine";
      oscillator.frequency.value = hz;
      gain.gain.value = 0.025;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      $("tone-info").textContent = `Sonando ${type === "square" ? "onda cuadrada" : "onda senoidal"} a ${hz} Hz por los altavoces. Volumen limitado. Pulsa Detener tono para finalizar.`;
    } catch (_) {
      stop();
      $("tone-info").textContent = "No se pudo iniciar el audio de prueba.";
    }
  });
  $("stop-tone").addEventListener("click", stop);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  window.addEventListener("pagehide", stop);
  const queries = {news:"noticias",sports:"deportes",music:"música",all:"España"};
  document.querySelectorAll("[data-browse]").forEach(button => {
    button.addEventListener("click", () => {
      const query = queries[button.dataset.browse];
      if (!query) return;
      $("query").value = query;
      $("search-form").requestSubmit();
    });
  });
})();
