/*
 * Max Ovitsky, Kaushik Chaudhary, Francis Phan
 * CS465P -- Weather App
 *
 * This file creates a local server hosted on port 3000
 */

require("dotenv").config();
const express = require("express");
const parser = require("body-parser");
const app = express();
const api = require("./js/api");
const port = 3000;
app.listen(port, console.log(`Server running at http://localhost:${port}`));

app.use(express.static("public"));

app.use(
  parser.urlencoded({
    extended: false,
    limit: 1024,
  })
);

app.post("/weather", function (req, res) {
  api
    .getCoords(`${req.body.location}`)
    .then((data) => {
      console.log(data);
      res.end();
    })
    .catch((error) => console.log(error));
});
