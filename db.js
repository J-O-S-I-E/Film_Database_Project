require('dotenv').config()
const mysql = require('mysql2')

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

const createMediaTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      director VARCHAR(255),
      genre VARCHAR(100),
      length INT,
      type VARCHAR(50)
    )
  `
  connection.query(query, logResult('Media'))
}

const createAccountMediaTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Account_Media (
      account_id INT NOT NULL,
      media_id INT NOT NULL,
      PRIMARY KEY (account_id, media_id),
      FOREIGN KEY (account_id) REFERENCES UserAccount(id) ON DELETE CASCADE,
      FOREIGN KEY (media_id) REFERENCES Media(id) ON DELETE CASCADE
    )
  `
  connection.query(query, logResult('Account_Media'))
}

const createReviewTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Review (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      media_id INT NOT NULL,
      stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
      account_id INT NOT NULL,
      FOREIGN KEY (media_id) REFERENCES Media(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES UserAccount(id) ON DELETE CASCADE
    )
  `
  connection.query(query, logResult('Review'))
}

const logResult = (table) => (err) => {
  if (err) console.error(`Error creating ${table} table:`, err.message)
  else console.log(`Table \`${table}\` is ready`)
}

connection.connect(err => {
  if (err) {
    console.error('Error connecting to DB:', err.stack)
    return
  }
  createMediaTable()
  createAccountMediaTable()
  createReviewTable()
  console.log("MySQL initalized")
})

module.exports = connection