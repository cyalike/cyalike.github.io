const map = L.map('map').setView([23.7, 121], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

const list = document.getElementById("list");
const markers = [];

fetch('places.json')
  .then(res => res.json())
  .then(places => {
    places.forEach(p => {
      const marker = L.marker([p.lat, p.lng])
        .addTo(map)
        .bindPopup(`
          <strong>${p.name}</strong><br>
          ${p.address || ""}
        `);

      markers.push(marker);

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <strong>${p.name}</strong><br>
        <small>${p.address || ""}</small>
      `;

      div.onclick = () => {
        map.setView([p.lat, p.lng], 16);
        marker.openPopup();
      };

      list.appendChild(div);
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  });
