const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Success"));
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initialize();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const a = `SELECT movie_name FROM movie;`;
  const b = await db.all(a);
  response.send(b.map((i) => convertDbObjectToResponseObject(i)));
});

//API 2

app.post("/movies/", async (request, response) => {
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const api2 = `INSERT INTO 
                   movie (director_id,movie_name,lead_actor)
                   VALUES
                   (
                       '${directorId}',
                       '${movieName}',
                       '${leadActor}'
                   );`;
  const db3 = await db.run(api2);
  response.send("Movie Successfully Added");
});

//API 3

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const api3 = `
  SELECT
  *
  FROM
  movie
  WHERE
  movie_id = ${movieId};`;
  const db2 = await db.get(api3);
  console.log(movieId);
  response.send(convertMovieDbObjectToResponseObject(db2));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const api4 = `UPDATE 
                    movie
                   SET 
                      director_id = '${directorId}',
                      movie_name = '${movieName}',
                      lead_actor = '${leadActor}'
                   WHERE
                      movie_id = ${movieId};`;
  await db.run(api4);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const api5 = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(api5);
  response.send("Movie Removed");
});

//API 6

const directorDetailsObjToResponseObj = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const allDirectorsQuery = `
    SELECT
    *
    FROM
    director;`;
  const directorArray = await db.all(allDirectorsQuery);
  response.send(directorArray.map((i) => directorDetailsObjToResponseObj(i)));
});

//API 7

const movieNameObjToResponseObj = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const allMovieNamesQuery = `
    SELECT
    movie_name
    FROM
    director INNER JOIN movie
    ON director.director_id = movie.director_id
    WHERE
    director.director_id = ${directorId};`;
  const movieNamesArray = await db.all(allMovieNamesQuery);
  console.log(directorId);
  response.send(movieNamesArray.map((i) => movieNameObjToResponseObj(i)));
});

module.exports = app;
