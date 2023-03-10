import './style.css';
import format from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';
import { animate, stagger } from 'motion';

// DOM Elements //
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

const buttonLocation = document.querySelector('.add-location');
const formLocation = document.querySelector('form');
const cityInput = document.querySelector('#city') as HTMLInputElement;
const stateInput = document.querySelector('#state') as HTMLInputElement;
const countryInput = document.querySelector('#country') as HTMLInputElement;
const buttonExit = document.querySelector('.exit');

const loadingScreen = document.querySelector('.loading-screen');
const error = document.querySelector('.error');

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

// Global fetched objects
let weather: Weather;
let forecast: Forecast;

async function getWeather(city: string, state: string = 'CA', country: string = 'US') {
	try {
		// Location
		const place = await fetch(
			`https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&appid=021c218898d176e59a1c863a9256aa3d
        `,
			{ mode: 'cors' }
		);
		const placeParsed = await place.json();

		let lat, lon;
		[lat, lon] = [placeParsed[0].lat, placeParsed[0].lon];

		// Set cooridnates to local storage
		setLocalStorage(city, state, country);

		// AQI information
		const aqi = await fetch(
			`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=021c218898d176e59a1c863a9256aa3d`,
			{ mode: 'cors' }
		);
		const aqiParsed = await aqi.json();

		// forecast information
		const forecast = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&current_weather=true&temperature_unit=fahrenheit&timeformat=unixtime&timezone=America%2FLos_Angeles`,
			{ mode: 'cors' }
		);
		const forecastParsed = await forecast.json();

		// Main weather information
		const weatherAPI = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=021c218898d176e59a1c863a9256aa3d`,
			{ mode: 'cors' }
		);
		const weatherParsed = await weatherAPI.json();

		return [weatherParsed, aqiParsed, forecastParsed];
	} catch (err) {
		console.log(err);
		if (error) {
			error.textContent = `Please enter a real city`;
			setTimeout(() => {
				error.textContent = '';
			}, 2000);
		}
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

// Helper Functions //
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
//	Helper Functions //

// Weather Async function //
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

// Local Storage //
function setLocalStorage(city: string, state: string, country: string) {
	localStorage.setItem('city', `${city}`);
	localStorage.setItem('state', `${state}`);
	localStorage.setItem('country', `${country}`);
}

// Update everything //
async function updateDOM(city: string, state: string = 'CA', country: string = 'US') {
	// Loading screen
	insertLoading(true);
	loadingScreen?.classList.remove('-translate-x-[100vw]');

	try {
		await processWeather(city, state, country);
		await Promise.all([updateTemp(), updateWeather(), updateSecondaryWeather(), updateForecast()]);
	} catch (err) {
		console.log(err);
	}

	img?.addEventListener('load', () => {
		loadingScreen?.classList.add('-translate-x-[100vw]');
		formLocation?.classList.add('-translate-x-[100vw]');
		setTimeout(() => {
			insertLoading(false);
		}, 500);
	});

	// Potential changing background based on daytime/ nighttime

	// if (weather.icon.includes('n')) {
	// 	document.querySelector('body')?.classList.add('night');
	// } else document.querySelector('body')?.classList.remove('night');
}

function initializeDOM() {
	const city = localStorage.getItem('city');
	const state = localStorage.getItem('state');
	const country = localStorage.getItem('country');
	if (city && state && country) updateDOM(city, state, country);
	else if (city && state) updateDOM(city, state);
	else if (city) updateDOM(city);
	else return;
}
initializeDOM();

// DOM //
buttonLocation?.addEventListener('click', () => {
	formLocation?.classList.remove('-translate-x-[100vw]');
	cityInput.focus();
});

buttonExit?.addEventListener('click', () => {
	formLocation?.classList.add('-translate-x-[100vw]');
});

formLocation?.addEventListener('submit', (e) => {
	e.preventDefault();
	updateDOM(cityInput.value, stateInput.value, countryInput.value);
	formLocation.reset();
});

// Motion One Example Loading SVG //
function insertLoading(condition: boolean) {
	if (condition) {
		loadingScreen?.insertAdjacentHTML(
			'afterbegin',
			`
			<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
					<g class="segment">
						<path
							id="loading-path"
							d="M 94 25 C 94 21.686 96.686 19 100 19 L 100 19 C 103.314 19 106 21.686 106 25 L 106 50 C 106 53.314 103.314 56 100 56 L 100 56 C 96.686 56 94 53.314 94 50 Z"
						></path>
					</g>
					<g class="segment">
						<use href="#loading-path" style="transform: rotate(45deg); transform-origin: 100px 100px" />
					</g>
					<g class="segment">
						<use href="#loading-path" style="transform: rotate(90deg); transform-origin: 100px 100px" />
					</g>
					<g class="segment">
						<use href="#loading-path" style="transform: rotate(135deg); transform-origin: 100px 100px" />
					</g>
					<g class="segment">
						<use href="#loading-path" style="transform: rotate(180deg); transform-origin: 100px 100px" />
					</g>
					<g class="segment">
						<use href="#loading-path" style="transform: rotate(225deg); transform-origin: 100px 100px" />
					</g>
					<g class="segment">
						<use href="#loading-path" style="transform: rotate(270deg); transform-origin: 100px 100px" />
					</g>
					<g class="segment">
						<use href="#loading-path" style="transform: rotate(315deg); transform-origin: 100px 100px" />
					</g>
				</svg>
		`
		);
		const numSegments = document.querySelectorAll('.segment').length;

		/**
		 * Stagger offset (in seconds)
		 * Decrease this to speed the animation up or increase
		 * to slow it down.
		 */
		const offset = 0.09;

		animate(
			'.segment',
			{ opacity: [0, 1, 0] },
			{
				offset: [0, 0.1, 1],
				duration: numSegments * offset,
				delay: stagger(offset),
				repeat: Infinity,
			}
		);
	} else loadingScreen?.querySelector('svg')?.remove();
}

// TODO: Favicon
