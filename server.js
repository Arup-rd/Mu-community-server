const express = require('express')
const mongooes = require('mongoose')
const bodyPerser = require('body-parser')
const passport = require('passport')

//Routes
const users = require('./routes/Api/user')
const posts = require('./routes/Api/posts')
const profile = require('./routes/Api/profile')

const app = express()

//Body perser middleware
app.use(bodyPerser.urlencoded({
  extended: false
}))
app.use(bodyPerser.json())

//db config
const db = require('./config/keys').mongoUri;

//connect to mongo
mongooes
  .connect(db)
  .then(() => console.log('Connection Successful'))
  .catch(err => console.log(err))

//passport middleware
app.use(passport.initialize());

//passport config
require('./config/passport')(passport);


//use Routes

app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})