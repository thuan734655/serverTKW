const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: 'http://localhost:1234', // Cho phép yêu cầu từ origin này
    methods: ['GET', 'POST'], // Các phương thức HTTP được phép
    allowedHeaders: ['Content-Type'], // Các tiêu đề cho phép
  };
  
  app.use(cors(corsOptions));

app.use(bodyParser.json());

const dbConfig = {
  host: 'byu0q98odkr959kiebb7-mysql.services.clever-cloud.com',
  user: 'usymr3cribbuebyu',
  password: 'ngBDpu0WyDZLCJDeBNAw',
  database: 'byu0q98odkr959kiebb7'
};

let connection;

async function connectDB() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the MySQL database.');
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

connectDB();

// Endpoint xử lý đăng nhập
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await connection.execute('SELECT `username`, `password`, `email`, `fullName`, `idUser` FROM `account` WHERE account.username = ? AND account.password = ?', [username, password]);

    if (rows.length > 0) {
      res.status(200).json({ message: 'Login successful', user: rows[0], statusCode: 200 });
    } else {
      res.status(401).json({ message: 'Invalid credentials', statusCode: 401 });
    }
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint xử lý đăng ký
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const [rows] = await connection.execute('INSERT INTO `account`(`username`, `password`, `email`) VALUES (?, ?, ?)', [username, password, email]);

    if (rows.affectedRows > 0) {
      res.status(200).json({ message: 'Registration successful', statusCode: 200 });
    } else {
      res.status(500).json({ message: 'Registration failed', statusCode: 500 });
    }
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Khởi động server và lắng nghe trên cổng được cấu hình
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
