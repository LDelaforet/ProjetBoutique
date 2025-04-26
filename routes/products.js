const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const productsPath = path.join(__dirname, '../data/products.json');

// Cache les produits pour éviter de lire le fichier à chaque requête
let productsCache = null;
let lastModified = null;

function loadProducts() {
    try {
        const stats = fs.statSync(productsPath);
        if (!productsCache || stats.mtime > lastModified) {
            const productsData = fs.readFileSync(productsPath, 'utf8');
            productsCache = JSON.parse(productsData);
            lastModified = stats.mtime;
        }
        return productsCache;
    } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        return [];
    }
}

router.get('/', (req, res) => {
    const products = loadProducts();
    res.json(products);
});

router.get('/:id', (req, res) => {
    const products = loadProducts();
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Produit non trouvé' });
    }
});

module.exports = router;