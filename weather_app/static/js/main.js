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
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  const data = await res.json();
  if(data.error){ tempEl.textContent='err'; return }
  const w = data.weather;
  const f = data.forecast;
  const a = data.aqi;

  // Current
  try{ tempEl.textContent = Math.round(w.main.temp) + '°C'; }catch(e){ tempEl.textContent='--' }
  try{ descEl.textContent = w.weather[0].description }catch(e){ descEl.textContent='--' }

  // AQI
  try{
    const aqi = a.list && a.list[0] && a.list[0].main ? a.list[0].main.aqi : 'n/a';
    aqiValue.textContent = aqi;
    aqiDetails.textContent = JSON.stringify(a.list && a.list[0] && a.list[0].components ? a.list[0].components : {});
  }catch(e){ aqiValue.textContent='--' }

  // Forecast: daily
  dailyList.innerHTML='';
  try{
    const days = f.daily.slice(0,7);
    days.forEach(d=>{
      const el = document.createElement('div');
      el.style.minWidth='110px';
      el.innerHTML = `<div class="muted">${new Date(d.dt*1000).toDateString().split(' ')[0]}</div>
                      <div style="font-weight:600">${Math.round(d.temp.max)}° / ${Math.round(d.temp.min)}°</div>
                      <div class="muted">${d.weather[0].main}</div>`;
      dailyList.appendChild(el);
    });
  }catch(e){ console.log(e) }

  // Hourly chart
  try{
    const hours = f.hourly.slice(0,24);
    const labels = hours.map(h=> new Date(h.dt*1000).getHours()+':00');
    const temps = hours.map(h=> h.temp);
    const ctx = document.getElementById('hourly-chart').getContext('2d');
    if(hourlyChart) hourlyChart.destroy();
    hourlyChart = new Chart(ctx, {
      type:'line',
      data:{labels:labels, datasets:[{label:'Temp (°C)', data:temps, fill:true}]},
      options:{responsive:true, plugins:{legend:{display:false}}}
    });
  }catch(e){ console.log(e) }
}

// Load favorites on page load
async function loadFavorites(){
  // Favorites are server-rendered; read from DOM via a data attribute if present (server will pass in during template render)
  // For scaffold, we fetch them with a simple endpoint or the server may pass it; here just show placeholder
  favList.innerHTML = '<div class="fav-item muted">No favorites yet — search and save a city.</div>';
}

window.onload = ()=> loadFavorites();
