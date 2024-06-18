const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000; // Sử dụng biến môi trường PORT nếu có

app.use(cors()); // Cho phép CORS cho tất cả các route

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
    console.log('Đã kết nối vào cơ sở dữ liệu MySQL.');
  } catch (err) {
    console.error('Lỗi khi kết nối đến cơ sở dữ liệu:', err);
  }
}

connectDB();

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await connection.execute('SELECT `username`, `password`, `email`, `fullName`, `idUser` FROM `account` WHERE account.username = ? and account.password= ?', [username, password]);

    if (rows.length > 0) {
      res.status(200).json({ message: 'Đăng nhập thành công', user: rows[0], statusCode: 200 });
    } else {
      res.status(401).json({ message: 'Thông tin đăng nhập không hợp lệ', statusCode: 401 });
    }
  } catch (error) {
    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const [rows] = await connection.execute('INSERT INTO `account`(`username`, `password`, `email`) VALUES (?,?,?)', [username, password, email]);

    if (rows.affectedRows > 0) {
      res.status(200).json({ message: 'Đăng ký thành công', statusCode: 200 });
    } else {
      res.status(500).json({ message: 'Đăng ký thất bại', statusCode: 500 });
    }
  } catch (error) {
    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
});

app.listen(port, () => {
  console.log(`Máy chủ đang chạy tại http://localhost:${port}`);
});
