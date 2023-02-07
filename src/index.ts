import './style.css';

const tempMain = document.querySelector('.main');
const tempMax = document.querySelector('.max');
const tempMin = document.querySelector('.min');

const condition = document.querySelector('.condition');
const img = document.querySelector('img');
const place = document.querySelector('.place');

const windDeg = document.querySelector('.wind-direction');
const windSpeed = document.querySelector('.wind-speed');

const aqi = document.querySelector('.aqi');

const humidity = document.querySelector('.humidity');

const pressure = document.querySelector('.pressure');

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

let weather: Weather;

async function getWeather() {
	try {
		const place = await fetch(
			`http://api.openweathermap.org/geo/1.0/direct?q=${'Palmdale'},${'CA'},${'US'}&appid=021c218898d176e59a1c863a9256aa3d
        `,
			{ mode: 'cors' }
		);
		const placeParsed = await place.json();

		let lat, lon;
		[lat, lon] = [placeParsed[0].lat, placeParsed[0].lon];

		const aqi = await fetch(
			`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=021c218898d176e59a1c863a9256aa3d`
		);
		const aqiParsed = await aqi.json();

		const weatherAPI = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=021c218898d176e59a1c863a9256aa3d`
		);
		const weatherParsed = await weatherAPI.json();

		return [weatherParsed, aqiParsed];
	} catch (err) {
		console.log(err);
	}
}

async function processWeather() {
	const array = await getWeather();
	if (array) {
		const weatherObject = array[0];
		const aqiObject = array[1];
		weather = {
			condition: weatherObject.weather[0].main,
			icon: weatherObject.weather[0].icon,
			place: weatherObject.name,
			temp: weatherObject.main.temp,
			tempMax: weatherObject.main.temp_max,
			tempMin: weatherObject.main.temp_min,
			feelsLike: weatherObject.main.feels_like,
			humidity: weatherObject.main.humidity,
			pressure: weatherObject.main.pressure,
			windDeg: weatherObject.wind.deg,
			windSpeed: weatherObject.wind.speed,
			aqi: aqiObject.list[0].main.aqi,
		};
	}
	console.log(weather);
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

async function updateSecondaryWeather() {
	Promise.all([updateWind(), updateAQI(), updateHumidity(), updatePressure()]);
}

async function updateDOM() {
	await processWeather();
	Promise.all([updateTemp(), updateWeather(), updateSecondaryWeather()]);
}

updateDOM();
