'use strict';

const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express() // expressを実行
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors()) // corsを有効にする

const usersRouter = require(`./lib/routers/usersRoute`)
const cardsRouter = require(`./lib/routers/cardsRoute`)

app.use(`/users`, usersRouter)
app.use(`/cards`, cardsRouter)

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`)
})
