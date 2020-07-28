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

app.use('*', notFoundHandler);
app.use(errorHandler);

// Route Handlers
function notFoundHandler(request, response) {
  response.status(404).json({ notFound: true });
}

function errorHandler(error, request, response, next) {
  response.status(500).json({ error: true, message: error.message });
}

// App listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
