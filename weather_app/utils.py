def aqi_to_color(aqi):
    # Simple mapping using US EPA categories
    try:
        aqi = int(aqi)
    except:
        return '#999'
    if aqi <= 50:
        return '#55a84f'  # Good - green
    if aqi <= 100:
        return '#ffd23f'  # Moderate - yellow
    if aqi <= 150:
        return '#ff9933'  # Unhealthy for sensitive groups - orange
    if aqi <= 200:
        return '#cc0033'  # Unhealthy - red
    if aqi <= 300:
        return '#660099'  # Very Unhealthy - purple
    return '#7e0023'      # Hazardous - maroon

def deg_to_compass(num):
    val=int((num/22.5)+.5)
    arr=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]
    return arr[(val % 16)]
