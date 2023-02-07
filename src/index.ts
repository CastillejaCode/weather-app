import './style.css';

const tempMain = document.querySelector('.main');
const tempMax = document.querySelector('.max');
const tempMin = document.querySelector('.min');

const condition = document.querySelector('.condition');
const img = document.querySelector('img');
const place = document.querySelector('.place');

const windDeg = document.querySelector('.wind-direction');
const windSpeed = document.querySelector('.wind-speed');

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
		const weatherAPI = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=021c218898d176e59a1c863a9256aa3d`
		);
		const weatherParsed = await weatherAPI.json();
		console.log(weatherParsed);
		return weatherParsed;
	} catch (err) {
		console.log(err);
	}
}

async function processWeather() {
	const weatherObject = await getWeather();

	weather = {
		condition: weatherObject.weather[0].main,
		icon: weatherObject.weather[0].icon,
		place: weatherObject.name,
		temp: weatherObject.main.temp,
		tempMax: weatherObject.main.temp_max,
		tempMin: weatherObject.main.temp_min,
		feelsLike: weatherObject.main.feels_like,
		humidity: weatherObject.main.humidity,
		windDeg: weatherObject.wind.deg,
		windSpeed: weatherObject.wind.speed,
	};
}

function roundToString(num: number) {
	return Math.round(num).toString();
}

function convertWindDirection(degree: number) {
	let direction = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
	return direction[Math.round((degree % 360) / 45)];
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

async function updateDOM() {
	await processWeather();
	updateTemp();
	updateWeather();
	updateWind();
}

updateDOM();
