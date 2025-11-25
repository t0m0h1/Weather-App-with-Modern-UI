from flask import Flask, render_template, request, jsonify
from api_handlers import get_current_weather, get_forecast, get_aqi, search_cities
from db import DBHelper
import os

app = Flask(__name__)
db = DBHelper('weather.db')

@app.route('/')
def index():
    favorites = db.get_favorites()
    return render_template('index.html', favorites=favorites)

@app.route('/api/search')
def api_search():
    q = request.args.get('q','')
    results = search_cities(q)
    return jsonify(results)

@app.route('/api/weather')
def api_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error':'missing coordinates'}), 400
    weather = get_current_weather(lat, lon)
    forecast = get_forecast(lat, lon)
    aqi = get_aqi(lat, lon)
    return jsonify({'weather': weather, 'forecast': forecast, 'aqi': aqi})

@app.route('/api/favorites', methods=['POST','DELETE'])
def api_favorites():
    data = request.get_json() or {}
    if request.method == 'POST':
        db.add_favorite(data.get('name'), data.get('lat'), data.get('lon'))
        return jsonify({'status':'ok'})
    else:
        db.remove_favorite(data.get('lat'), data.get('lon'))
        return jsonify({'status':'ok'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
