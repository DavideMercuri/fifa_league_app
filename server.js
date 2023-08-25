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
  const queryMatchUpdate = `UPDATE fixtures SET ht_goals = ?, aw_goals = ?, scorers = ?, assists = ?, motm = ?, yellow_card = ?, red_card = ?, injured = ?, played = ? WHERE id_game = ?`;

  // Execute the query
  connection.query(queryMatchUpdate, [ht_goals, aw_goals, scorers, assists, motm, yellow_card, red_card, injured, played, id], (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(results);
    }
  });

  // Retrieve the game details to update the league_table
  connection.query('SELECT home_team, away_team, ht_goals, aw_goals FROM fixtures WHERE id_game = ?', [id], (error, gameDetails) => {
    if (error || gameDetails.length === 0) {
      return res.status(500).send(error || 'Game not found');
    }

    const { home_team, away_team, ht_goals, aw_goals } = gameDetails[0];
    let homePoints = 0;
    let awayPoints = 0;

    if (ht_goals > aw_goals) {
      homePoints += 3;
    } else if (aw_goals > ht_goals) {
      awayPoints += 3;
    } else {
      homePoints += 1;
      awayPoints += 1;
    }

    // Update points for home team
    connection.query('UPDATE league_table SET points = points + ? WHERE team = ?', [homePoints, home_team], (error) => {
      if (error) {
        return res.status(500).send(error);
      }

      // Update points for away team
      connection.query('UPDATE league_table SET points = points + ? WHERE team = ?', [awayPoints, away_team], (error) => {
        if (error) {
          return res.status(500).send(error);
        }
      });
    });
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

// API endpoint to retrieve fixtures data from the database
app.get('/players/roles', (req, res) => {

  const query = 'SELECT DISTINCT position FROM players_list';
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});

// API endpoint to retrieve fixtures data from the database
app.get('/players/teams', (req, res) => {

  const query = 'SELECT DISTINCT team FROM players_list';
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});

// API endpoint to retrieve fixtures data from the database
app.get('/players/players_list/filters', (req, res) => {
  let { name, position, team } = req.query;
  let query = 'SELECT * FROM players_list';
  let queryParams = [];

  if (name || position || team) {
    query += ' WHERE';
    let conditions = [];

    if (name) {
      conditions.push('name LIKE ?');
      queryParams.push('%' + name + '%');
    }
    if (position) {
      conditions.push('position = ?');
      queryParams.push(position);
    }
    if (team) {
      conditions.push('team = ?');
      queryParams.push(team);
    }

    query += ' ' + conditions.join(' AND ');

    console.log();
  }

  connection.query(query, queryParams, (error, results) => {
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

app.get('/players/getWins', (req, res) => {
  const query = `
      SELECT teams.team,
          COALESCE(victories.total_home_wins, 0) AS total_home_wins,
          COALESCE(victories.total_away_wins, 0) AS total_away_wins
    FROM (
        SELECT home_team AS team FROM fixtures
        UNION
        SELECT away_team AS team FROM fixtures
    ) AS teams
    LEFT JOIN (
        SELECT team,
              SUM(home_wins) AS total_home_wins,
              SUM(away_wins) AS total_away_wins
        FROM (
            SELECT home_team AS team,
                  COUNT(*) AS home_wins,
                  0 AS away_wins
            FROM fixtures
            WHERE ht_goals > aw_goals AND played = 'yes'
            GROUP BY home_team
            UNION ALL
            SELECT away_team AS team,
                  0 AS home_wins,
                  COUNT(*) AS away_wins
            FROM fixtures
            WHERE aw_goals > ht_goals AND played = 'yes'
            GROUP BY away_team
        ) AS Subquery
        GROUP BY team
    ) AS victories ON teams.team = victories.team;`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.get('/players/getLosses', (req, res) => {
  const query = `
      SELECT teams.team,
            COALESCE(losses.total_home_losses, 0) AS total_home_losses,
            COALESCE(losses.total_away_losses, 0) AS total_away_losses
      FROM (
          SELECT home_team AS team FROM fixtures
          UNION
          SELECT away_team AS team FROM fixtures
      ) AS teams
      LEFT JOIN (
          SELECT team,
                SUM(home_losses) AS total_home_losses,
                SUM(away_losses) AS total_away_losses
          FROM (
              SELECT home_team AS team,
                    COUNT(*) AS home_losses,
                    0 AS away_losses
              FROM fixtures
              WHERE ht_goals < aw_goals AND played = 'yes'
              GROUP BY home_team
              UNION ALL
              SELECT away_team AS team,
                    0 AS home_losses,
                    COUNT(*) AS away_losses
              FROM fixtures
              WHERE aw_goals < ht_goals AND played = 'yes'
              GROUP BY away_team
          ) AS Subquery
          GROUP BY team
      ) AS losses ON teams.team = losses.team;`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

app.get('/players/getDraws', (req, res) => {
  const query = `
      SELECT teams.team,
            COALESCE(draws.total_home_draws, 0) AS total_home_draws,
            COALESCE(draws.total_away_draws, 0) AS total_away_draws
      FROM (
          SELECT home_team AS team FROM fixtures
          UNION
          SELECT away_team AS team FROM fixtures
      ) AS teams
      LEFT JOIN (
          SELECT team,
                SUM(home_draws) AS total_home_draws,
                SUM(away_draws) AS total_away_draws
          FROM (
              SELECT home_team AS team,
                    COUNT(*) AS home_draws,
                    0 AS away_draws
              FROM fixtures
              WHERE ht_goals = aw_goals AND played = 'yes'
              GROUP BY home_team
              UNION ALL
              SELECT away_team AS team,
                    0 AS home_draws,
                    COUNT(*) AS away_draws
              FROM fixtures
              WHERE ht_goals = aw_goals AND played = 'yes'
              GROUP BY away_team
          ) AS Subquery
          GROUP BY team
      ) AS draws ON teams.team = draws.team;`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

module.exports = connection;