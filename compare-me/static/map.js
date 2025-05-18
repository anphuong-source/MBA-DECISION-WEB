function loadInteractiveMap(locations) {
    const map = L.map("map").setView([20, 0], 2);
  
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
  
    const bounds = [];
  
    // 📍 Custom pin icon
    const customIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  
    locations.forEach(location => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location.city}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const latLng = [parseFloat(lat), parseFloat(lon)];
  
            // 🧠 Rich content from Gemini
            const popupContent = `
              <b>${location.city}</b><br>
              <strong>Why:</strong> ${location.reason}<br>
              <strong>Industries:</strong> ${location.top_industries?.join(', ') || 'N/A'}<br>
              <strong>Avg Salary:</strong> $${location.average_salary?.toLocaleString() || 'N/A'} / year<br>
              <strong>Top Employers:</strong> ${location.top_employers?.join(', ') || 'N/A'}
            `;
  
            const marker = L.marker(latLng, { icon: customIcon }).addTo(map);
            marker.bindPopup(popupContent);
  
            bounds.push(latLng);
  
            if (bounds.length === locations.length) {
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          }
        });
    });
  }