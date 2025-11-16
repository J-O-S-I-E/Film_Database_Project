const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const findUserByIdentifier = (identifier) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM UserAccount WHERE username = ? OR email = ?`
    db.query(query, [identifier, identifier], (err, results) => {
      if (err) reject(err)
      resolve(results[0] || null)
    })
  })
}

const requireAuth = (req, res, next) => {
  const token = req.cookies.session
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const userData = jwt.verify(token, JWT_SECRET)
    req.user = userData
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired session' })
  }
}

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier (username/email) and password required' })
  }
  try {
    const user = await findUserByIdentifier(identifier)
    if (!user) {
      return res.status(400).json({ error: 'Invalid identifier or password' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid identifier or password' })
    }
    const payload = { id: user.id, username: user.username }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    })
    res.json({ message: 'Login successful', user: payload })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = requireAuth
module.exports = router