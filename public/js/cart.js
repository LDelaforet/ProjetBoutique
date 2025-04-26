document.addEventListener('DOMContentLoaded', function() {
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Déclarons la fonction loadCart dans le scope global pour qu'elle soit accessible depuis ailleurs
    window.loadCart = function() {
        StoreUtils.updateCartCount(); // Mettre à jour le compteur
        const cart = StoreUtils.getCart();
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Votre panier est vide</p>
                    <a href="index.html" class="primary-btn">Parcourir la boutique</a>
                </div>
            `;
            updateSummary(0);
            checkoutBtn.disabled = true;
            return;
        }
        
        cartItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const price = parseFloat(item.price.replace(',', '.').replace(' €', ''));
            const total = price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.setAttribute('data-id', item.id);
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-artist">${item.artist}</p>
                    <p class="cart-item-price">${item.price} x ${item.quantity}</p>
                    <p>Total: ${total.toFixed(2)} €</p>
                </div>
                <button class="cart-item-remove remove-from-cart" data-id="${item.id}" data-color="${item.color || 'default'}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        
        const subtotal = StoreUtils.calculateSubtotal(cart);
        updateSummary(subtotal);
        checkoutBtn.disabled = false;
    };
    
    // Mettre à jour le résumé de la commande
    function updateSummary(subtotal) {
        const shipping = subtotal > 0 ? 5.99 : 0;
        const total = subtotal + shipping;
        
        subtotalElement.textContent = `${subtotal.toFixed(2)} €`;
        shippingElement.textContent = `${shipping.toFixed(2)} €`;
        totalElement.textContent = `${total.toFixed(2)} €`;
    }
    
    // Gestion de la suppression d'un article du panier
    cartItemsContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-from-cart')) {
            const button = e.target.closest('.remove-from-cart');
            const productId = button.getAttribute('data-id');
            const productColor = button.getAttribute('data-color');
            
            StoreUtils.removeFromCart(productId, productColor);
            loadCart();
        }
    });
    
    // Gestion du bouton de commande
    checkoutBtn.addEventListener('click', function() {
        alert('Fonctionnalité de paiement à implémenter');
    });
    
    // Initialiser la page
    loadCart();
});