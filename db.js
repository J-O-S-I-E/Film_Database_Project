require('dotenv').config()
const mysql = require('mysql2')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: 'eOtkXxa1yHTH0YHB7dSf',
  database: 'media',
})

connection.connect(err => {
  if (err) throw err
  console.log('MySQL connected')
})

module.exports = connection