// 建立地圖（台灣視角）
const map = L.map('map').setView([23.7, 121], 7);

// 地圖底圖
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

const listEl = document.getElementById("list");
const searchEl = document.getElementById("search");

let allPlaces = [];
let markers = [];

// 讀取 places.json
fetch('places.json')
  .then(res => res.json())
  .then(places => {
    allPlaces = places;
    renderList(places);
  });

// 渲染清單與地圖
function renderList(places) {
  // 清空清單與地圖標記
  listEl.innerHTML = "";
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  // 🔍 查不到時
  if (places.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "這家還沒被我吃到 🤍";
    listEl.appendChild(empty);
    return;
  }

  // 有資料時
  places.forEach(p => {
    // 地圖藍針
    const marker = L.marker([p.lat, p.lng])
      .addTo(map)
      .bindPopup(`
        <strong>${p.name}</strong><br>
        ${p.address || ""}
      `);

    markers.push(marker);

    // 右側清單項目
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="name">${p.name}</div>
      <div class="tags">
        ${(p.tags || []).map(t => `#${t}`).join(" ")}
      </div>
      <div class="address">${p.address || ""}</div>
    `;

    // 點清單 → 地圖跳過去
    div.onclick = () => {
      map.setView([p.lat, p.lng], 16);
      marker.openPopup();
    };

    listEl.appendChild(div);
  });

  // 自動縮放到所有點
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
  }
}

// 🔍 搜尋（店名 / 地址 / #關鍵字）
searchEl.addEventListener("input", () => {
  const q = searchEl.value.trim().toLowerCase();

  const filtered = allPlaces.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.address || "").toLowerCase().includes(q) ||
    (p.tags || []).some(t => t.toLowerCase().includes(q))
  );

  renderList(filtered);
});


