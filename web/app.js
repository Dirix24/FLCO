"use strict";
const DIRECTORY = "https://de1.api.radio-browser.info/json/stations/search";
const KEY = "flco:favorites:v1";
const $ = (id) => document.getElementById(id);
const status = (message) => { $("status").textContent = message; };
const clean = (value) => String(value || "").trim();
function safeStream(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.href : null;
  } catch { return null; }
}
function loadFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter(s => s && safeStream(s.url)).slice(0, 100) : [];
  } catch { return []; }
}
let favorites = loadFavorites();
let stationList = [];
let activeStationIndex = -1;
function saveFavorites() {
  try { localStorage.setItem(KEY, JSON.stringify(favorites)); }
  catch { status("No se pudieron guardar los favoritos en este navegador."); }
}
function play(station) {
  const url = safeStream(station.url);
  if (!url) { status("Se necesita un enlace de audio HTTPS válido."); return; }
  $("now-playing").textContent = clean(station.name) || "Emisora";
  const index = stationList.findIndex(s => s.url === station.url);
  activeStationIndex = index;
  document.dispatchEvent(new CustomEvent("flco:station", {detail:{index, name:clean(station.name), url}}));
  const player = $("player");
  player.pause();
  player.src = url;
  player.load();
  const info = $("station-details");
  if (info) info.textContent = [clean(station.category) || "Categoría no confirmada",clean(station.country),clean(station.codec) ? "Códec: " + station.codec : "",station.bitrate ? "Bitrate declarado: " + station.bitrate + " kbps" : ""].filter(Boolean).join(" · ") + " · Flujo: " + url + " · Estos datos son del directorio, no mediciones RF.";
  player.play().catch(() => status("Pulsa reproducir en el control de audio. Comprueba que el formato sea compatible."));
}
function stationRow(station, target, favoriteMode = false, number = null) {
  const li = document.createElement("li");
  const name = document.createElement("span");
  name.textContent = clean(station.name) || "Emisora sin nombre";
  const details = document.createElement("div");
  details.className = "station-details";
  details.append(name);
  const metadata = [clean(station.category), clean(station.country)].filter(Boolean).join(" · ");
  if (metadata) { const small = document.createElement("small"); small.textContent = metadata; details.append(small); }
  if (number !== null) { const channel = document.createElement("button"); channel.type = "button"; channel.className = "channel-number"; channel.textContent = String(number); channel.setAttribute("aria-label", "Escuchar canal " + number + ": " + (station.name || "Emisora")); channel.addEventListener("click", () => play(station)); li.append(channel); }
  li.append(details);
  const actions = document.createElement("div");
  actions.className = "actions";
  const listen = document.createElement("button");
  listen.type = "button";
  listen.textContent = "Escuchar";
  listen.addEventListener("click", () => play(station));
  actions.append(listen);
  const favorite = document.createElement("button");
  favorite.type = "button";
  favorite.textContent = favoriteMode ? "Quitar" : "☆ Guardar";
  favorite.addEventListener("click", () => {
    if (favoriteMode) favorites = favorites.filter(s => s.url !== station.url);
    else if (!favorites.some(s => s.url === station.url)) favorites.push(station);
    favorites = favorites.slice(-100);
    saveFavorites();
    renderFavorites();
  });
  actions.append(favorite);
  li.append(actions);
  target.append(li);
}
function renderFavorites() {
  const target = $("favorites");
  target.replaceChildren();
  if (!favorites.length) target.textContent = "Aún no hay favoritos.";
  favorites.forEach(station => stationRow(station, target, true));
}
// Interpretación local y explícita de términos habituales; sin IA ni envío de ubicación.
const COUNTRIES = [
  ["españa", "Spain"], ["espana", "Spain"], ["spain", "Spain"],
  ["méxico", "Mexico"], ["mexico", "Mexico"], ["argentina", "Argentina"],
  ["colombia", "Colombia"], ["chile", "Chile"], ["perú", "Peru"],
  ["peru", "Peru"], ["venezuela", "Venezuela"], ["ecuador", "Ecuador"],
  ["uruguay", "Uruguay"], ["bolivia", "Bolivia"], ["paraguay", "Paraguay"],
  ["cuba", "Cuba"], ["estados unidos", "United States"], ["usa", "United States"],
  ["francia", "France"], ["portugal", "Portugal"], ["alemania", "Germany"]
];
const TOPICS = [
  {words: ["noticias", "noticia", "informativos", "informacion", "actualidad"], tags: ["news", "talk"] , label: "Noticias"},
  {words: ["deportes", "deporte", "futbol", "fútbol", "sports"], tags: ["sports", "sport"], label: "Deportes"},
  {words: ["musica", "música", "musical"], tags: ["music"], label: "Música"},
  {words: ["rock"], tags: ["rock"], label: "Rock"},
  {words: ["jazz"], tags: ["jazz"], label: "Jazz"},
  {words: ["clasica", "clásica"], tags: ["classical"], label: "Clásica"},
  {words: ["pop"], tags: ["pop"], label: "Pop"},
  {words: ["electronica", "electrónica"], tags: ["electronic"], label: "Electrónica"}
];
const normalize = s => clean(s).toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function interpretQuery(query) {
  let rest = normalize(query).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  let country = "";
  const countryMatch = [...COUNTRIES].sort((a,b) => b[0].length-a[0].length)
    .find(([word]) => new RegExp("(^| )" + normalize(word) + "( |$)").test(rest));
  if (countryMatch) {
    country = countryMatch[1];
    rest = rest.replace(new RegExp("(^| )" + normalize(countryMatch[0]) + "(?= |$)"), " ").trim();
  }
  let topic = null;
  for (const entry of TOPICS) {
    const found = entry.words.find(word => new RegExp("(^| )" + normalize(word) + "( |$)").test(rest));
    if (found) {
      topic = entry;
      rest = rest.replace(new RegExp("(^| )" + normalize(found) + "(?= |$)"), " ").trim();
      break;
    }
  }
  rest = rest.replace(/^(de|del|en|la|el|las|los)\s+/, "").trim();
  return {country, topic, name: rest};
}
function category(station) {
  const tags = normalize(station.tags || "").split(",").map(s=>s.trim());
  if (tags.some(t => ["news","talk","noticias","informacion"].includes(t))) return "Noticias";
  if (tags.some(t => ["sports","sport","deportes","football"].includes(t))) return "Deportes";
  if (tags.some(t => ["music","musica","pop","rock","jazz","classical","electronic","dance"].includes(t))) return "Música";
  return "Sin categoría confirmada";
}
const PAGE_SIZE = 100;
const DISPLAY_BATCH = 60;
let currentRequest;
let searchState = null;
let loadingMore = false;
const seenStreams = new Set();
function renderMore() {
  const target = $("results");
  const start = target.children.length;
  const next = stationList.slice(start,start+DISPLAY_BATCH);
  next.forEach((s,i)=>stationRow(s,target,false,start+i+1));
  $("more-stations").hidden = !searchState || (target.children.length>=stationList.length && searchState.exhausted);
  const scope = searchState?.label || "radios";
  status(stationList.length ? `${stationList.length} emisoras encontradas · ${target.children.length} mostradas · ${scope}. Usa «Cargar más radios» para continuar.` : "No hay emisoras HTTPS compatibles en esta búsqueda.");
}
async function loadPage() {
  if (!searchState || loadingMore) return;
  loadingMore = true;
  const more = $("more-stations");
  more.disabled = true;
  const state = searchState;
  const request = state.controller;
  try {
    if (state.exhausted) {renderMore();return;}
    // Consultar varias páginas hasta encontrar emisoras nuevas o agotar el directorio.
    let attempts = 0;
    while (attempts++ < 3 && stationList.length - $("results").children.length < DISPLAY_BATCH && !state.exhausted) {
      const tag = state.tags[state.tagIndex];
      const url = new URL(DIRECTORY);
      if(state.country) url.searchParams.set("country",state.country);
      if(state.countrycode) url.searchParams.set("countrycode",state.countrycode);
      if(tag) url.searchParams.set("tag",tag);
      if(state.name) url.searchParams.set("name",state.name);
      url.searchParams.set("hidebroken","true");
      url.searchParams.set("limit",String(PAGE_SIZE));
      url.searchParams.set("offset",String(state.offset));
      url.searchParams.set("order","votes");
      url.searchParams.set("reverse","true");
      const response = await fetch(url,{signal:request.signal,headers:{Accept:"application/json"}});
      if(!response.ok) throw new Error("Servicio no disponible");
      const stations = await response.json();
      if(!Array.isArray(stations)) throw new Error("Respuesta inesperada");
      if(state !== searchState) return;
      for(const s of stations) {
        const stream = safeStream(s.url_resolved||s.url);
        if(!stream||seenStreams.has(stream))continue;
        seenStreams.add(stream);
        stationList.push({name:clean(s.name),url:stream,country:clean(s.country),tags:clean(s.tags),category:category(s),codec:clean(s.codec),bitrate:Number(s.bitrate)||0});
      }
      state.offset += stations.length;
      if(stations.length<PAGE_SIZE) {
        state.tagIndex++;
        state.offset=0;
        if(state.tagIndex>=state.tags.length)state.exhausted=true;
      }
    }
    renderMore();
  } catch(error) {
    if(error.name!=="AbortError"&&state===searchState)status("No se pudieron cargar más emisoras. Inténtalo otra vez.");
  } finally {
    loadingMore=false;
    more.disabled=false;
  }
}
function startStationSearch({country="",countrycode="",name="",tags=[""],label="Radios del mundo"}) {
  if(currentRequest)currentRequest.abort();
  currentRequest=new AbortController();
  searchState={country,countrycode,name,tags,tagIndex:0,offset:0,controller:currentRequest,exhausted:false,label};
  stationList=[];activeStationIndex=-1;seenStreams.clear();
  $("results").replaceChildren();
  $("more-stations").hidden=false;
  status("Buscando emisoras...");
  loadPage();
}
$("search-form").addEventListener("submit",event=>{
  event.preventDefault();
  const query=clean($("query").value);
  if(!query)return;
  const {country,topic,name}=interpretQuery(query);
  startStationSearch({country,name,tags:topic?topic.tags:[""],label:query});
});
$("world-stations").addEventListener("click",()=>{
  $("query").value="";
  startStationSearch({label:"Todo el mundo"});
});
$("more-stations").addEventListener("click",async()=>{
  if(loadingMore)return;
  if($("results").children.length<stationList.length){renderMore();return;}
  await loadPage();
});
window.FLCOStartCountrySearch = countrycode => {
  if(!/^[A-Z]{2}$/.test(countrycode))return;
  startStationSearch({countrycode,label:"País "+countrycode});
};
$("url-form").addEventListener("submit", event => {
  event.preventDefault();
  play({name: clean($("station-name").value), url: $("station-url").value});
});
$("player").addEventListener("error", () => status("No se puede reproducir este flujo. Puede estar caído o usar un formato no compatible."));
renderFavorites();

window.FLCOStations = {step(delta) {if (!stationList.length) {status("Busca primero emisoras para cambiar de canal.");return;} const next=(activeStationIndex+delta+stationList.length)%stationList.length;play(stationList[next]);}, current(){return activeStationIndex;}};

