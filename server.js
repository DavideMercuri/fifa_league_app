const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Set up a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'players'
});

// Allow CORS requests
app.use(cors());

// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// API endpoint to retrieve fixtures data from the database
app.get('/players/fixtures', (req, res) => {

  const query = 'SELECT * FROM fixtures';
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(results);
    }

  });
});

// API endpoint to retrieve single match info from the database
app.get('/players/fixture', (req, res) => {
  const id = req.query.id; // Ottieni l'ID del match dalla query string
  const query = `SELECT * FROM fixtures WHERE id_game = ${id}`;
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});

// API endpoint to retrieve fixtures data from the database
app.get('/players/players_list', (req, res) => {

  const query = 'SELECT * FROM players_list';
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(results);
    }

  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

module.exports = connection;