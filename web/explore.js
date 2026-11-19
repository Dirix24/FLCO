"use strict";
(function () {
  const $ = id => document.getElementById(id);
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
