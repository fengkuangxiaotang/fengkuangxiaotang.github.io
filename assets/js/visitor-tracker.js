// Visitor Tracker — Firebase Realtime DB + Leaflet.js map
(function() {
  // ========== FIREBASE CONFIG ==========
  // Replace with your Firebase project config
  const firebaseConfig = {
  apiKey: "AIzaSyBCNIXui3osTULJRpaaEJHmXMrZDNvUREs",
  authDomain: "visitorcountacademichp.firebaseapp.com",
  databaseURL: "https://visitorcountacademichp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "visitorcountacademichp",
  storageBucket: "visitorcountacademichp.firebasestorage.app",
  messagingSenderId: "463176512227",
  appId: "1:463176512227:web:2adc7c9a8bce0de9a44bd6",
  measurementId: "G-W90GZP7C8M"
};
  // ======================================

  var DB_URL = firebaseConfig.databaseURL;
  var map, markersLayer;

  function isConfigured() {
    return DB_URL && DB_URL.indexOf('YOUR_PROJECT') === -1;
  }

  // Simple hash for IP privacy
  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return 'v' + Math.abs(h).toString(36);
  }

  function initMap() {
    var container = document.getElementById('visitor-map');
    if (!container || typeof L === 'undefined') return;

    map = L.map('visitor-map', {
      center: [25, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      scrollWheelZoom: false,
      attributionControl: false,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0
    });

    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTileLayer(isDark);

    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/">OSM</a>')
      .addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    setTimeout(function() { map.invalidateSize(); }, 200);
  }

  function setTileLayer(isDark) {
    if (!map) return;
    map.eachLayer(function(layer) {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    if (isDark) {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);
    }
  }

  // Watch for theme changes
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.attributeName === 'data-theme') {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        setTileLayer(isDark);
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  function updateStats(visitors) {
    var keys = Object.keys(visitors);
    var totalVisitors = keys.length;
    var countries = {};
    keys.forEach(function(k) {
      var c = visitors[k].country;
      if (c) countries[c] = (countries[c] || 0) + 1;
    });
    var totalCountries = Object.keys(countries).length;

    var el1 = document.getElementById('visitor-count');
    var el2 = document.getElementById('country-count');
    if (el1) el1.textContent = totalVisitors;
    if (el2) el2.textContent = totalCountries;
  }

  function plotVisitors(visitors) {
    if (!markersLayer) return;
    markersLayer.clearLayers();

    var keys = Object.keys(visitors);
    keys.forEach(function(k) {
      var v = visitors[k];
      if (!v.lat || !v.lng) return;

      var marker = L.circleMarker([v.lat, v.lng], {
        radius: 5,
        fillColor: '#4d6dff',
        fillOpacity: 0.7,
        color: '#3333d8',
        weight: 1
      });
      marker.bindPopup(
        '<strong>' + (v.city || 'Unknown') + '</strong>' +
        (v.region ? ', ' + v.region : '') +
        '<br>' + (v.country_name || v.country || '')
      );
      markersLayer.addLayer(marker);
    });
  }

  function loadVisitors() {
    if (!isConfigured()) {
      showDemoData();
      return;
    }
    fetch(DB_URL + '/visitors.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data) data = {};
        updateStats(data);
        plotVisitors(data);
      })
      .catch(function() { showDemoData(); });
  }

  function recordVisit() {
    if (!isConfigured()) return;

    fetch('https://ipapi.co/json/')
      .then(function(r) { return r.json(); })
      .then(function(geo) {
        if (!geo || geo.error) return;
        var key = hashStr(geo.ip || 'unknown');
        var record = {
          city: geo.city || '',
          region: geo.region || '',
          country: geo.country || '',
          country_name: geo.country_name || '',
          lat: geo.latitude || 0,
          lng: geo.longitude || 0,
          visits: 1,
          last: Date.now()
        };

        // Check if exists, increment visits
        fetch(DB_URL + '/visitors/' + key + '.json')
          .then(function(r) { return r.json(); })
          .then(function(existing) {
            if (existing && existing.visits) {
              record.visits = existing.visits + 1;
            }
            return fetch(DB_URL + '/visitors/' + key + '.json', {
              method: 'PUT',
              body: JSON.stringify(record)
            });
          })
          .then(function() { loadVisitors(); });
      })
      .catch(function() {});
  }

  function showDemoData() {
    var demo = {
      a: { city: 'Hong Kong', region: 'HK', country: 'HK', country_name: 'Hong Kong', lat: 22.32, lng: 114.17 },
      b: { city: 'London', region: 'England', country: 'GB', country_name: 'United Kingdom', lat: 51.51, lng: -0.13 },
      c: { city: 'Beijing', region: 'Beijing', country: 'CN', country_name: 'China', lat: 39.9, lng: 116.4 },
      d: { city: 'San Francisco', region: 'CA', country: 'US', country_name: 'United States', lat: 37.77, lng: -122.42 },
      e: { city: 'Tokyo', region: 'Tokyo', country: 'JP', country_name: 'Japan', lat: 35.68, lng: 139.69 },
      f: { city: 'Singapore', region: '', country: 'SG', country_name: 'Singapore', lat: 1.35, lng: 103.82 }
    };
    updateStats(demo);
    plotVisitors(demo);

    var notice = document.getElementById('visitor-notice');
    if (notice) notice.style.display = 'block';
  }

  // Init
  document.addEventListener('DOMContentLoaded', function() {
    initMap();
    recordVisit();
    loadVisitors();
  });

  // Re-init map if section becomes visible (for lazy loading)
  if (typeof IntersectionObserver !== 'undefined') {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting && map) {
          map.invalidateSize();
          io.unobserve(e.target);
        }
      });
    });
    var el = document.getElementById('visitors');
    if (el) io.observe(el);
  }
})();
