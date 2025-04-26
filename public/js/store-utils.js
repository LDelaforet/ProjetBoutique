/**
 * Utilitaires pour gérer le panier et les favoris
 */
const StoreUtils = {
    /**
     * Ajouter un produit au panier
     * @param {Object} product - Les données du produit à ajouter
     */
    addToCart: function(product) {
        let cart = this.getCart();
        
        // Vérifier si le produit est déjà dans le panier
        const existingProductIndex = cart.findIndex(item => 
            item.id == product.id && 
            (product.color ? item.color === product.color : true)
        );
        
        if (existingProductIndex !== -1) {
            // Mettre à jour la quantité si le produit existe déjà
            cart[existingProductIndex].quantity += product.quantity || 1;
        } else {
            // Ajouter le nouveau produit
            cart.push({
                ...product,
                quantity: product.quantity || 1
            });
        }
        
        // Enregistrer le panier mis à jour
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Mettre à jour le compteur du panier
        this.updateCartCount();
    },
    
    /**
     * Récupérer le contenu du panier
     * @returns {Array} - Les produits dans le panier
     */
    getCart: function() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },
    
    /**
     * Mettre à jour le compteur du panier dans l'interface
     */
    updateCartCount: function() {
        const cart = this.getCart();
        const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }
    },
    
    /**
     * Ajouter un produit aux favoris
     * @param {Object} product - Les données du produit à ajouter
     */
    addToWishlist: function(product) {
        let wishlist = this.getWishlist();
        
        // Vérifier si le produit est déjà dans les favoris
        if (!wishlist.some(item => item.id == product.id)) {
            wishlist.push(product);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
        
        // Mettre à jour le compteur des favoris
        this.updateWishlistCount();
    },
    
    /**
     * Supprimer un produit des favoris
     * @param {number} productId - L'ID du produit à supprimer
     */
    removeFromWishlist: function(productId) {
        let wishlist = this.getWishlist();
        wishlist = wishlist.filter(item => item.id != productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        // Mettre à jour le compteur des favoris
        this.updateWishlistCount();
    },
    
    /**
     * Vérifier si un produit est dans les favoris
     * @param {number} productId - L'ID du produit à vérifier
     * @returns {boolean} - true si le produit est dans les favoris, false sinon
     */
    isInWishlist: function(productId) {
        const wishlist = this.getWishlist();
        return wishlist.some(item => item.id == productId);
    },
    
    /**
     * Récupérer le contenu des favoris
     * @returns {Array} - Les produits dans les favoris
     */
    getWishlist: function() {
        const wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    },
    
    /**
     * Mettre à jour le compteur des favoris dans l'interface
     */
    updateWishlistCount: function() {
        const wishlist = this.getWishlist();
        const wishlistCount = wishlist.length;
        
        const wishlistCountElement = document.getElementById('wishlist-count');
        if (wishlistCountElement) {
            wishlistCountElement.textContent = wishlistCount;
        }
    },
    
    /**
     * Afficher un message toast
     * @param {string} message - Le message à afficher
     * @param {number} duration - La durée d'affichage en millisecondes (par défaut: 3000)
     */
    showToast: function(message, duration = 3000) {
        // Vérifier si un toast existe déjà
        let toast = document.querySelector('.toast-message');
        
        // Créer un nouveau toast si nécessaire
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-message';
            document.body.appendChild(toast);
        }
        
        // Mettre à jour le message et afficher le toast
        toast.textContent = message;
        toast.classList.add('show');
        
        // Masquer le toast après la durée spécifiée
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },
    
    /**
     * Initialiser les compteurs au chargement de la page
     */
    init: function() {
        this.updateCartCount();
        this.updateWishlistCount();
    }
};

// Initialiser les compteurs au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    StoreUtils.init();
});