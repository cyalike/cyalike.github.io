const map = L.map('map').setView([25.033, 121.5654], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

L.marker([25.033, 121.5654]).addTo(map).bindPopup("地圖正常").openPopup();

