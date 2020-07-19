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
 * -  Need to change OpenWeather API to be daily forcast only and not
 *    the current 5 days 3 hours one
 * -  Hide API keys (use dotenv?)
 */

const axios = require("axios");

module.exports = {
  getCoords: async function (location, num) {
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
    //OpenWeather API call
    if (num === 1) return this.getWeather(lat, lng);
    if (num === 2) return this.getAQ(lat, lng);
  },
  getWeather: async function (lat, lng) {
    //Query OpenWeather API to get a JSON object in order to get the
    //future weather forcasts

    //Need to change the API to be daily weather and not 5 day 3 hour intervals
    const url = "http://api.openweathermap.org/data/2.5/forecast?";
    const key = process.env.OW_API_KEY;
    const query = `${url}lat=${lat}&lon=${lng}&appid=${key}`;

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

//Gets the current weather forcast
//Currently only gets current date, need to make a loop once new api is used
function getWeatherContents(response) {
  //Parse JSON for necessary data to display
  let conditionValue = response.list[0]["weather"][0]["main"]; //string format
  let descriptionValue = response.list[0]["weather"][0]["description"]; //string format
  let tempValue = response.list[0]["main"]["temp"]; //in Kelvins
  let windValue = response.list[0]["wind"]["speed"]; //in meters per second

  //Capitalize the first letters of the strings
  conditionValue =
    conditionValue.charAt(0).toUpperCase() + conditionValue.slice(1);
  descriptionValue =
    descriptionValue.charAt(0).toUpperCase() + descriptionValue.slice(1);

  //Convert from Kelvins to F and C
  let tempF = Math.round(((tempValue - 273.15) * (9 / 5) + 32) * 10) / 10;
  let tempC = Math.round((tempValue - 273.15) * 10) / 10;

  //Convert wind speeds to from meters per hour to miles per hour
  let windSpeed = Math.round(windValue * 2.237 * 10) / 10;

  //Create object to return to client
  let obj = [];
  obj.condition = conditionValue;
  obj.description = descriptionValue;
  obj.tempFar = tempF;
  obj.tempCel = tempC;
  obj.wind = windSpeed;

  console.log(obj);
  return obj;
}

//Parse response from Air Visual to get AQI
function getAirQualityContents(response) {
  // Get current air quality
  let airQuality = response.data.current.pollution.aqius;

  // Create object to return to client
  let obj = [];
  obj.aqi = airQuality;

  console.log(obj);
  return obj;
}
