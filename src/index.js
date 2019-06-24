const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')
const { getRooms } = require('./utils/rooms')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

const ADMIN_USER = 'Admin'

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
  console.log('New WebSocket connection')
 
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room })
    if (error) {
      return callback(error)
    }

    socket.join(user.room)
    socket.emit('message', generateMessage(ADMIN_USER, 'Welcome!'))
    socket.broadcast.to(user.room).emit('message', generateMessage(ADMIN_USER, `${user.username} has joined!`))
    io.to(user.room).emit('roomData', {
      rooms: getRooms(),
      users: getUsersInRoom(user.room)
    })
    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    const user = getUser(socket.id)
    io.to(user.room).emit('message', generateMessage(user.username, message))
    callback()
  })

  socket.on('sendLocation', (location, callback) => {
    const url = `https://google.com/maps?q=${location.latitude},${location.longitude}`
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, url))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', generateMessage(ADMIN_USER, `${user.username} has left!`))
      io.to(user.room).emit('roomData', {
        rooms: getRooms(),
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
    console.log(`Server is up on Port ${port}`);
})