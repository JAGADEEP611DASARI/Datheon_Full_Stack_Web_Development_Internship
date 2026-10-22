# SkyCast — Real-Time Weather Forecast & Climate Telemetry (Task 3)

A responsive global-city weather application using asynchronous `fetch()` requests and the free Open-Meteo geocoding and forecast APIs. No API key or build step is required.

## Features
- Search for cities worldwide (geocoding API)
- Current temperature, apparent temperature, conditions, and day/night status
- Humidity, wind speed/direction, atmospheric pressure, and wind gusts
- Five-day daily forecast with high/low temperatures and precipitation chance
- Celsius/Fahrenheit toggle
- Dynamic weather icons and background theme
- Loading spinner and disabled submit button during requests
- Graceful handling of unknown cities, network errors, and HTTP errors
- Responsive layout for mobile, tablet, and desktop
- Uses `textContent` for API-provided text to avoid injecting HTML

## Run locally
1. Extract this project folder.
2. Open `index.html` in a modern browser, or open the folder in VS Code and run the Live Server extension.
3. Search for a city such as Tokyo, London, New York, or Hyderabad.

An internet connection is required because the app requests live data from Open-Meteo. No API key is required.

## APIs
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast/current weather: `https://api.open-meteo.com/v1/forecast`
- Data provider: [Open-Meteo](https://open-meteo.com/)

## Technology
HTML5, CSS3 (Flexbox, Grid, responsive media queries), JavaScript ES6+, Fetch API, async/await, REST APIs, JSON.

## Project structure
```
Task-3-Weather-Telemetry/
├── index.html
├── style.css
├── script.js
└── README.md
```
