// 店家資料（之後要改成 places.json 也很容易）
const places = [
  { name: "阿宗麵線", lat: 25.044, lng: 121.507 },
  { name: "永康牛肉麵", lat: 25.033, lng: 121.529 },
  { name: "阜杭豆漿", lat: 25.0419, lng: 121.525 }
];

// 🗺️ 建立地圖
const map = L.map('map').setView([25.033, 121.5654], 12);

// 底圖
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// 📍 嘗試使用自訂 icon（沒有 marker.png 也不會壞）
let markerOptions = {};
if (true) {
  markerOptions.icon = L.icon({
    iconUrl: 'marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

const list = document.getElementById("list");
const markers = [];

// 清單＋地圖互動
places.forEach(p => {
  const marker = L.marker([p.lat, p.lng], markerOptions)
    .addTo(map)
    .bindPopup(p.name);

  markers.push(marker);

  const div = document.createElement("div");
  div.className = "item";
  div.textContent = p.name;

  div.onclick = () => {
    map.setView([p.lat, p.lng], 16);
    marker.openPopup();
  };

  list.appendChild(div);
});

// 自動縮放到所有店家
const group = L.featureGroup(markers);
map.fitBounds(group.getBounds().pad(0.2));
