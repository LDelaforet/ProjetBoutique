document.addEventListener('DOMContentLoaded', function() {
    const wishlistContainer = document.getElementById('wishlist-container');
    
    // Déclarons la fonction loadWishlist dans le scope global pour qu'elle soit accessible depuis ailleurs
    window.loadWishlist = function() {
        StoreUtils.updateWishlistCount(); // Mettre à jour le compteur
        const wishlist = StoreUtils.getWishlist();
        
        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = `
                <div class="empty-wishlist">
                    <i class="far fa-heart"></i>
                    <p>Votre liste de favoris est vide</p>
                    <a href="index.html" class="primary-btn">Parcourir la boutique</a>
                </div>
            `;
            return;
        }
        
        wishlistContainer.innerHTML = '';
        
        wishlist.forEach(item => {
            const wishlistItem = document.createElement('div');
            wishlistItem.className = 'product-card';
            wishlistItem.setAttribute('data-id', item.id);
            wishlistItem.innerHTML = `
                <div class="product-img-container">
                    <img src="${item.image}" alt="${item.title}" class="product-img primary">
                    <button class="wishlist-btn remove-from-wishlist" data-id="${item.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${item.title}</h3>
                    <p class="product-artist">${item.artist}</p>
                    <div class="product-price">
                        <span class="current-price">${item.price}</span>
                    </div>
                    <a href="product.html?id=${item.id}" class="view-product-btn">Voir le produit</a>
                    <button class="primary-btn add-to-cart-from-wishlist" data-id="${item.id}" 
                        data-title="${item.title}" 
                        data-artist="${item.artist}" 
                        data-price="${item.price}" 
                        data-image="${item.image}">
                        Ajouter au panier
                    </button>
                </div>
            `;
            wishlistContainer.appendChild(wishlistItem);
        });
    };
    
    // Gestion des événements sur le conteneur de la liste de souhaits
    wishlistContainer.addEventListener('click', function(e) {
        // Gestion de la suppression d'un favori
        if (e.target.closest('.remove-from-wishlist')) {
            const button = e.target.closest('.remove-from-wishlist');
            const productId = button.getAttribute('data-id');
            
            StoreUtils.removeFromWishlist(productId);
            loadWishlist();
        }
        
        // Gestion de l'ajout au panier depuis la liste de souhaits
        if (e.target.closest('.add-to-cart-from-wishlist')) {
            const button = e.target.closest('.add-to-cart-from-wishlist');
            const productData = {
                id: button.getAttribute('data-id'),
                title: button.getAttribute('data-title'),
                artist: button.getAttribute('data-artist'),
                price: button.getAttribute('data-price'),
                image: button.getAttribute('data-image'),
                quantity: 1,
                color: 'default'
            };
            
            StoreUtils.addToCart(productData);
            StoreUtils.showToast("Produit ajouté au panier");
        }
    });

    // Charger la liste des favoris au chargement de la page
    loadWishlist();
});