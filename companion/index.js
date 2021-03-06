import * as messaging from "messaging";

var ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";

function queryOpenWeather(latitude,longitude,units,api_key) {
  fetch(ENDPOINT + "?lat=" + latitude + "&lon=" + longitude + "&APPID=" + api_key + "&units=" + units)
  .then(function (response) {
      response.json()
      .then(function(data) {
        var weather = {
          temperature: data["main"]["temp"],
          icon: data["weather"][0]["icon"],
          location : data["name"]
        }
        // Send the weather data to the device
        returnWeatherData(weather);
      });
  })
  .catch(function (err) {
    console.error(`Error fetching weather: ${err}`);
  });
}

function returnWeatherData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.error("Error: Connection is not open");
  }
}

messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data && evt.data.command === "weather") {
    queryOpenWeather(evt.data.latitude,evt.data.longitude,evt.data.units,evt.data.api_key);
  }
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});