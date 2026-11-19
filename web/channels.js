"use strict";
// Enlaces a portales oficiales, no retransmisión de señales ni listas IPTV de terceros.
// La numeración es local a FLCO; no implica frecuencia de TDT.
(function () {
  const $ = id => document.getElementById(id);
  const channels = {
    ES: [
      ["La 1","https://www.rtve.es/play/"],
      ["La 2","https://www.rtve.es/play/"],
      ["Canal 24 Horas","https://www.rtve.es/play/"],
      ["Teledeporte","https://www.rtve.es/play/"],
      ["Antena 3","https://www.atresplayer.com/"],
      ["laSexta","https://www.atresplayer.com/"],
      ["Cuatro","https://www.mitele.es/"],
      ["Telecinco","https://www.mitele.es/"]
    ],
    MX: [
      ["Canal Once","https://canalonce.mx/"],
      ["Canal 22","https://canal22.org.mx/"],
      ["TV UNAM","https://tv.unam.mx/"],
      ["SPR","https://www.spr.gob.mx/"]
    ],
    AR: [
      ["TV Pública","https://www.tvpublica.com.ar/"],
      ["Encuentro","https://encuentro.gob.ar/"],
      ["Pakapaka","https://www.pakapaka.gob.ar/"]
    ],
    CO: [
      ["Señal Colombia","https://www.senalcolombia.tv/"],
      ["Canal Institucional","https://www.canalinstitucional.tv/"],
      ["RTVC","https://www.rtvc.gov.co/"]
    ],
    CL: [
      ["TVN","https://www.tvn.cl/"],
      ["24 Horas","https://www.24horas.cl/"],
      ["Chilevisión","https://www.chilevision.cl/"]
    ],
    PE: [
      ["TV Perú","https://www.tvperu.gob.pe/"],
      ["TV Perú Noticias","https://www.tvperu.gob.pe/"],
      ["IRTP","https://www.gob.pe/irtp"]
    ],
    FR: [
      ["France Télévisions","https://www.france.tv/"],
      ["France 24","https://www.france24.com/fr/"],
      ["ARTE","https://www.arte.tv/fr/"]
    ],
    GB: [
      ["BBC iPlayer","https://www.bbc.co.uk/iplayer"],
      ["ITVX","https://www.itv.com/"],
      ["Channel 4","https://www.channel4.com/"]
    ]
  };
  $("tv-country").addEventListener("change", () => {
    const country = $("tv-country").value;
    const target = $("tv-channels");
    target.replaceChildren();
    const entries = channels[country] || [];
    entries.forEach(([name, url], index) => {
      const card = document.createElement("article");
      card.className = "channel-card";
      const number = document.createElement("strong");
      number.textContent = "Canal " + (index + 1);
      const title = document.createElement("span");
      title.textContent = name;
      const link = document.createElement("a");
      link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer";
      link.textContent = "Abrir canal oficial";
      card.append(number,title,link);target.append(card);
    });
    $("tv-status").textContent = entries.length
      ? entries.length + " canales o portales oficiales. El vídeo en directo depende del proveedor, su región y sus condiciones; algunos requieren registro."
      : "Elige un país. Los enlaces no son una lista de frecuencias de antena.";
  });

  const speedInfo = $("speed-info");
  async function measureUpload() {
    const bytes = new Uint8Array(256 * 1024);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const start = performance.now();
    try {
      const response = await fetch(new URL("/__flco_speed_upload", location.href), {
        method: "POST", body: bytes, cache: "no-store", signal: controller.signal
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const seconds = (performance.now()-start)/1000;
      speedInfo.textContent = "Subida al servidor FLCO: " + (bytes.length*8/seconds/1e6).toFixed(2) + " Mbps (aproximado). En localhost no es Internet.";
    } catch (_) {
      speedInfo.textContent = "El servidor no acepta la prueba de subida. python3 -m http.server no admite POST; se necesita un servidor de pruebas compatible.";
    } finally {clearTimeout(timer); $("test-upload").disabled=false;}
  }
  $("test-upload").addEventListener("click", () => {
    $("test-upload").disabled=true;speedInfo.textContent="Probando subida...";
    measureUpload();
  });
  $("test-download").addEventListener("click", async () => {
    const button=$("test-download");button.disabled=true;speedInfo.textContent="Probando descarga...";
    const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),12000);
    try {
      const url=new URL("app.js",location.href);
      url.searchParams.set("speedtest",Date.now().toString());
      const start=performance.now();
      const response=await fetch(url,{cache:"no-store",signal:controller.signal});
      if(!response.ok)throw new Error("HTTP");
      const buffer=await response.arrayBuffer();
      const seconds=(performance.now()-start)/1000;
      speedInfo.textContent="Descarga desde el servidor FLCO: "+(buffer.byteLength*8/seconds/1e6).toFixed(2)+" Mbps ("+buffer.byteLength+" bytes). Muestra pequeña, resultado orientativo; en localhost NO es velocidad de Internet.";
    } catch(_) {speedInfo.textContent="No se pudo medir la descarga desde el servidor.";}
    finally {clearTimeout(timer);button.disabled=false;}
  });
})();
