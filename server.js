const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình CORS cho phép tất cả các nguồn gốc
app.use(cors());

app.use(bodyParser.json());

// Cấu hình kết nối tới MySQL
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

// Endpoint to handle user registration
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    await connection.beginTransaction();

    // Insert into account table
    const [accountResult] = await connection.execute(
      'INSERT INTO `account`(`username`, `password`, `email`) VALUES (?, ?, ?)', 
      [username, password, email]
    );

    if (accountResult.affectedRows === 0) {
      throw new Error('Failed to insert into account table');
    }

    // Insert into user table
    const [userResult] = await connection.execute(
      'INSERT INTO `user`(`idUser`, `level`, `experience`) VALUES (?, 0, 0)', 
      [accountResult.insertId]
    );

    if (userResult.affectedRows === 0) {
      throw new Error('Failed to insert into user table');
    }

    await connection.commit();
    res.status(200).json({ message: 'Registration successful', statusCode: 200 });

  } catch (error) {
    console.error('Error during registration:', error);
    await connection.rollback();
    res.status(500).json({ message: 'Internal Server Error', statusCode: 500 });
  }
});


app.post('/getInformationUser', async (req, res) => {
  const { idUser } = req.body;
  
  try {
    const [rows] = await connection.execute(
      'SELECT account.fullName, `level`, `experience` FROM `user` JOIN account ON user.idUser = account.idUser WHERE account.idUser = ?', 
      [idUser]
    );

    if (rows.length > 0) {
      res.status(200).json({ message: 'User found', data: rows, statusCode: 200 });
    } else {
      res.status(404).json({ message: 'User not found', statusCode: 404 });
    }
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ message: 'Internal Server Error', statusCode: 500 });
  }
});

app.post('/updateExperience', async (req, res) => {
  const { idUser } = req.body;

  try {
    const [rows] = await connection.execute(
      'SELECT `level`, `experience` FROM `user` WHERE idUser = ?', 
      [idUser]
    );

    if (rows.length > 0) {
      let { level, experience } = rows[0];
      experience += 5;

      if (experience >= 2000) {
        level = 'Master';
      } else if (experience >= 1000) {
        level = 'Xuất sắc';
      } else if (experience >= 500) {
        level = 'Giỏi';
      } else if (experience >= 100) {
        level = 'Khá';
      }

      const [updateResult] = await connection.execute(
        'UPDATE `user` SET `level` = ?, `experience` = ? WHERE `idUser` = ?', 
        [level, experience, idUser]
      );

      if (updateResult.affectedRows > 0) {
        res.status(200).json({ message: 'User experience and level updated successfully', statusCode: 200 });
      } else {
        res.status(500).json({ message: 'Failed to update user experience and level', statusCode: 500 });
      }
    } else {
      res.status(404).json({ message: 'User not found', statusCode: 404 });
    }
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ message: 'Internal Server Error', statusCode: 500 });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});