const express = require('express')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const path = require('path')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')().listen(server)
const api = require('./api')

app.set('port', process.env.PORT || 5000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.json())
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 1000 * 60 * 60 * 24
}))
app.use(express.static('public'))

api.router(app)
api.socket(io)

server.listen(app.get('port'), () => {
    console.log(`App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`)
})