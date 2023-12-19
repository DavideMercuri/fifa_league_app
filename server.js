const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const authMiddleware = require('./authMiddleware');
const cors = require('cors');
const bodyParser = require('body-parser');
const util = require('util');
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer();

const SECRET_KEY = '7l5Ywkc6gV';


const app = express();

// Set up a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'players_test'
});
connection.connect();

// Promisificazione delle funzioni di mysql
const query = util.promisify(connection.query).bind(connection);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Un endpoint protetto come esempio
app.get('/players/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Benvenuto nella zona protetta!' });
});

// API endpoint to retrieve  all fixtures data from the database
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
                      f2.matchday >= f1.matchday AND
                      f2.played = 'no'
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

    const yellowCardPlayers = yellow_card.split(','); // Array degli ID dei giocatori che hanno ricevuto un cartellino giallo

    for (let playerId of yellowCardPlayers) {
      await updatePlayer('yellow_card', playerId, 1); // Aggiorna i cartellini gialli

      // Controlla il numero totale di cartellini gialli per il giocatore
      const totalYellowCardsQuery = `SELECT yellow_card FROM players_list WHERE id = ?`;
      const totalYellowCardsResult = await queryAsync(totalYellowCardsQuery, [playerId]);

      if (totalYellowCardsResult.length > 0) {
        const totalYellowCards = totalYellowCardsResult[0].yellow_card;

        // Se il giocatore raggiunge un multiplo di 3, procedi con la "notation_warned"
        if (totalYellowCards % 3 === 0 && totalYellowCards !== 0) {
          const teamOfPlayerQuery = `SELECT team FROM players_list WHERE id = ?`;
          const playerTeamResult = await queryAsync(teamOfPlayerQuery, [playerId]);

          if (playerTeamResult.length) {
            const playerTeam = playerTeamResult[0].team;

            // Trova la prossima partita non giocata della squadra del giocatore
            const nextMatchQuery = `
              SELECT id_game 
              FROM fixtures 
              WHERE (home_team = ? OR away_team = ?) AND 
                    played = 'no' 
              ORDER BY matchday ASC 
              LIMIT 1`;
            const nextMatchResult = await queryAsync(nextMatchQuery, [playerTeam, playerTeam]);

            // Aggiungi la "notation_warned" per la partita trovata
            if (nextMatchResult.length) {
              const nextMatchId = nextMatchResult[0].id_game;
              const updateMatchForWarning = `
                UPDATE fixtures 
                SET notation_warned = CONCAT(IFNULL(notation_warned,''), ?, ',') 
                WHERE id_game = ?`;
              await queryAsync(updateMatchForWarning, [playerId, nextMatchId]);
            }
          }
        }
      }
    }

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
      return res.status(500).send(error);
    }

    const players = results.map(player => {
      if (player.photo) {
        player.photo = 'data:image/webp;base64,' + Buffer.from(player.photo).toString('base64');
      }
      return player;
    });

    res.status(200).send(players);
  });
});

app.get('/players/player/:id', (req, res) => {

  const playerId = parseInt(req.params.id, 10);
  const query = 'SELECT * FROM players_list WHERE id = ?';

  connection.query(query, [playerId], (error, results) => {

    if (error) {
      return res.status(500).send('Internal Server Error');
    }
    if (results.length === 0) {
      return res.status(404).send('Player not found');
    }

    const player = results[0];
    if (player.photo) {
      player.photo = 'data:image/webp;base64,' + Buffer.from(player.photo).toString('base64');
    }

    res.status(200).send(player);
  });
});

app.delete('/players/player-delete/:id', (req, res) => {

  const playerId = parseInt(req.params.id, 10);
  const query = 'DELETE FROM players_list WHERE id = ?';

  connection.query(query, [playerId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error Deleting player: ' + error.message })
    }
    res.status(200).json({ message: 'Player Deleted successfully' }); // Risposta JSON in caso di errore
  });
});

app.post('/players/insert-new-player', upload.single('photo'), (req, res) => {

  if (!req.file) {
    return res.status(400).send('No image file uploaded.');
  }

  savePlayerData(req.body, req.file)
    .then(() => res.status(200).json({ message: 'Player Added successfully' })) // Risposta JSON
    .catch(error => res.status(500).json({ message: 'Error Adding player: ' + error.message })); // Risposta JSON in caso di errore
});

function savePlayerData(playerData, imageFile) {
  return new Promise((resolve, reject) => {
    // Estrai il buffer dell'immagine
    const imageBuffer = imageFile.buffer;

    // Query SQL per inserire i dati
    const sql = `INSERT INTO players_list (name, position, country, team, goals, assist, motm, photo, yellow_card, red_card, injured, salary, overall, player_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [playerData.name, playerData.position, playerData.country, playerData.team, playerData.goals, playerData.assist, playerData.motm, imageBuffer, playerData.yellow_card, playerData.red_card, playerData.injured, playerData.salary, playerData.overall, playerData.player_value];

    connection.query(sql, values, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

app.put('/players/edit-player/:id', upload.single('photo'), (req, res) => {
  const playerId = req.params.id;
  const playerData = req.body;
  const imageFile = req.file;

  updatePlayerData(playerId, playerData, imageFile)
    .then(() => res.status(200).json({ message: 'Player updated successfully' })) // Risposta JSON
    .catch(error => res.status(500).json({ message: 'Error updating player: ' + error.message })); // Risposta JSON in caso di errore
});

// Funzione per eseguire la query di aggiornamento nel database
function updatePlayerData(playerId, playerData, imageFile) {
  return new Promise((resolve, reject) => {
    let imageBuffer = null;
    if (imageFile) {
      imageBuffer = imageFile.buffer;
    }

    let sql = `UPDATE players_list SET name = ?, position = ?, country = ?, team = ?, goals = ?, assist = ?, motm = ?, yellow_card = ?, red_card = ?, injured = ?, salary = ?, overall = ?, player_value = ?`;
    let values = [playerData.name, playerData.position, playerData.country, playerData.team, playerData.goals, playerData.assist, playerData.motm, playerData.yellow_card, playerData.red_card, playerData.injured, playerData.salary, playerData.overall, playerData.player_value];

    if (imageBuffer) {
      sql += `, photo = ?`;
      values.push(imageBuffer);
    }

    sql += ` WHERE id = ?`;
    values.push(playerId);

    connection.query(sql, values, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

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

app.put('/players/team-detail/update-value-salary', async (req, res) => {

  const query = `UPDATE teams t JOIN 
  (SELECT team, SUM(salary) AS total_salary, SUM(player_value) AS total_player_value, COUNT(*) AS total_players_number
  FROM players_list GROUP BY team) p ON t.team_name = p.team 
  SET t.salary = p.total_salary, t.club_value = total_player_value, t.players_number = total_players_number`;

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(results);
    }
  });
})

// API endpoint to retrieve fixtures data from the database
app.get('/players/team-detail', (req, res) => {

  var id;
  var team_name;
  var query

  if (!req.query.id) {
    team_name = req.query.team_name;
    query = `SELECT * FROM teams WHERE team_name = '${team_name}'`;
  } else {
    id = req.query.id;
    query = `SELECT * FROM teams WHERE team_id = ${id}`;
  }

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
      return res.status(500).send(error);
    }

    const players = results.map(player => {
      if (player.photo) {
        player.photo = 'data:image/webp;base64,' + Buffer.from(player.photo).toString('base64');
      }
      return player;
    });

    res.status(200).send(players);
  });
});

// API endpoint to retrieve top scorer info from the database
app.get('/players/players_list/top_players', (req, res) => {
  const category = req.query.category;
  const query = `SELECT * FROM players_list WHERE ${category} = (SELECT MAX(${category}) FROM players_list);`;
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).send(error);
    }

    const players = results.map(player => {
      if (player.photo) {
        player.photo = 'data:image/webp;base64,' + Buffer.from(player.photo).toString('base64');
      }
      return player;
    });

    res.status(200).send(players);
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

app.get('/players/getGoalDifference', (req, res) => {
  const query = `SELECT 
  teams.team,
  COALESCE(goals_for.total_goals_for, 0) - COALESCE(goals_against.total_goals_against, 0) AS goal_difference
FROM (
  SELECT home_team AS team FROM fixtures
  UNION
  SELECT away_team AS team FROM fixtures
) AS teams
LEFT JOIN (
  SELECT 
    team,
    SUM(home_goals_for) AS total_goals_for
  FROM (
    SELECT 
      home_team AS team,
      SUM(ht_goals) AS home_goals_for
    FROM fixtures
    WHERE played = 'yes'
    GROUP BY home_team
    UNION ALL
    SELECT 
      away_team AS team,
      SUM(aw_goals) AS home_goals_for
    FROM fixtures
    WHERE played = 'yes'
    GROUP BY away_team
  ) AS SubqueryGoalsFor
  GROUP BY team
) AS goals_for ON teams.team = goals_for.team
LEFT JOIN (
  SELECT 
    team,
    SUM(away_goals_against) AS total_goals_against
  FROM (
    SELECT 
      home_team AS team,
      SUM(aw_goals) AS away_goals_against
    FROM fixtures
    WHERE played = 'yes'
    GROUP BY home_team
    UNION ALL
    SELECT 
      away_team AS team,
      SUM(ht_goals) AS away_goals_against
    FROM fixtures
    WHERE played = 'yes'
    GROUP BY away_team
  ) AS SubqueryGoalsAgainst
  GROUP BY team
) AS goals_against ON teams.team = goals_against.team;
`;

  connection.query(query, (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// API endpoint to retrieve fixtures data from the database
app.get('/players/league_table', (req, res) => {

  const query = `WITH Teams AS (
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
  ),
  
  GoalsScored AS (
    SELECT team, SUM(goals) AS goals_scored
    FROM (
        SELECT home_team AS team, SUM(ht_goals) AS goals
        FROM fixtures
        WHERE played = 'yes'
        GROUP BY home_team
        UNION ALL
        SELECT away_team AS team, SUM(aw_goals) AS goals
        FROM fixtures
        WHERE played = 'yes'
        GROUP BY away_team
    ) AS Subquery
    GROUP BY team
  ),
  
  GoalsConceded AS (
    SELECT team, SUM(goals) AS goals_conceded
    FROM (
        SELECT home_team AS team, SUM(aw_goals) AS goals
        FROM fixtures
        WHERE played = 'yes'
        GROUP BY home_team
        UNION ALL
        SELECT away_team AS team, SUM(ht_goals) AS goals
        FROM fixtures
        WHERE played = 'yes'
        GROUP BY away_team
    ) AS Subquery
    GROUP BY team
  )
  
  SELECT ROW_NUMBER() OVER (ORDER BY L.points DESC, (COALESCE(G.goals_scored, 0) - COALESCE(GC.goals_conceded, 0)) DESC) AS position,
        T.team,
        L.id,
        L.team_logo,
        L.points,
        COALESCE(V.wins, 0) AS wins,
        COALESCE(Ls.losses, 0) AS losses,
        COALESCE(D.draws, 0) AS draws,
        COALESCE(G.goals_scored, 0) AS goals_scored,
        COALESCE(GC.goals_conceded, 0) AS goals_conceded,
        COALESCE(G.goals_scored, 0) - COALESCE(GC.goals_conceded, 0) AS goal_difference,
        COALESCE(GP.games_played, 0) AS games_played
  FROM Teams T
  JOIN league_table L ON T.team = L.team
  LEFT JOIN Victories V ON T.team = V.team
  LEFT JOIN Losses Ls ON T.team = Ls.team
  LEFT JOIN Draws D ON T.team = D.team
  LEFT JOIN GoalsScored G ON T.team = G.team
  LEFT JOIN GoalsConceded GC ON T.team = GC.team
  LEFT JOIN GamesPlayed GP ON T.team = GP.team
  ORDER BY L.points DESC, (COALESCE(G.goals_scored, 0) - COALESCE(GC.goals_conceded, 0)) DESC;
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

app.put('/players/team_detail/update-team-trophy', async (req, res) => {

  const { id, trophyType } = req.body;

  var query = `UPDATE teams SET ${trophyType} = ${trophyType} + 1 WHERE team_id = ?;`;

  connection.query(query, [id], (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(results);
    }
  });
})

app.post('/transfer', async (req, res) => {
  const { sellingTeam, buyingTeam, transferAmount, mainPlayer, additionalPlayers, additionalBuyerPlayers } = req.body;

  try {
    // Avvia una transazione
    await query('START TRANSACTION');

    // Aggiorna la squadra che vende
    if (sellingTeam !== 'Svincolati') {
      await query('UPDATE teams SET money = money + ? WHERE team_name = ?', [transferAmount, sellingTeam]);
    }

    // Aggiorna la squadra che compra
    if (buyingTeam !== 'Svincolati') {
      await query('UPDATE teams SET money = money - ? WHERE team_name = ?', [transferAmount, buyingTeam]);
    }

    // Cambia la squadra del calciatore principale
    await query('UPDATE players_list SET team = ? WHERE id = ?', [buyingTeam, mainPlayer.id]);

    // Cambia la squadra degli altri calciatori coinvolti nel trasferimento
    if (additionalPlayers && additionalPlayers.length > 0) {
      for (const player of additionalPlayers) {
        await query('UPDATE players_list SET team = ? WHERE id = ?', [buyingTeam, player.id]);
      }
    }

    // Cambia la squadra dei calciatori comprati (se presenti)
    if (additionalBuyerPlayers && additionalBuyerPlayers.length > 0) {
      for (const player of additionalBuyerPlayers) {
        await query('UPDATE players_list SET team = ? WHERE id = ?', [sellingTeam, player.id]);
      }
    }

    // Commit della transazione
    await query('COMMIT');

    res.send({ status: 'success', message: 'Transfer completed successfully.' });
  } catch (error) {
    // Rollback nel caso di errori
    await query('ROLLBACK');
    res.status(500).send({ status: 'error', message: 'An error occurred during the transfer.', error });
  }
});

app.put('/reset-league', async (req, res) => {

  try {
    // Avvia una transazione
    await query(`START TRANSACTION`);

    // Prima query di aggiornamento
    await query(`UPDATE fixtures SET ht_goals = 0, aw_goals = 0, scorers = NULL, assists = NULL, yellow_card = NULL, red_card = NULL, injured = NULL, notation_injured = NULL, notation_expelled = NULL, notation_warned = NULL, motm = '', played = 'no'`);

    // Seconda query di aggiornamento
    await query(`UPDATE league_table SET points = 0`);

    await query(`UPDATE players_list SET goals = 0, assist = 0, motm = 0, yellow_card = 0, red_card = 0, injured = 0`);

    // Commit della transazione
    await query(`COMMIT`);

    res.send({ status: 'success', message: 'Data reset completed.' });
  } catch (error) {
    // Rollback nel caso di errori
    await query(`ROLLBACK`);
    res.status(500).send({ status: 'error', message: 'An error occurred during the update.', error });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

module.exports = connection;