const express = require('express')
const mongooes = require('mongoose')

const users = require('./routes/Api/user')
const posts = require('./routes/Api/posts')
const profile = require('./routes/Api/profile')

const app = express()

//db config
const db = require('./config/keys').mongoUri;

//connect to mongo
mongooes
  .connect(db)
  .then(() => console.log('Connection Successful'))
  .catch(err => console.log(err))

app.get('/', (req, res) => res.send('HEllo Every one'))

//use Routes

app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})