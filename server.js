/*
 * Max Ovitsky, Kaushik Chaudhary, Francis Phan
 * CS465P -- Weather App
 *
 * This file creates a local server hosted on port 3000
 */

require("dotenv").config();
const express = require("express");
const app = express();
const api = require("./js/api");
const port = 3000;
app.listen(port, console.log(`Listening at port ${port}`));

app.use(express.static("public"));

app.get("/weather", function (req, res) {
  api
    .getCoords("97206", 1)
    .then((data) => res.send(data))
    .catch((error) => console.log(error));
});

app.get("/aqi", function (req, res) {
  api
    .getCoords("97206", 2)
    .then((data) => res.send(data))
    .catch((error) => console.log(error));
});
