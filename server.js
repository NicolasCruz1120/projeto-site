require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json());


require('./src/config/database');


app.use('/api/users', require('./src/routes/userRoutes'));


app.get('/', (req, res) => {
  res.send('Servidor Node.js está rodando!');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});