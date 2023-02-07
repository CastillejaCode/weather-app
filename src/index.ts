import './style.css';

const tempMain = document.querySelector('.main');
const tempMax = document.querySelector('.max');
const tempMin = document.querySelector('.min');

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
		const weather = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=021c218898d176e59a1c863a9256aa3d`
		);
		const weatherParsed = await weather.json();
		console.log(weatherParsed);
		return weatherParsed;
	} catch (err) {
		console.log(err);
	}
}

async function processWeather() {
	const weather = await getWeather();

	const object = {
		temp: weather.main.temp,
		tempMax: weather.main.temp_max,
		tempMin: weather.main.temp_min,
		feelsLike: weather.main.feels_like,
		humidity: weather.main.humidity,
	};

	return object;
}

async function updateDOM() {
	const weather = await processWeather();
	if (tempMain) tempMain.textContent = Math.round(weather.temp).toString();
	if (tempMax) tempMax.textContent = Math.round(weather.tempMax).toString();
	if (tempMin) tempMin.textContent = Math.round(weather.tempMin).toString();
}

updateDOM();
