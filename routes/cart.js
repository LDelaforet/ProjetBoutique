const express = require('express');
const router = express.Router();

let cart = []; // En mémoire pour l'exemple (en production, utiliser une base de données)

// Obtenir le panier
router.get('/', (req, res) => {
  res.json(cart);
});

// Ajouter au panier
router.post('/', (req, res) => {
  const { productId, quantity } = req.body;
  
  // Vérifier si le produit existe déjà dans le panier
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  
  res.json(cart);
});

// Mettre à jour le panier
router.put('/:productId', (req, res) => {
  const { quantity } = req.body;
  const item = cart.find(item => item.productId === req.params.productId);
  
  if (item) {
    item.quantity = quantity;
    res.json(cart);
  } else {
    res.status(404).json({ message: 'Produit non trouvé dans le panier' });
  }
});

// Supprimer du panier
router.delete('/:productId', (req, res) => {
  cart = cart.filter(item => item.productId !== req.params.productId);
  res.json(cart);
});

module.exports = router;