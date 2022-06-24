const express = require('express')
const app = express()
const port = 3001
const routes = require('./routes/index')
const bodyParser = require('body-parser');
const session = require('express-session');

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

app.use(session({
    secret: 'hacktiv8',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        sameSite: true 
    }
}))


app.use('/',routes)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})