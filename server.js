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

app.put('/players/fixture/save-match', (req, res) => {
  const id = req.query.id; // Obtain the match ID from the query string

  const ht_goals = req.body.result.htGoals;
  const aw_goals = req.body.result.awGoals;
  // Convert scorers and assists to the desired format
  const formatWithCounter = (array) => array.map(item => `${item.id}x${item.counter}`).join(',');
  const scorers = formatWithCounter(req.body.result.scorers);
  const assists = formatWithCounter(req.body.result.assists);

  // Convert yellow_card and red_card
  const formatWithoutCounter = (array) => array.map(item => item.id).join(',');
  const yellow_card = formatWithoutCounter(req.body.result.yellowCards);
  const red_card = formatWithoutCounter(req.body.result.redCards);
  const injured = formatWithoutCounter(req.body.result.injured);

  // Extract the id for motm
  const motm = req.body.result.motm ? req.body.result.motm.id : null;

  const played = req.body.result.played ? req.body.result.played : null;

  // Create the SQL query
  const query = `UPDATE fixtures SET ht_goals = ?, aw_goals = ?, scorers = ?, assists = ?, motm = ?, yellow_card = ?, red_card = ?, injured = ?, played = ? WHERE id_game = ?`;

  // Execute the query
  connection.query(query, [ht_goals, aw_goals, scorers, assists, motm, yellow_card, red_card, injured, played, id], (error, results) => {
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

// API endpoint to retrieve top scorer info from the database
app.get('/players/players_list/top_players', (req, res) => {
  const category = req.query.category;
  const query = `SELECT * FROM players_list WHERE ${category} = (SELECT MAX(${category}) FROM players_list);`;
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