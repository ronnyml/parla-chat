const rooms = [
  { room: 'Announcements', inuse: false },
  { room: 'General', inuse: false },
  { room: 'Marketing', inuse: false },
  { room: 'Movies', inuse: false },
  { room: 'Products', inuse: false },
  { room: 'Programming', inuse: false },
  { room: 'Reading', inuse: false },
  { room: 'Remote', inuse: false }
]

const getRooms = (room) => {
  rooms.map((r) => {
    r.inuse = r.room.toLocaleLowerCase() === room
  })
  return rooms
}

module.exports = {
  getRooms
}
