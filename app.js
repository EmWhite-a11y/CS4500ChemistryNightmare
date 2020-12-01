const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')

const options = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem'), 'utf-8'),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'), 'utf-8')
}

const app = express()
const server = require('httpolyglot').createServer(options, app)
const io = require('socket.io')(server)
const api = require('./api')

app.set('port', process.env.PORT || 5000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.json())
app.use(cookieSession({
    name: 'session',
    keys: ['supercalifragilisticexpialidocious'],
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
}))
app.use(express.static('public'))
app.use(express.static('node_modules'))

api.routes(app)
api.sockets(io)

server.listen(app.get('port'), () => {
    console.log(`App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`)
})