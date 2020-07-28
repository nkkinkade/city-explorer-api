'use strict';

// Application Dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(cors());

// Route Definitions
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/yelp', restaurantHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);

// Route Handlers
function notFoundHandler(request, response) {
  response.status(404).json({ message: 'What were you looking for?' });
}

function errorHandler(error, request, response, next) {
  response.status(500).json({ error: true, message: error.message });
}

function locationHandler(request, response) {
  const city = 'seattle';
  const locationData = require('./data/location.json');
  const location = new Location(city, locationData);
  response.status(200).send(location);
}

function weatherHandler(request, response) {
  const weatherData = require('./data/weather.json');
  const arrayOfWeathers = weatherData.data;
  const weatherResults = [];
  arrayOfWeathers.forEach((weather) => {
    weatherResults.push(new Weather(weather));
  });
  response.status(200).send(weatherResults);
}
	
function restaurantHandler(request, response) {
  const restaurantsData = require('./data/restaurants.json');
  const arrayOfRestaurants = restaurantsData.nearby_restaurants;
  const restaurantsResults = [];
  arrayOfRestaurants.forEach(restaurantObj => {
    restaurantsResults.push(new Restaurant(restaurantObj));
  });
  response.send(restaurantsResults);
}

// Constructors
function Location(city, locationData) {
  this.search_query = city;
  this.formatted_query = locationData[0].display_name;
  this.latitude = parseFloat(locationData[0].lat);
  this.longitude = parseFloat(locationData[0].lon);
}

function Weather(weatherObj) {
  this.time = weatherObj.datetime;
  this.forecast = weatherObj.weather.description;
}
	
function Restaurant(obj) {
  this.name = obj.restaurant.name;
  this.url = obj.restaurant.url;
  this.rating = obj.restaurant.user_rating.aggregate_rating;
  this.price = obj.restaurant.price_range;
  this.image_url = obj.restaurant.featured_image;
}

// App listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
