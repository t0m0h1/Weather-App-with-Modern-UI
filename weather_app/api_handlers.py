import os, requests

OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY','35ed645b1c1e1c93adbef5a06edcefdd')
IQAIR_API_KEY = os.environ.get('IQAIR_API_KEY','YOUR_IQAIR_KEY')  # optional

def get_current_weather(lat, lon):
    # Using OpenWeatherMap One Call API (example placeholder)
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={OPENWEATHER_API_KEY}"
    try:
        r = requests.get(url, timeout=8)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {'error': str(e)}

def get_forecast(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&units=metric&exclude=minutely&appid={OPENWEATHER_API_KEY}"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {'error': str(e)}

def get_aqi(lat, lon):
    # Example: use OpenWeatherMap's air pollution endpoint or IQAir. This uses OpenWeather's air pollution endpoint.
    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
    try:
        r = requests.get(url, timeout=8)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {'error': str(e)}

def search_cities(q):
    # Basic stub for city search: using Nominatim (OpenStreetMap) for free geocoding
    if not q:
        return []
    url = 'https://nominatim.openstreetmap.org/search'
    params = {'q': q, 'format':'json', 'limit': 6}
    try:
        r = requests.get(url, params=params, headers={'User-Agent':'weather-app-example/1.0'}, timeout=6)
        r.raise_for_status()
        results = []
        for item in r.json():
            results.append({'name': item.get('display_name'), 'lat': item.get('lat'), 'lon': item.get('lon')})
        return results
    except Exception as e:
        return []
