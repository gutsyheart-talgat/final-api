const express = require('express')
const app = express()
const port = 5555
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const defaultData = require('./defaultData')
const shortid = require('shortid')
const cors = require('cors')

const adapter = new FileSync('db.json')
const db = low(adapter)

app.use(cors())

db.defaults(defaultData).write()

const colors = [null, '#efa8e4', '#97e5ef', '#f6d198', '#77d8d8', '#f2ed6f']

const error = (res, status, text) => res.status(status).json(text).end()

app.use(express.json()) 

app.get('/list', (req, res) => {
  const list = db.get('list')
  res.send(list)
})

app.get('/list/:id', (req, res) => {
  const id = req.params.id
  const item = db.get('list').find({ id })
  if (!item) res.status(400).send('Bad Request')
  res.send(item)
})

app.post('/add', (req, res) => {
  const id = shortid.generate()
  const addedItem = { id, done: false, ...req.body }

  db.get('list').push(addedItem).write()
  res.send(addedItem)
})

app.get('/data', (req, res) => {
  const token = req.get('X-Auth')
  const isAuth = db.get('users').find({ token }).value()
  if (!isAuth) return error(res, 403, 'Access is denied')
  res.send(isAuth)
})


app.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = db.get('users').find({ data: { username, password } }).value()
  if (!user) return error(res, 403, 'incorrect login data')
  res.send({ user })
})

app.post('/signin', (req, res) => {
  const { firstname, lastname, username, password } = req.body
  
  const existed = db.get('users').find({ data: { username } }).value()
 
  const data = { firstname, lastname, username, password }

  db.get('users').push({ data, token: `token_${shortid.generate()}` }).write()
  const user = db.get('users').find({ data: { username, password } }).value()
  res.send({ user })
})



app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))