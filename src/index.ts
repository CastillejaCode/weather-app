import './style.css';
import format from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';

const tempMain = document.querySelector('.main');
const tempMax = document.querySelector('.max');
const tempMin = document.querySelector('.min');

const condition = document.querySelector('.outside > .condition');
const img = document.querySelector('img');
const place = document.querySelector('.place');

const windDeg = document.querySelector('.wind-direction');
const windSpeed = document.querySelector('.wind-speed');

const aqi = document.querySelector('.aqi');

const humidity = document.querySelector('.humidity');

const pressure = document.querySelector('.pressure');

const tempMaxF1 = document.querySelector('.day1 > .max');
const tempMinF1 = document.querySelector('.day1 > .min');
const day1 = document.querySelector('.day1 > .day');
const tempMaxF2 = document.querySelector('.day2 > .max');
const tempMinF2 = document.querySelector('.day2 > .min');
const day2 = document.querySelector('.day2 > .day');
const tempMaxF3 = document.querySelector('.day3 > .max');
const tempMinF3 = document.querySelector('.day3 > .min');
const day3 = document.querySelector('.day3 > .day');

const buttonLocation = document.querySelector('button');
const formLocation = document.querySelector('form');
const cityInput = document.querySelector('#city') as HTMLInputElement;
const stateInput = document.querySelector('#state') as HTMLInputElement;
const countryInput = document.querySelector('#country') as HTMLInputElement;

interface Weather {
	condition: string;
	icon: string;
	place: string;
	temp: number;
	tempMax: number;
	tempMin: number;
	feelsLike: number;
	humidity: number;
	windDeg: number;
	windSpeed: number;
	aqi: number;
	pressure: number;
}

interface Forecast {
	day1: {
		max: number;
		min: number;
		day: string;
	};

	day2: {
		max: number;
		min: number;
		day: string;
	};

	day3: {
		max: number;
		min: number;
		day: string;
	};
}

let weather: Weather;
let forecast: Forecast;

async function getWeather(city: string, state: string = 'CA', country: string = 'US') {
	try {
		const place = await fetch(
			`http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&appid=021c218898d176e59a1c863a9256aa3d
        `,
			{ mode: 'cors' }
		);
		const placeParsed = await place.json();

		let lat, lon;
		[lat, lon] = [placeParsed[0].lat, placeParsed[0].lon];

		const aqi = await fetch(
			`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=021c218898d176e59a1c863a9256aa3d`,
			{ mode: 'cors' }
		);
		const aqiParsed = await aqi.json();

		const forecast = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&current_weather=true&temperature_unit=fahrenheit&timeformat=unixtime&timezone=America%2FLos_Angeles`,
			{ mode: 'cors' }
		);
		const forecastParsed = await forecast.json();

		const weatherAPI = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=021c218898d176e59a1c863a9256aa3d`,
			{ mode: 'cors' }
		);
		const weatherParsed = await weatherAPI.json();

		console.log(forecastParsed);
		return [weatherParsed, aqiParsed, forecastParsed];
	} catch (err) {
		console.log(err);
	}
}

async function processWeather(city: string, state: string = 'CA', country: string = 'US') {
	const array = await getWeather(city, state, country);
	if (array) {
		const weatherObject = array[0];
		const aqiObject = array[1];
		const forecastObject = array[2];
		weather = {
			condition: weatherObject.weather[0].main,
			icon: weatherObject.weather[0].icon,
			place: weatherObject.name,
			temp: weatherObject.main.temp,
			tempMax: forecastObject.daily.temperature_2m_max[0],
			tempMin: forecastObject.daily.temperature_2m_min[0],
			feelsLike: weatherObject.main.feels_like,
			humidity: weatherObject.main.humidity,
			pressure: weatherObject.main.pressure,
			windDeg: weatherObject.wind.deg,
			windSpeed: weatherObject.wind.speed,
			aqi: aqiObject.list[0].main.aqi,
		};
		forecast = {
			day1: {
				max: forecastObject.daily.temperature_2m_max[1],
				min: forecastObject.daily.temperature_2m_min[1],
				day: format(fromUnixTime(forecastObject.daily.time[1]), 'eee'),
			},
			day2: {
				max: forecastObject.daily.temperature_2m_max[2],
				min: forecastObject.daily.temperature_2m_min[2],
				day: format(fromUnixTime(forecastObject.daily.time[2]), 'eee'),
			},
			day3: {
				max: forecastObject.daily.temperature_2m_max[3],
				min: forecastObject.daily.temperature_2m_min[3],
				day: format(fromUnixTime(forecastObject.daily.time[3]), 'eee'),
			},
		};
	}
}

function roundToString(num: number) {
	return Math.round(num).toString();
}

function convertWindDirection(degree: number) {
	let direction = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
	return direction[Math.round((degree % 360) / 45)];
}

function convertAQIToString(index: number) {
	if (index === 1) return 'Good';
	if (index === 2) return 'Fair';
	if (index === 3) return 'Moderate';
	if (index === 4) return 'Poor';
	if (index === 5) return 'Very Poor';
	else return null;
}

async function updateTemp() {
	if (tempMain) tempMain.textContent = roundToString(weather.temp);
	if (tempMax) tempMax.textContent = roundToString(weather.tempMax);
	if (tempMin) tempMin.textContent = roundToString(weather.tempMin);
}

async function updateWeather() {
	if (condition) condition.textContent = weather.condition;
	if (img) img.src = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;
	if (place) place.textContent = weather.place;
}

//////// Secondary Weather Results /////////
async function updateWind() {
	if (windDeg) windDeg.textContent = convertWindDirection(weather.windDeg);
	if (windSpeed) windSpeed.textContent = `${roundToString(weather.windSpeed)} mph`;
}

async function updateAQI() {
	if (aqi) aqi.textContent = convertAQIToString(weather.aqi);
}

async function updateHumidity() {
	if (humidity) humidity.textContent = `${weather.humidity}%`;
}

async function updatePressure() {
	if (pressure) pressure.textContent = `${weather.pressure}`;
}

/// Combine Secondary Results//////
async function updateSecondaryWeather() {
	Promise.all([updateWind(), updateAQI(), updateHumidity(), updatePressure()]);
}

async function updateForecast() {
	if (tempMaxF1) tempMaxF1.textContent = roundToString(forecast.day1.max);
	if (tempMinF1) tempMinF1.textContent = roundToString(forecast.day1.min);
	if (day1) day1.textContent = forecast.day1.day;

	if (tempMaxF2) tempMaxF2.textContent = roundToString(forecast.day2.max);
	if (tempMinF2) tempMinF2.textContent = roundToString(forecast.day2.min);
	if (day2) day2.textContent = forecast.day2.day;

	if (tempMaxF3) tempMaxF3.textContent = roundToString(forecast.day3.max);
	if (tempMinF3) tempMinF3.textContent = roundToString(forecast.day3.min);
	if (day3) day3.textContent = forecast.day3.day;
}

// Update everything //
async function updateDOM(city: string, state: string = 'CA', country: string = 'US') {
	await processWeather(city, state, country);
	Promise.all([updateTemp(), updateWeather(), updateSecondaryWeather(), updateForecast()]);
}

// updateDOM();

formLocation?.addEventListener('submit', (e) => {
	e.preventDefault();
	updateDOM(cityInput.value, stateInput.value, countryInput.value);
	formLocation.reset();
});
