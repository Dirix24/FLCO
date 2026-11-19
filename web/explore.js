"use strict";
// Visualización educativa: ninguna muestra procede de un receptor físico.
(function () {
  const $ = id => document.getElementById(id);
  const canvas = $("spectrum-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  function gaussian(x, center, width) {
    const d = (x - center) / width;
    return Math.exp(-0.5 * d * d);
  }
  function render() {
    const noise = Number($("interference").value) / 100;
    const values = new Float32Array(380);
    for (let i = 0; i < values.length; i++) {
      const x = i / (values.length - 1);
      const floor = 0.06 + noise * 0.26 + Math.random() * (0.07 + noise * 0.18);
      const stationA = 0.65 * gaussian(x, 0.23, 0.012);
      const stationB = 0.49 * gaussian(x, 0.58, 0.022);
      const interference = noise * 0.7 * gaussian(x, 0.60, 0.05);
      values[i] = Math.min(1, floor + stationA + stationB + interference);
    }
    ctx.fillStyle = "#0e192b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#41516b";
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const y = canvas.height * i / 5;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    ctx.strokeStyle = "#55b9e6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((value, i) => {
      const x = i / (values.length - 1) * canvas.width;
      const y = (1 - value) * (canvas.height - 12) + 6;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    $("spectrum-info").textContent = `Simulación: ruido ${Math.round(noise * 100)}%; dos señales de prueba y una interferencia solapada. Potencia relativa sin calibración; no son MHz ni dBm reales.`;
  }
  $("simulate-spectrum").addEventListener("click", render);

  const nearbyButton = $("nearby-stations");
  nearbyButton.addEventListener("click", () => {
    const output = $("nearby-info");
    const results = $("nearby-results");
    results.replaceChildren();
    if (!navigator.geolocation) {
      output.textContent = "Este navegador no ofrece geolocalización.";
      return;
    }
    nearbyButton.disabled = true;
    output.textContent = "Solicitando permiso de ubicación...";
    navigator.geolocation.getCurrentPosition(async position => {
      const lat = position.coords.latitude, lon = position.coords.longitude;
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        output.textContent = "Coordenadas inválidas."; nearbyButton.disabled = false; return;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const url = new URL("https://de1.api.radio-browser.info/json/stations/search");
        url.searchParams.set("geo_lat", String(lat));
        url.searchParams.set("geo_long", String(lon));
        url.searchParams.set("geo_distance", "100000");
        url.searchParams.set("hidebroken", "true");
        url.searchParams.set("limit", "20");
        const response = await fetch(url, {signal: controller.signal, headers: {Accept: "application/json"}});
        if (!response.ok) throw new Error("Servicio no disponible");
        const stations = await response.json();
        if (!Array.isArray(stations)) throw new Error("Respuesta inesperada");
        let shown = 0;
        for (const station of stations) {
          let stream;
          try {
            const parsed = new URL(station.url_resolved || station.url);
            if (parsed.protocol !== "https:") continue;
            stream = parsed.href;
          } catch { continue; }
          const item = document.createElement("li");
          const name = document.createElement("span");
          name.textContent = String(station.name || "Emisora").trim();
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = "Escuchar";
          button.addEventListener("click", () => {
            const player = $("player");
            player.pause();
            player.src = stream;
            $("now-playing").textContent = name.textContent;
            player.load();
            player.play().catch(() => { output.textContent = "Pulsa reproducir en el reproductor; el formato podría ser incompatible."; });
          });
          item.append(name, button);
          results.append(item);
          shown++;
        }
        output.textContent = shown ? `El directorio devolvió ${shown} emisoras con flujo HTTPS. No garantiza recepción local por antena.` : "No hay emisoras HTTPS en los resultados de proximidad. Prueba el buscador por país.";
      } catch {
        output.textContent = "No se pudo consultar el directorio. Puedes buscar por país sin compartir tu ubicación.";
      } finally { clearTimeout(timeout); nearbyButton.disabled = false; }
    }, error => {
      output.textContent = error.code === 1 ? "Permiso denegado. Puedes buscar por país sin ubicación." : "No se pudo obtener la ubicación. Comprueba los permisos y el acceso HTTPS.";
      nearbyButton.disabled = false;
    }, {enableHighAccuracy: false, timeout: 10000, maximumAge: 0});
  });
})();
