/*
 * Max Ovitsky, Kaushik Chaudhary, Francis Phan
 * CS465P -- Weather App
 *
 * This file handles the API calls to three different APIs:
 *  - MapQuest: Returns the geocode for the location specified
 *  - OpenWeather: Returns the future forcast for location specified
 *  - AirVisual: Returns the air quality index for location specified
 *
 * Notes:
 * -  OpenWeather API changed to get daily data
 * -  Now getting 7 days worth of data
 * -  Combined the two external functions so they return a single object
 */

const axios = require("axios");

module.exports = {
  getCoords: async function (location) {
    //Query MapQuest API to get a JSON object in order to get
    //the geocode for the location entered.
    const url = "http://www.mapquestapi.com/geocoding/v1/address?key=";
    const key = process.env.MQ_API_KEY;
    const query = `${url}${key}&location=${location}`;

    const response = await axios.get(query);
    const data = await response.data;
    const geocode = data.results[0].locations[0].displayLatLng;
    let lat = geocode.lat;
    let lng = geocode.lng;
    //Create object to store OpenWeather and AirVisual API call data
    let obj = [];
    obj.weather = await this.getWeather(lat, lng);
    obj.aq = await this.getAQ(lat, lng);

    return obj;
  },
  getWeather: async function (lat, lng) {
    //Query OpenWeather API to get a JSON object in order to get the
    //future weather forcasts

    //Need to change the API to be daily weather and not 5 day 3 hour intervals
    const url = "https://api.openweathermap.org/data/2.5/onecall?";
    const key = process.env.OW_API_KEY;
    const query = `${url}lat=${lat}&lon=${lng}&
    exclude=current,minutely,hourly&appid=${key}`;

    const response = await axios.get(query);
    const data = await response.data;
    return getWeatherContents(data);
  },
  getAQ: async function (lat, lng) {
    //Query AirVisual API to get a JSON object in order to the current air
    //quality index of the location specified
    const url = "http://api.airvisual.com/v2/nearest_city?";
    const key = process.env.AV_API_KEY;
    const query = `${url}lat=${lat}&lon=${lng}&key=${key}`;

    const response = await axios.get(query);
    const data = await response.data;
    return getAirQualityContents(data);
  },
};

//Gets the current weather forcast and the next 7 days
function getWeatherContents(response) {
  //create object that will be returned
  let array = [];
  const weatherData = response.daily;
  //Parse JSON for necessary data to display
  for (let i = 0; i < weatherData.length; ++i) {
    let x = weatherData[i];
    let conditionValue = x["weather"][0]["main"]; //string format
    let descriptionValue = x["weather"][0]["description"]; //string format
    let tempLo = x["temp"]["min"]; //in Kelvins
    let tempHi = x["temp"]["max"]; //in Kelvins
    let windValue = x["wind_speed"]; //in meters per second

    //Capitalize the first letters of the strings
    conditionValue =
      conditionValue.charAt(0).toUpperCase() + conditionValue.slice(1);
    descriptionValue =
      descriptionValue.charAt(0).toUpperCase() + descriptionValue.slice(1);

    //Convert from Kelvins to F and C
    let tempValue = (tempLo + tempHi) / 2; //average temp in Kelvins
    let tempF = Math.round(((tempValue - 273.15) * (9 / 5) + 32) * 10) / 10;
    let tempC = Math.round((tempValue - 273.15) * 10) / 10;

    //Convert wind speeds to from meters per hour to miles per hour
    let windSpeed = Math.round(windValue * 2.237 * 10) / 10;

    //Create JSON object to add to array
    let obj = {
      condition: conditionValue,
      description: descriptionValue,
      tempFar: tempF,
      tempCel: tempC,
      wind: windSpeed,
    };
    array.push(obj);
  }
  return array;
}

//Parse response from Air Visual to get AQI and main pollutant
function getAirQualityContents(response) {
  // Get current air quality
  let airQuality = response.data.current.pollution.aqius;
  let mainPollutant = response.data.current.pollution.mainus;

  // Create object to return to client
  let obj = {
    aqi: airQuality,
    pol: mainPollutant,
  };
  return obj;
}
