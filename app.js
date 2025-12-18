// ===== 全站狀態 =====
const state = {
  places: [],
  markers: new Map(),
  query: "",
  currentTag: ""
};

const $ = (s) => document.querySelector(s);

// ===== 工具 =====
function normalize(s) {
  return (s || "").toString().toLowerCase().trim();
}

function matches(place, q, tag) {
  const text = normalize(q);
  const tagOk = !tag || (place.tags || []).includes(tag);

  if (!text) return tagOk;

  const hay = [
    place.name,
    place.address,
    (place.tags || []).join(" "),
    place.notes
  ].map(normalize).join(" ");

  return tagOk && hay.includes(text);
}

function filteredPlaces() {
  return state.places.filter(p => matches(p, state.query, state.currentTag));
}

// ===== UI =====
function renderTagOptions(places) {
  const tags = new Set();
  places.forEach(p => (p.tags || []).forEach(t => tags.add(t)));

  const select = $("#tagFilter");
  select.innerHTML =
    `<option value="">所有標籤</option>` +
    [...tags].sort().map(t => `<option value="${t}">${t}</option>`).join("");
}

function placeCard(place) {
  const tags = (place.tags || []).map(t => `<span class="tag">${t}</span>`).join("");
  return `
    <div class="card" data-id="${place.id}">
      <h3>${place.name}</h3>
      ${place.notes ? `<div class="meta">📝 ${place.notes}</div>` : ""}
      ${place.address ? `<div class="meta">📍 ${place.address}</div>` : ""}
      <div class="tags">${tags}</div>
    </div>
  `;
}

function popupHtml(place) {
  return `
    <div style="min-width:200px">
      <strong>${place.name}</strong>
      ${place.notes ? `<div style="margin-top:6px;font-size:12px">📝 ${place.notes}</div>` : ""}
    </div>
  `;
}

function syncListAndMarkers(map) {
  const list = $("#list");
  const shown = filteredPlaces();

  $("#count").textContent = `${shown.length} / ${state.places.length}`;
  list.innerHTML = shown.map(placeCard).join("");

  for (const p of state.places) {
    const m = state.markers.get(p.id);
    if (!m) continue;
    const shouldShow = shown.some(x => x.id === p.id);
    if (shouldShow && !map.hasLayer(m)) m.addTo(map);
    if (!shouldShow && map.hasLayer(m)) map.removeLayer(m);
  }

  list.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const place = state.places.find(p => p.id === id);
      const marker = state.markers.get(id);
      if (!place || !marker) return;
      map.flyTo([place.lat, place.lng], 16, { duration: 0.8 });
      marker.openPopup();
    });
  });
}

// ===== 主程式 =====
async function main() {
  const res = await fetch("places.json", { cache: "no-store" });
  const places = await res.json();

  state.places = places.filter(
    p => p && p.id && p.name && typeof p.lat === "number" && typeof p.lng === "number"
  );

  renderTagOptions(state.places);

  // ✅ 高雄預設中心
  const map = L.map("map").setView([22.6273, 120.3014], 13);

  // ✅ 乾淨底圖（雜訊少）
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap & CARTO"
    }
  ).addTo(map);

  // markers
  for (const p of state.places) {
    const m = L.marker([p.lat, p.lng]).bindPopup(popupHtml(p));
    state.markers.set(p.id, m);
    m.addTo(map);
  }

  $("#search").addEventListener("input", e => {
    state.query = e.target.value;
    syncListAndMarkers(map);
  });

  $("#tagFilter").addEventListener("change", e => {
    state.currentTag = e.target.value;
    syncListAndMarkers(map);
  });

  syncListAndMarkers(map);
}

main().catch(err => {
  console.error(err);
  alert("讀取 places.json 失敗：請檢查檔案格式或 Pages 是否部署完成。");
});

