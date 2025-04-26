const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
// Ajouter cette ligne pour servir les images des albums
app.use('/images', express.static(path.join(__dirname, 'albumCovers')));

// Routes
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');

app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});