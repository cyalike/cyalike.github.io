// === 地圖初始化 ===
const map = L.map('map').setView([23.7, 121], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

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

// === 顯示清單（最保守版，一定會顯示） ===
function showList(places) {
  listEl.innerHTML = "";
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  if (!places || places.length === 0) {
    listEl.innerHTML = "<div class='empty'>這家還沒被我吃到 🤍</div>";
    return;
  }

  places.forEach(p => {
    // 地圖點
    const marker = L.marker([p.lat, p.lng]).addTo(map);
    marker.bindPopup(`<strong>${p.name}</strong><br>${p.address}`);
    markers.push(marker);

    // 清單項目（只顯示你說的一打開要看到的）
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div class="name">${p.name}</div>
      <div class="tags">${(p.tags || []).map(t => "#" + t).join(" ")}</div>
      <div class="address">${p.address}</div>
    `;

    // 點一下才顯示更多
    item.addEventListener("click", () => {
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

