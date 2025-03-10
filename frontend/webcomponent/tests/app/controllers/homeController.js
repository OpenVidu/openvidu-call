export const renderHomePage = async (req, res) => {
  try {
    // Get all OpenVidu Meet Rooms
    const response = await fetch(`${process.env.OPENVIDU_MEET_URL}/rooms`)
    const rooms = await response.json()

    if (!response.ok) {
      throw new Error('Failed to fetch rooms')
    }

    res.render('home', { rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    res.render('home', { rooms: [], error: 'Failed to load rooms' })
  }
}

export const createRoom = async (req, res) => {
  try {
    // Extract values from request body
    const { roomNamePrefix, expirationDate } = req.body

    // Request to create a new room
    const response = await fetch(`${process.env.OPENVIDU_MEET_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomNamePrefix,
        expirationDate: new Date(expirationDate).getTime()
      })
    })

    // Handle response
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Room creation failed')

    renderHomePage(req, res)
  } catch (error) {
    console.error('Room creation error:', error)
    res.status(500).json({ message: 'Error creating a room', error: error.message })
  }
}
