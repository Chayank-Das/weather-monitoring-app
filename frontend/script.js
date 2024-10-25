
const apiKey = "Your_API_KEY";
// OpenWeatherMap API endpoints
const apiUrlCurrent = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiUrlForecast = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

// Base URL for weather icons
const iconUrl = "https://openweathermap.org/img/wn/";

// Backend server URL
const backendUrl = "http://localhost:3000"; // Update if your backend is hosted elsewhere

// List of cities to monitor
const cities = ["Bengaluru", "Delhi", "Mumbai", "Chennai", "Kolkata", "Hyderabad"];

// State variables
let useCelsius = true;
const unitToggle = document.getElementById("unit-toggle");
const temperatureThresholdInput = document.getElementById("temperature-threshold");
let temperatureThreshold = null;
const previousExceed = {}; // Tracks if threshold was exceeded in previous update
const today = new Date().toISOString().split('T')[0];
let dailyData = JSON.parse(localStorage.getItem('dailyData_' + today)) || {};

// Event listeners
document.getElementById("set-threshold").addEventListener("click", setThreshold);
unitToggle.addEventListener("click", toggleUnit);
document.getElementById("clear-alerts").addEventListener("click", clearAlerts);

// Initialize the application
fetchAllWeather();
displayAlerts();
displayDailySummaries();

// Fetch weather data for all cities
async function fetchAllWeather() {
    const fetchPromises = cities.map(city => fetchWeather(city));
    await Promise.all(fetchPromises);
    // After fetching current weather, fetch forecasts
    fetchAllForecasts();
    // Calculate daily summaries after fetching current weather
    calculateDailySummaries();
    // Send daily summaries to the backend for storage
    sendDailySummaries();
}

// Fetch current weather data for a single city
async function fetchWeather(city) {
    document.querySelector(`.loading`).style.display = "block";
    try {
        const response = await fetch(apiUrlCurrent + city + `&appid=${apiKey}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const card = document.getElementById(city.toLowerCase());
        const tempCelsius = Math.round(data.main.temp);
        const feelsLikeCelsius = Math.round(data.main.feels_like);
        const condition = data.weather[0].main;
        const iconCode = data.weather[0].icon; // Get icon code from API response

        // Store data for daily summaries
        if (!dailyData[city]) dailyData[city] = [];
        dailyData[city].push({ temp: tempCelsius, condition, timestamp: data.dt });
        localStorage.setItem('dailyData_' + today, JSON.stringify(dailyData));

        // Update temperature display
        card.querySelector(".temp").setAttribute("data-temp-celsius", tempCelsius);
        card.querySelector(".feels-like").setAttribute("data-feelslike-celsius", feelsLikeCelsius);
        updateCityTemperatureDisplay(city);

        // Update other weather information
        card.querySelector(".condition").innerHTML = condition;
        card.querySelector(".humidity").innerHTML = data.main.humidity + " %";
        card.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

        // Check for alerts
        checkForAlerts(city, tempCelsius);

        // Update last updated time
        const updateTime = new Date(data.dt * 1000);
        card.querySelector(".update-time").innerHTML = "Last Updated: " + updateTime.toLocaleString();

        // Update weather icon using online source
        updateWeatherIcon(card, iconCode);

        // Make weather information visible
        card.querySelector(".weather").style.display = "block";
    } catch (error) {
        console.error("Error fetching weather data:", error);
        const card = document.getElementById(city.toLowerCase());
        card.querySelector(".weather").style.display = "none";
    } finally {
        document.querySelector(`.loading`).style.display = "none";
    }
}

// Fetch forecasts for all cities
async function fetchAllForecasts() {
    // Clear the forecast container to prevent duplicates
    const forecastContainer = document.querySelector('.forecast-container');
    forecastContainer.innerHTML = '';

    const fetchPromises = cities.map(city => fetchForecast(city));
    await Promise.all(fetchPromises);
}

// Fetch forecast data for a single city
async function fetchForecast(city) {
    try {
        const response = await fetch(apiUrlForecast + city + `&appid=${apiKey}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // Process forecast data to get daily forecasts
        const dailyForecasts = processForecastData(data);

        // Display the forecasts
        displayForecasts(city, dailyForecasts);
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

// Process forecast data to get daily forecasts
function processForecastData(data) {
    const forecasts = {};
    data.list.forEach(forecast => {
        const date = forecast.dt_txt.split(' ')[0]; // Extract date part
        if (!forecasts[date]) {
            forecasts[date] = {
                temp_min: forecast.main.temp_min,
                temp_max: forecast.main.temp_max,
                condition: forecast.weather[0].main,
                icon: forecast.weather[0].icon,
                count: 1
            };
        } else {
            forecasts[date].temp_min = Math.min(forecasts[date].temp_min, forecast.main.temp_min);
            forecasts[date].temp_max = Math.max(forecasts[date].temp_max, forecast.main.temp_max);
            forecasts[date].count += 1;
            // Optionally, update the condition based on specific logic
        }
    });

    // Convert forecasts object to an array and exclude today
    const todayDate = new Date().toISOString().split('T')[0];
    const forecastArray = Object.keys(forecasts)
        .filter(date => date !== todayDate)
        .slice(0, 5) // Get next 5 days
        .map(date => {
            return {
                date,
                temp_min: forecasts[date].temp_min,
                temp_max: forecasts[date].temp_max,
                condition: forecasts[date].condition,
                icon: forecasts[date].icon
            };
        });

    return forecastArray;
}

// Display forecasts in the forecast container
function displayForecasts(city, forecasts) {
    const forecastContainer = document.querySelector('.forecast-container');

    // Create a forecast card for the city
    const cityForecastDiv = document.createElement('div');
    cityForecastDiv.className = 'city-forecast';

    const cityHeading = document.createElement('h3');
    cityHeading.textContent = city;
    cityForecastDiv.appendChild(cityHeading);

    const forecastCardsContainer = document.createElement('div');
    forecastCardsContainer.className = 'forecast-cards-container';

    forecasts.forEach(forecast => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';

        const date = document.createElement('p');
        date.textContent = forecast.date;
        forecastCard.appendChild(date);

        const icon = document.createElement('img');
        icon.src = `${iconUrl}${forecast.icon}@2x.png`;
        icon.alt = forecast.condition;
        forecastCard.appendChild(icon);

        const temp = document.createElement('p');
        temp.textContent = `Min: ${Math.round(forecast.temp_min)}°C Max: ${Math.round(forecast.temp_max)}°C`;
        forecastCard.appendChild(temp);

        const condition = document.createElement('p');
        condition.textContent = forecast.condition;
        forecastCard.appendChild(condition);

        forecastCardsContainer.appendChild(forecastCard);
    });

    cityForecastDiv.appendChild(forecastCardsContainer);
    forecastContainer.appendChild(cityForecastDiv);
}

// Calculate daily summaries
function calculateDailySummaries() {
    let summaries = [];

    for (const city in dailyData) {
        const readings = dailyData[city];
        if (readings.length > 0) {
            const temps = readings.map(r => r.temp);
            const avg_temp = (temps.reduce((a, b) => a + b, 0)) / temps.length;
            const max_temp = Math.max(...temps);
            const min_temp = Math.min(...temps);

            // Calculate dominant condition
            const conditionCounts = {};
            readings.forEach(r => {
                conditionCounts[r.condition] = (conditionCounts[r.condition] || 0) + 1;
            });
            const dominant_condition = Object.keys(conditionCounts).reduce((a, b) => conditionCounts[a] > conditionCounts[b] ? a : b);

            summaries.push({
                city,
                date: today,
                avg_temp: avg_temp.toFixed(2),
                max_temp,
                min_temp,
                dominant_condition
            });
        }
    }

    // Store summaries in localStorage
    localStorage.setItem('dailyWeatherSummaries', JSON.stringify(summaries));
    displayDailySummaries();
}

// Display daily summaries in the UI
function displayDailySummaries() {
    const summaries = JSON.parse(localStorage.getItem('dailyWeatherSummaries')) || [];
    const summaryContainer = document.querySelector('.daily-summary-container');
    summaryContainer.innerHTML = '';

    summaries.forEach(summary => {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary-item';

        summaryDiv.innerHTML = `
            <h3>${summary.city}</h3>
            <p><strong>Date:</strong> ${summary.date}</p>
            <p><strong>Average Temperature:</strong> ${summary.avg_temp} °C</p>
            <p><strong>Max Temperature:</strong> ${summary.max_temp} °C</p>
            <p><strong>Min Temperature:</strong> ${summary.min_temp} °C</p>
            <p><strong>Dominant Condition:</strong> ${summary.dominant_condition}</p>
        `;
        summaryContainer.appendChild(summaryDiv);
    });
}

// Send daily summaries to the backend server for storage
async function sendDailySummaries() {
    const summaries = JSON.parse(localStorage.getItem('dailyWeatherSummaries')) || [];
    if (summaries.length === 0) return;

    try {
        const response = await fetch(`${backendUrl}/api/daily-summaries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ summaries })
        });

        if (response.ok) {
            console.log("Daily summaries sent to backend successfully.");
        } else {
            console.error("Failed to send daily summaries to backend.");
        }
    } catch (error) {
        console.error("Error sending summaries to backend:", error);
    }
}


// Update temperature display based on selected unit
function updateCityTemperatureDisplay(city) {
    const card = document.getElementById(city.toLowerCase());
    const tempCelsius = parseFloat(card.querySelector(".temp").getAttribute("data-temp-celsius"));
    const feelsLikeCelsius = parseFloat(card.querySelector(".feels-like").getAttribute("data-feelslike-celsius"));

    let tempDisplay, feelsLikeDisplay;
    if (useCelsius) {
        tempDisplay = tempCelsius + " °C";
        feelsLikeDisplay = "Feels Like: " + feelsLikeCelsius + " °C";
    } else {
        const tempKelvin = Math.round(tempCelsius + 273.15);
        const feelsLikeKelvin = Math.round(feelsLikeCelsius + 273.15);
        tempDisplay = tempKelvin + " K";
        feelsLikeDisplay = "Feels Like: " + feelsLikeKelvin + " K";
    }

    card.querySelector(".temp").innerHTML = tempDisplay;
    card.querySelector(".feels-like").innerHTML = feelsLikeDisplay;
}

// Check and handle temperature alerts based on the set threshold
function checkForAlerts(city, tempCelsius) {
    if (temperatureThreshold !== null) {
        const exceeded = tempCelsius > temperatureThreshold;

        console.log(`Checking threshold for ${city}: Current Temp = ${tempCelsius}, Threshold = ${temperatureThreshold}`);
        console.log(`Previous Exceed Status for ${city}: ${previousExceed[city]}`);

        if (exceeded) {
            if (previousExceed[city]) {
                console.log(`ALERT: ${city} temperature exceeds ${temperatureThreshold}°C for two consecutive updates!`);

                // Store the alert in localStorage
                const alerts = JSON.parse(localStorage.getItem('alerts')) || [];
                alerts.push({
                    city,
                    date: new Date().toLocaleString(),
                    message: `Temperature exceeds ${temperatureThreshold}°C for two consecutive updates.`
                });

                localStorage.setItem('alerts', JSON.stringify(alerts));
                displayAlerts();
            } else {
                console.log(`First exceedance detected for ${city}. Setting previousExceed status to true.`);
            }

            // Update previous exceed status to true after detecting an exceedance
            previousExceed[city] = true;
        } else {
            // Reset the exceed status if temperature drops below the threshold
            previousExceed[city] = false;
        }
    } else {
        console.warn("Temperature threshold is not set.");
    }
}



// Display alerts in the UI
function displayAlerts() {
    const alerts = JSON.parse(localStorage.getItem('alerts')) || [];
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = ''; // Clear previous alerts

    console.log("Displaying alerts:", alerts); // Log alerts to confirm

    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert-item';
        alertDiv.innerHTML = `
            <h3>${alert.city} - ${alert.date}</h3>
            <p>${alert.message}</p>
        `;
        alertsList.appendChild(alertDiv);
    });
}


// Set temperature threshold for alerts
function setThreshold() {
    const thresholdInput = temperatureThresholdInput.value;
    temperatureThreshold = parseFloat(thresholdInput);
    if (isNaN(temperatureThreshold)) {
        alert("Please enter a valid temperature threshold.");
        return;
    }
    console.log("Threshold Set To:", temperatureThreshold, "°C");
    for (const city of cities) {
        previousExceed[city] = false;
    }
}

// Toggle temperature units between Celsius and Kelvin
function toggleUnit() {
    useCelsius = !useCelsius;
    unitToggle.innerText = useCelsius ? "Switch to Kelvin" : "Switch to Celsius";
    cities.forEach(city => {
        updateCityTemperatureDisplay(city);
    });
    // Update the forecasts to reflect the unit change
    document.querySelector('.forecast-container').innerHTML = '';
    fetchAllForecasts();
    // Update daily summaries
    displayDailySummaries();
    // Recalculate and resend daily summaries to backend
    calculateDailySummaries();
    sendDailySummaries();
}

// Update weather icon based on the icon code
function updateWeatherIcon(card, iconCode) {
    const weatherIcon = card.querySelector(".weather-icon");
    const iconUrlFull = `${iconUrl}${iconCode}@2x.png`;
    weatherIcon.src = iconUrlFull;
}

// Clear all alerts
function clearAlerts() {
    if (confirm("Are you sure you want to clear all alerts?")) {
        localStorage.removeItem('alerts');
        displayAlerts();
    }
}

// Set interval to fetch weather data every 5 minutes (300,000 milliseconds)
setInterval(fetchAllWeather, 300000);
