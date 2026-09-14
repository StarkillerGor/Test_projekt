const express = require('express');
const cors = require('cors');
const db = require('./db');
const CorsOptions = {
  origin: 'http://192.168.0.81:3000',
  methods: ['GET', 'POST'],
};
const app = express();
//app.use(cors(CorsOptions));

app.use(cors());
app.use(express.json());

app.get('/worki', (req, res) => {
  db.query('SELECT * FROM worki', (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE login = ? AND password = ?';

  db.query(sql, [email, password], (err, result) => {
    if (err) {
      res.status(500).json({ success: false });
      return;
    }

    if (result.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});


app.post('/worki', (req, res) => {
  const { numer_sklepu, numer_worka, metal_drs, plastik_drs, czy_jest_w_kaucja } = req.body;
  const sql = `INSERT INTO worki (numer_sklepu, numer_worka, metal_drs, plastik_drs, czy_jest_w_kaucja) 
               VALUES (?, ?, ?, ?, ?)`;
  
  db.query(sql, [numer_sklepu, numer_worka, metal_drs, plastik_drs, czy_jest_w_kaucja], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Wpis dodany", id: result.insertId });
  });
});

app.get('/worki/dates', (req, res) => {
  const { from, to } = req.query;
  const sql = 'SELECT * FROM worki WHERE data_stworzenia BETWEEN ? AND ?';
  
  db.query(sql, [from, to], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get('/worki/store', (req, res) => {
  const { from, to, sklep } = req.query;
  const sql = 'SELECT * FROM worki WHERE (data_stworzenia BETWEEN ? AND ?) AND numer_sklepu LIKE ?';
  
  db.query(sql, [from, to, `%${sklep}%`], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

 
app.put('/worki/edit-main/:id', (req, res) => {
  const { id } = req.params;
  const { numer_worka, metal_drs, plastik_drs, czy_jest_w_kaucja } = req.body;
  const sql = `UPDATE worki SET numer_worka = ?, metal_drs = ?, plastik_drs = ?, czy_jest_w_kaucja = ? 
               WHERE id = ?`;

  db.query(sql, [numer_worka, metal_drs, plastik_drs, czy_jest_w_kaucja, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Dane zaktualizowane" });
  });
});


app.put('/worki/edit-return/:id', (req, res) => {
  const { id } = req.params;
  const { czy_jest_w_kaucja, data_oddania } = req.body;
  const sql = 'UPDATE worki SET czy_jest_w_kaucja = ?, data_oddania = ? WHERE id = ?';

  db.query(sql, [czy_jest_w_kaucja, data_oddania, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Status zaktualizowany" });
  });
});


app.delete('/worki/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM worki WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Wpis usunięty" });
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});