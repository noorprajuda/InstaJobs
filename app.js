const express = require('express')
const app = express()
const port = 3000
const routes = require('./routes/index')
const bodyParser = require('body-parser');

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))


app.use('/',routes)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})