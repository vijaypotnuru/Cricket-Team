const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

// Connecting to Database
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// Get Players Details API
app.get("/players/", async (request, response) => {
  const getPlayerDetailsQuery = `
        SELECT 
        *
        FROM 
        cricket_team;`;

  const playerArray = await db.all(getPlayerDetailsQuery);

  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// Create New Player API
app.post("/players/", async (request, response) => {
  const newPlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = newPlayerDetails;
  const addNewPlayerQuery = `
        INSERT INTO
        cricket_team (player_name, jersey_number, role)
        VALUES(
                '${playerName}',
                 ${jerseyNumber},
                '${role}'            
            );`;

  const dbResponse = await db.run(addNewPlayerQuery);
  response.send("Player Added to Team");
});

// Get Player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT
            *
        FROM
            cricket_team
        WHERE 
            player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  const modifiedPlayer = convertDbObjectToResponseObject(player);
  response.send(modifiedPlayer);
});

// Update Player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
            UPDATE
                cricket_team
            SET
                player_name = '${playerName}',
                jersey_number = ${jerseyNumber},
                role = '${role}'
            WHERE 
                player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// Delete Player API
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
            DELETE FROM 
                cricket_team
            WHERE 
                player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;

