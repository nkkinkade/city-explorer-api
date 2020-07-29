'use strict';

// Application Dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(cors());

// Route Definitions
app.get('/', rootHandler);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/yelp', restaurantHandler);
app.get('/trails', trailsHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);

// Route Handlers
function rootHandler(request, response){
  response.status(200).send('City Explorer back-end')
}

function notFoundHandler(request, response) {
  response.status(404).json({ message: 'What were you looking for?' });
}

function errorHandler(error, request, response, next) {
  response.status(500).json({ error: true, message: error.message });
}

function locationHandler(request, response) {
  const city = request.query.city;
  const url = 'https://us1.locationiq.com/v1/search.php';
  superagent.get(url)
    .query({
      key: process.env.LOCATION_KEY,
      q: city,
      format: 'json'
    })
    .then(locationIQResponse => {
      const topLocation = locationIQResponse.body[0];
      const myLocationResponse = new Location(city, topLocation);
      response.status(200).send(myLocationResponse);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

function weatherHandler(request, response) {
  const latitude = parseFloat(request.query.latitude);
  const longitude = parseFloat(request.query.longitude);
  const url = 'https://api.weatherbit.io/v2.0/forecast/daily';
  superagent.get(url)
    .query({
      key: process.env.WEATHER_KEY,
      lat: latitude,
      lon: longitude
    })
    .then(weatherResponse => {
      const arrayOfWeatherData = weatherResponse.body.data;
      const weatherResults = arrayOfWeatherData.map(weather => new Weather(weather));
      response.send(weatherResults)
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response)
    });
}

function restaurantHandler(request, response) {
  const lat = parseFloat(request.query.latitude);
  const lon = parseFloat(request.query.longitude);
  const page = request.query.page;
  const restaurantPerPage = 5;
  const start = ((page - 1) * restaurantPerPage + 1);
  const url = 'https://api.yelp.com/v3/businesses/search';
  superagent.get(url)
    .query({
      latitude: lat,
      longitude: lon,
      limit: restaurantPerPage,
      offset: start
    })
    .set('Authorization', `Bearer ${process.env.YELP_KEY}`)
    .then(yelpResponse => {
      const arrayOfRestaurants = yelpResponse.body.businesses;
      const restaurantsResults = arrayOfRestaurants.map(restaurantObj => new Restaurant(restaurantObj));
      response.send(restaurantsResults);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response)
    });
}

function trailsHandler(request, response) {
  const latitude = parseInt(request.query.latitude);
  const longitude = parseInt(request.query.longitude);
  const url = 'https://www.hikingproject.com/data/get-trails';
  superagent.get(url)
    .query({
      key: process.env.TRAILS_KEY,
      lat: latitude,
      lon: longitude,
      maxDistance: 200
    })
    .then(trailResponse => {
      console.log(trailResponse.body);
      const arrayOfTrailData = trailResponse.body.trails;
      const trailResults = arrayOfTrailData.map(trail => new Trails(trail));
      response.send(trailResults);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response)
    });
}

// Constructors
function Location(city, location) {
  this.search_query = city;
  this.formatted_query = location.display_name;
  this.latitude = parseFloat(location.lat);
  this.longitude = parseFloat(location.lon);
}

function Weather(weatherObj) {
  this.time = weatherObj.datetime;
  this.forecast = weatherObj.weather.description;
}

function Restaurant(obj) {
  this.name = obj.name;
  this.url = obj.url;
  this.rating = obj.rating;
  this.price = obj.price;
  this.image_url = obj.image_url;
}

function Trails(trail) {
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = trail.starVotes;
  this.summary = trail.summary;
  this.trail_url = trail.url;
  this.conditions = trail.conditionStatus;
  this.conditionDate = trail.conditionDate;
}

// App listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
