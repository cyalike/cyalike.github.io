// === 地圖初始化 ===
const map = L.map('map').setView([23.7, 121], 7);

L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap & CARTO'
  }
).addTo(map);

// === DOM ===
const listEl = document.getElementById("list");
const searchEl = document.getElementById("search");

// === 狀態 ===
let allPlaces = [];
let markers = [];

// === 讀資料 ===
fetch("places.json")
  .then(r => r.json())
  .then(data => {
    allPlaces = data;
    showList(allPlaces);
  });

// === 顯示清單（點一下才展開） ===
function showList(places) {
  listEl.innerHTML = "";
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  if (!places || places.length === 0) {
    listEl.innerHTML = "<div class='empty'>這家還沒被我吃到 🤍</div>";
    return;
  }

  places.forEach(p => {
    // 地圖 marker
    const marker = L.marker([p.lat, p.lng]).addTo(map);
    marker.bindPopup(`<strong>${p.name}</strong><br>${p.address}`);
    markers.push(marker);

    // 清單卡片
    const item = document.createElement("div");
    item.className = "item";

    item.innerHTML = `
      <div class="item-header">
        <div class="name">${p.name}</div>
        <div class="tags">${(p.tags || []).map(t => "#" + t).join(" ")}</div>
        <div class="address">${p.address}</div>
      </div>

      <div class="item-detail">
        <div>🕒 ${p.hours || ""}</div>
        <div>🍽 必吃：${(p.mustTry || []).join("、")}</div>
        <div class="notes">${p.notes || ""}</div>
      </div>
    `;

    // 點 header：展開 / 收起 ＋ 地圖跳過去
    item.querySelector(".item-header").addEventListener("click", () => {
      item.classList.toggle("open");
      marker.openPopup();
      map.setView([p.lat, p.lng], 16);
    });

    listEl.appendChild(item);
  });

  // 地圖縮放
  if (markers.length > 0) {
    const g = L.featureGroup(markers);
    map.fitBounds(g.getBounds().pad(0.2));
  }
}

// === 搜尋（餓了就查） ===
searchEl.addEventListener("input", () => {
  const q = searchEl.value.trim().toLowerCase();
  const filtered = allPlaces.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.address.toLowerCase().includes(q) ||
    (p.tags || []).some(t => t.toLowerCase().includes(q))
  );
  showList(filtered);
});


