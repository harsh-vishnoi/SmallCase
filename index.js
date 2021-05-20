const express = require("express");
const mongoDB = require("./MongoDB/mongoDB");
const routes = require("./Router");
const app = express();

app.use(express.json());
// app.get('/', (req, res) => {
//   res.send("Home Page is Working Fine");
// })

// Everything is available at this link
// https://documenter.getpostman.com/view/6513569/TzRa8QCN

app.use('/', routes);

mongoDB.connect();

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Listening on PORT : ${port}`);
})
