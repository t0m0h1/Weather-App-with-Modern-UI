// Basic frontend: search, fetch, render current weather, forecast, and AQI.
const searchInput = document.getElementById('search-input');
const resultsBox = document.getElementById('search-results');
const cityName = document.getElementById('city-name');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('weather-desc');
const aqiValue = document.getElementById('aqi-value');
const aqiDetails = document.getElementById('aqi-details');
const dailyList = document.getElementById('daily-list');
const favList = document.getElementById('fav-list');

let hourlyChart;

searchInput.addEventListener('input', async (e)=>{
  const q = e.target.value.trim();
  if(!q){ resultsBox.style.display='none'; return }
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const places = await res.json();
  resultsBox.innerHTML = '';
  places.forEach(p=>{
    const div = document.createElement('div');
    div.className='res-item muted';
    div.textContent = p.name;
    div.onclick = ()=> selectPlace(p);
    resultsBox.appendChild(div);
  });
  resultsBox.style.display = places.length? 'block':'none';
});

async function selectPlace(p){
  resultsBox.style.display='none';
  searchInput.value = p.name.split(',')[0];
  await loadWeather(p.lat, p.lon, p.name);
}

async function loadWeather(lat, lon, displayName='Location'){
  cityName.textContent = displayName;

  let data;
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    data = await res.json();
  } catch(err) {
    console.error('Fetch error:', err);
    tempEl.textContent = '--';
    descEl.textContent = '--';
    aqiValue.textContent = '--';
    dailyList.innerHTML = '';
    return;
  }

  const w = data.weather || {};
  const f = data.forecast || { hourly: [], daily: [] };
  const a = data.aqi || {};

  // Current weather
  const temp = w.main?.temp ?? '--';
  const desc = w.weather?.[0]?.description ?? '--';
  tempEl.textContent = (temp !== '--') ? Math.round(temp) + '°C' : '--';
  descEl.textContent = desc;

  // AQI
  const aqiNumber = a.list?.[0]?.main?.aqi ?? 'n/a';
  const aqiComponents = a.list?.[0]?.components ?? {};
  aqiValue.textContent = aqiNumber;
  aqiDetails.textContent = JSON.stringify(aqiComponents);

  // Forecast: daily
  dailyList.innerHTML = '';
  if (f.daily?.length) {
    f.daily.slice(0, 7).forEach(d => {
      const dayEl = document.createElement('div');
      dayEl.style.minWidth = '110px';
      dayEl.innerHTML = `
        <div class="muted">${new Date(d.dt*1000).toDateString().split(' ')[0]}</div>
        <div style="font-weight:600">${Math.round(d.temp.max)}° / ${Math.round(d.temp.min)}°</div>
        <div class="muted">${d.weather?.[0]?.main ?? '--'}</div>
      `;
      dailyList.appendChild(dayEl);
    });
  } else {
    dailyList.innerHTML = '<div class="muted">No forecast available</div>';
  }

  // Hourly chart
  if (f.hourly?.length) {
    const hours = f.hourly.slice(0,24);
    const labels = hours.map(h => new Date(h.dt*1000).getHours() + ':00');
    const temps = hours.map(h => h.temp ?? 0);
    const ctx = document.getElementById('hourly-chart').getContext('2d');
    if(hourlyChart) hourlyChart.destroy();
    hourlyChart = new Chart(ctx, {
      type:'line',
      data:{labels, datasets:[{label:'Temp (°C)', data:temps, fill:true}]},
      options:{responsive:true, plugins:{legend:{display:false}}}
    });
  } else {
    if(hourlyChart) hourlyChart.destroy();
  }
}



// Load favorites on page load
async function loadFavorites(){
  // Favorites are server-rendered; read from DOM via a data attribute if present (server will pass in during template render)
  // For scaffold, we fetch them with a simple endpoint or the server may pass it; here just show placeholder
  favList.innerHTML = '<div class="fav-item muted">No favorites yet — search and save a city.</div>';
}

window.onload = ()=> loadFavorites();
