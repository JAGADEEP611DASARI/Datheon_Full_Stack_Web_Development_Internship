(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const searchForm = $('#searchForm');
  const cityInput = $('#cityInput');
  const searchButton = $('#searchButton');
  const statusMessage = $('#statusMessage');
  const loadingState = $('#loadingState');
  const weatherContent = $('#weatherContent');
  const welcomeState = $('#welcomeState');
  const forecastGrid = $('#forecastGrid');
  const unitToggle = $('#unitToggle');
  let unit = 'C';
  let currentWeather = null;
  let currentForecast = null;
  let requestCounter = 0;

  $('#year').textContent = new Date().getFullYear();

  const weatherDescriptions = {
    0: ['Clear sky', '☀', 'sunny'], 1: ['Mainly clear', '🌤', 'sunny'],
    2: ['Partly cloudy', '⛅', 'cloudy'], 3: ['Overcast', '☁', 'cloudy'],
    45: ['Fog', '🌫', 'cloudy'], 48: ['Depositing rime fog', '🌫', 'cloudy'],
    51: ['Light drizzle', '🌦', 'rainy'], 53: ['Drizzle', '🌦', 'rainy'],
    55: ['Dense drizzle', '🌧', 'rainy'], 56: ['Freezing drizzle', '🌧', 'rainy'],
    57: ['Heavy freezing drizzle', '🌧', 'rainy'], 61: ['Light rain', '🌦', 'rainy'],
    63: ['Moderate rain', '🌧', 'rainy'], 65: ['Heavy rain', '🌧', 'rainy'],
    66: ['Freezing rain', '🌧', 'rainy'], 67: ['Heavy freezing rain', '🌧', 'rainy'],
    71: ['Light snow', '🌨', 'cloudy'], 73: ['Snow', '❄', 'cloudy'],
    75: ['Heavy snow', '❄', 'cloudy'], 77: ['Snow grains', '🌨', 'cloudy'],
    80: ['Rain showers', '🌦', 'rainy'], 81: ['Moderate showers', '🌧', 'rainy'],
    82: ['Violent showers', '⛈', 'rainy'], 85: ['Snow showers', '🌨', 'cloudy'],
    86: ['Heavy snow showers', '❄', 'cloudy'], 95: ['Thunderstorm', '⛈', 'rainy'],
    96: ['Thunderstorm with hail', '⛈', 'rainy'], 99: ['Heavy thunderstorm', '⛈', 'rainy']
  };

  async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather service returned ${response.status}. Please try again.`);
    return response.json();
  }

  async function searchCity(city) {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      showError('Please enter a city name to search.');
      cityInput.focus();
      return;
    }

    const requestId = ++requestCounter;
    setLoading(true);
    hideError();

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedCity)}&count=8&language=en&format=json`;
      const geoData = await fetchJSON(geoUrl);
      if (requestId !== requestCounter) return;
      if (!geoData.results || geoData.results.length === 0) {
        showError(`We couldn't find "${trimmedCity}". Check the spelling or try a nearby major city.`);
        return;
      }

      const place = choosePlace(geoData.results, trimmedCity);
      const params = new URLSearchParams({
        latitude: place.latitude,
        longitude: place.longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: '5',
        wind_speed_unit: 'kmh'
      });
      const weatherData = await fetchJSON(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (requestId !== requestCounter) return;

      currentWeather = { place, data: weatherData };
      currentForecast = weatherData.daily;
      renderWeather();
      setLoading(false);
      weatherContent.hidden = false;
      welcomeState.hidden = true;
      $('#currentHeading').textContent = 'Weather overview';
      $('#updatedAt').textContent = `Updated ${new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date())}`;
    } catch (error) {
      if (requestId !== requestCounter) return;
      console.error(error);
      showError(error instanceof TypeError
        ? 'Unable to connect to the weather service. Check your internet connection and try again.'
        : (error.message || 'Something went wrong while loading weather data.'));
    } finally {
      if (requestId === requestCounter) setLoading(false);
    }
  }

  function choosePlace(results, query) {
    const lower = query.toLowerCase();
    return results.find(place => place.name.toLowerCase() === lower) || results[0];
  }

  function setLoading(isLoading) {
    loadingState.hidden = !isLoading;
    searchButton.disabled = isLoading;
    searchButton.innerHTML = isLoading ? 'Loading <span class="spinner"></span>' : 'Search <span>↗</span>';
    if (isLoading) {
      weatherContent.hidden = true;
      welcomeState.hidden = true;
    }
  }

  function showError(message) {
    statusMessage.textContent = message;
    statusMessage.hidden = false;
    statusMessage.classList.remove('info');
    weatherContent.hidden = true;
    welcomeState.hidden = true;
    loadingState.hidden = true;
    searchButton.disabled = false;
    searchButton.innerHTML = 'Search <span>↗</span>';
  }

  function hideError() {
    statusMessage.hidden = true;
    statusMessage.textContent = '';
  }

  function toDisplayTemp(celsius) {
    const value = unit === 'C' ? celsius : (celsius * 9 / 5 + 32);
    return `${Math.round(value)}°`;
  }

  function renderWeather() {
    if (!currentWeather) return;
    const { place, data } = currentWeather;
    const current = data.current;
    const condition = weatherDescriptions[current.weather_code] || ['Unknown conditions', '🌡', 'cloudy'];
    const region = [place.admin1, place.country].filter(Boolean).filter((item, index, arr) => arr.indexOf(item) === index).join(', ');

    $('#cityName').textContent = place.name;
    $('#cityRegion').textContent = region || 'Location found';
    $('#currentTemp').textContent = toDisplayTemp(current.temperature_2m);
    $('#conditionText').textContent = condition[0];
    $('#feelsLike').textContent = `Feels like ${toDisplayTemp(current.apparent_temperature)}`;
    $('#dayDescription').textContent = current.is_day ? 'A fresh look at your local conditions.' : 'Current conditions after sunset.';
    $('#humidity').textContent = `${current.relative_humidity_2m}%`;
    $('#windSpeed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    $('#windDirection').textContent = `${windDirection(current.wind_direction_10m)} · ${Math.round(current.wind_direction_10m)}°`;
    $('#pressure').textContent = `${Math.round(current.pressure_msl)} hPa`;
    $('#windGusts').textContent = `${Math.round(current.wind_gusts_10m)} km/h`;
    $('#localTime').textContent = `Local time ${data.current.time.replace('T', ' ')}`;
    updateIllustration(condition[2], current.is_day);
    updateBackground(condition[2], current.is_day);
    renderForecast(data.daily);
  }

  function windDirection(degrees) {
    return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(degrees / 45) % 8];
  }

  function updateIllustration(kind, isDay) {
    const illustration = $('#weatherIllustration');
    illustration.classList.toggle('rainy', kind === 'rainy');
    illustration.querySelector('.rain-drops').hidden = kind !== 'rainy';
    illustration.querySelector('.big-sun').style.opacity = isDay && kind !== 'rainy' ? '1' : '.25';
  }

  function updateBackground(kind, isDay) {
    document.body.classList.remove('weather-sunny', 'weather-rainy', 'weather-cloudy', 'weather-night');
    document.body.classList.add(`weather-${!isDay ? 'night' : kind}`);
  }

  function renderForecast(daily) {
    forecastGrid.replaceChildren();
    daily.time.forEach((dateString, index) => {
      const code = daily.weather_code[index];
      const [description, icon] = weatherDescriptions[code] || ['Variable', '🌡'];
      const date = new Date(`${dateString}T12:00:00`);
      const card = document.createElement('article');
      card.className = 'forecast-card';

      const day = document.createElement('div');
      day.className = 'forecast-day';
      day.textContent = index === 0 ? 'Today' : new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);
      const dateEl = document.createElement('div');
      dateEl.className = 'forecast-date';
      dateEl.textContent = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
      const iconEl = document.createElement('div');
      iconEl.className = 'forecast-icon';
      iconEl.textContent = icon;
      iconEl.setAttribute('aria-label', description);
      const conditionEl = document.createElement('div');
      conditionEl.className = 'forecast-condition';
      conditionEl.textContent = description;
      const temps = document.createElement('div');
      temps.className = 'forecast-temps';
      const high = document.createElement('span');
      high.textContent = toDisplayTemp(daily.temperature_2m_max[index]);
      const low = document.createElement('span');
      low.textContent = toDisplayTemp(daily.temperature_2m_min[index]);
      temps.append(high, low);
      const rain = document.createElement('div');
      rain.className = 'forecast-rain';
      const rainChance = daily.precipitation_probability_max?.[index];
      rain.textContent = rainChance == null ? '' : `☂ ${rainChance}%`;
      card.append(day, dateEl, iconEl, conditionEl, temps, rain);
      forecastGrid.append(card);
    });
  }

  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    searchCity(cityInput.value);
  });

  document.querySelectorAll('[data-city]').forEach(button => {
    button.addEventListener('click', () => {
      cityInput.value = button.dataset.city;
      searchCity(button.dataset.city);
    });
  });

  unitToggle.addEventListener('click', () => {
    unit = unit === 'C' ? 'F' : 'C';
    unitToggle.innerHTML = unit === 'C' ? '°C <span>/ °F</span>' : '°F <span>/ °C</span>';
    unitToggle.setAttribute('aria-label', `Temperature unit is ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}; click to switch`);
    if (currentWeather) renderWeather();
  });
})();
