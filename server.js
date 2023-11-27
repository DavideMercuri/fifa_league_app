const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const authMiddleware = require('./authMiddleware');
const cors = require('cors');
const bodyParser = require('body-parser');
const util = require('util');
const bcrypt = require('bcrypt');

const SECRET_KEY = '7l5Ywkc6gV';


const app = express();

// Set up a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'players'
});
connection.connect();

// Promisificazione delle funzioni di mysql
const query = util.promisify(connection.query).bind(connection);

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const rows = await query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(400).send({ message: 'Utente non trovato.' });
    }

    const user = rows[0];
    if (password == user.password) {
      const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
      res.send({ token });
    } else {
      res.status(400).send({ message: 'Password errata.' });
    }

  } catch (err) {
    res.status(500).send({ message: 'Errore durante il login.' });
  }
});

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

// Un endpoint protetto come esempio
app.get('/players/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Benvenuto nella zona protetta!' });
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

// Promisifica la query per poterla usare con async/await
const queryAsync = util.promisify(connection.query).bind(connection);


app.put('/players/fixture/save-match', async (req, res) => {
  try {

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
    const red_card = formatWithCounter(req.body.result.redCards);
    const injured = formatWithCounter(req.body.result.injured);
    // Extract the id for motm
    const motm = req.body.result.motm ? req.body.result.motm.id : null;
    const played = req.body.result.played ? req.body.result.played : null;
    // Create the SQL query
    const queryMatchUpdate = `UPDATE fixtures SET ht_goals = ?, aw_goals = ?, scorers = ?, assists = ?, motm = ?, yellow_card = ?, red_card = ?, injured = ?, played = ? WHERE id_game = ?`;

    await queryAsync(queryMatchUpdate, [ht_goals, aw_goals, scorers, assists, motm, yellow_card, red_card, injured, played, id]);

    // Funzioni di aiuto per effettuare l'aggiornamento
    const updatePlayer = async (field, id, value) => {
      const query = `UPDATE players_list SET ${field} = ${field} + ? WHERE id = ?`;
      await queryAsync(query, [value, id]);
    };
    const updateScorersAndAssists = async (data, field) => {
      const items = data.split(',');
      for (let item of items) {
        const [id, count] = item.split('x').map(Number);
        await updatePlayer(field, id, count);
      }
    };
    const updateOtherFields = async (data, field) => {

      var items;
      if (typeof data === 'string' && data.includes(",")) {
        items = data.split(',');
      } else {
        items = Array.isArray(data) ? data : [data];  // Make sure it's an array
      }
      for (let id of items) {
        await updatePlayer(field, id, 1);
      }
    };

    await updateScorersAndAssists(scorers, 'goals');
    await updateScorersAndAssists(assists, 'assist');
    await updateOtherFields(motm, 'motm');
    await updateOtherFields(yellow_card, 'yellow_card');
    await updateScorersAndAssists(red_card, 'red_card');
    await updateScorersAndAssists(injured, 'injured');


    const processNotations = async (notationField, dataField) => {
      const data = dataField.split(',').map(item => {
        const [playerId, length] = item.split('x').map(Number);
        return { playerId, length };
      });

      for (let { playerId, length } of data) {
        const teamOfPlayerQuery = `SELECT team FROM players_list WHERE id = ?`;
        const playerTeamResult = await queryAsync(teamOfPlayerQuery, [playerId]);

        if (playerTeamResult.length) {
          const playerTeam = playerTeamResult[0].team;

          const subsequentMatchesQuery = `
                  SELECT f2.id_game
                  FROM fixtures AS f1
                  JOIN fixtures AS f2 ON (
                      (f2.home_team = ? OR f2.away_team = ?) AND 
                      f2.matchday > f1.matchday
                  )
                  WHERE f1.id_game = ?
                  ORDER BY f2.matchday ASC
                  LIMIT ?`;

          const subsequentMatches = await queryAsync(subsequentMatchesQuery, [playerTeam, playerTeam, id, length]);

          for (let match of subsequentMatches) {
            const updateMatch = `
                      UPDATE fixtures 
                      SET ${notationField} = CONCAT(IFNULL(${notationField},''), ?, ',') 
                      WHERE id_game = ?`;

            await queryAsync(updateMatch, [playerId, match.id_game]);
          }
        }
      }
    };

    await processNotations('notation_expelled', red_card);
    await processNotations('notation_injured', injured);


    // Update league_table
    // 1. Determina il risultato della partita
    let winning_team = null;
    let is_draw = false;

    if (ht_goals > aw_goals) {
      winning_team = req.body.result.home_team;
    } else if (aw_goals > ht_goals) {
      winning_team = req.body.result.away_team;
    } else {
      is_draw = true;
    }
    // 2. Esegui le query per aggiornare la tabella league_table in base al risultato
    if (is_draw) {
      // Pareggio, entrambi i team ricevono +1 punto
      await queryAsync(`UPDATE league_table SET points = points + 1 WHERE team IN (?, ?)`, [req.body.result.home_team, req.body.result.away_team]);
    } else {
      // Uno dei team ha vinto e riceve +3 punti
      await queryAsync(`UPDATE league_table SET points = points + 3 WHERE team = ?`, [winning_team]);
    }
    res.status(200).send({ message: 'Update successful' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
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

  const query = 'SELECT DISTINCT position FROM players_list ORDER BY position ASC';
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

  const query = 'SELECT DISTINCT team FROM players_list ORDER BY team ASC';
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});

// API endpoint to retrieve fixtures data from the database
app.get('/players/team-detail', (req, res) => {

  const id = req.query.id;
  const query = `SELECT * FROM teams WHERE team_id = ${id}`;
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

// API endpoint to retrieve fixtures data from the database
app.get('/players/league_table', (req, res) => {

  const query = `
    WITH Teams AS (
      SELECT home_team AS team FROM fixtures
      UNION
      SELECT away_team AS team FROM fixtures
  ),

  Victories AS (
      SELECT team,
            SUM(home_wins + away_wins) AS wins
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
  ),

  Losses AS (
      SELECT team,
            SUM(home_losses + away_losses) AS losses
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
  ),

  Draws AS (
      SELECT team,
            SUM(home_draws + away_draws) AS draws
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
  ),

GamesPlayed AS (
    SELECT team, COUNT(*) AS games_played
    FROM (
        SELECT home_team AS team
        FROM fixtures
        WHERE played = 'yes'
        UNION ALL
        SELECT away_team AS team
        FROM fixtures
        WHERE played = 'yes'
    ) AS Subquery
    GROUP BY team
)

      SELECT ROW_NUMBER() OVER (ORDER BY L.points DESC) AS position,
            T.team,
            L.id,
            L.team_logo,
            L.points,
            COALESCE(V.wins, 0) AS wins,
            COALESCE(Ls.losses, 0) AS losses,
            COALESCE(D.draws, 0) AS draws,
            COALESCE(G.games_played, 0) AS games_played
      FROM Teams T
      JOIN league_table L ON T.team = L.team
      LEFT JOIN Victories V ON T.team = V.team
      LEFT JOIN Losses Ls ON T.team = Ls.team
      LEFT JOIN Draws D ON T.team = D.team
      LEFT JOIN GamesPlayed G ON T.team = G.team
      ORDER BY L.points DESC;
      `;
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(results);
    }
  });
});

app.put('/players/team_detail/update-team-money', async (req, res) => {

  const { id, sum, payment } = req.body;
  var query;

  if (payment) {
    query = 'UPDATE teams SET money = ? WHERE team_id = ?;';
  } else {
    query = 'UPDATE teams SET money = money + ? WHERE team_id = ?;';
  }
  connection.query(query, [sum, id], (error, results) => {
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