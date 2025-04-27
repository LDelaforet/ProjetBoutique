document.addEventListener('DOMContentLoaded', function() {
    const productId = getProductIdFromUrl();
    loadProductData(productId);

    function renderProducts() {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToDisplay = filteredProducts.slice(startIndex, endIndex);
    
        // Vider le conteneur avant d'ajouter de nouveaux produits
        productsContainer.innerHTML = '';
    
        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-id', product.id);
        
            const isInWishlist = StoreUtils.isInWishlist(product.id);
            const wishlistIconClass = isInWishlist ? 'fas' : 'far';
            const mainImage = product.images ? `/images/${product.images[0]}` : '/images/albumTemplate.jpg';
            const secondaryImage = product.images && product.images.length > 1 ? `/images/${product.images[1]}` : mainImage;
        
            productCard.innerHTML = `
                <div class="product-img-container">
                    <img src="${mainImage}" alt="${product.artist} - ${product.title}" class="product-img primary">
                    <img src="${secondaryImage}" alt="${product.artist} - ${product.title}" class="product-img secondary">
                    ${product.discount ? `<span class="discount-badge">${product.discount}</span>` : ''}
                    <button class="wishlist-btn"><i class="${wishlistIconClass} fa-heart"></i></button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-artist">${product.artist}</p>
                    <div class="product-price">
                        <span class="current-price">${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price">${product.originalPrice}</span>` : ''}
                    </div>
                    <a href="product.html?id=${product.id}" class="view-product-btn">Voir le produit</a>
                </div>
            `;
        
            productsContainer.appendChild(productCard);
        });
    
        // Gérer la visibilité du bouton "Charger plus"
        loadMoreBtn.style.display = endIndex < filteredProducts.length ? 'block' : 'none';
    }

    function setupProductPage(product) {
        const mainImage = document.getElementById('main-image');
        const thumbnailsContainer = document.querySelector('.thumbnails');
        const prevButton = document.querySelector('.gallery-nav.prev');
        const nextButton = document.querySelector('.gallery-nav.next');

        thumbnailsContainer.innerHTML = '';

        product.images.forEach((imgSrc, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
            thumbnail.setAttribute('data-src', `/images/${imgSrc}`);

            const img = document.createElement('img');
            img.src = `/images/${imgSrc}`;
            img.alt = `${product.artist} - ${product.title} - Vue ${index + 1}`;

            thumbnail.appendChild(img);
            thumbnailsContainer.appendChild(thumbnail);

            thumbnail.addEventListener('click', function() {
                const imageSrc = this.getAttribute('data-src');
                updateMainImage(imageSrc, index);
            });
        });

        mainImage.src = `/images/${product.images[0]}`;
        mainImage.alt = `${product.artist} - ${product.title}`;

        let currentImageIndex = 0;
        const imageUrls = product.images.map(img => `/images/${img}`);

        function updateMainImage(src, index) {
            mainImage.src = src;
            currentImageIndex = index;

            const thumbnails = document.querySelectorAll('.thumbnail');
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            thumbnails[index].classList.add('active');
        }

        prevButton.addEventListener('click', function() {
            const newIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
            updateMainImage(imageUrls[newIndex], newIndex);
        });

        nextButton.addEventListener('click', function() {
            const newIndex = (currentImageIndex + 1) % imageUrls.length;
            updateMainImage(imageUrls[newIndex], newIndex);
        });

        const quantityInput = document.getElementById('quantity');
        const decreaseBtn = document.getElementById('decrease-qty');
        const increaseBtn = document.getElementById('increase-qty');

        quantityInput.setAttribute('max', product.stock);

        decreaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        increaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            const maxValue = parseInt(quantityInput.getAttribute('max'));
            if (currentValue < maxValue) {
                quantityInput.value = currentValue + 1;
            } else {
                StoreUtils.showToast("Quantité maximale atteinte");
            }
        });

        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            const max = parseInt(this.getAttribute('max'));
            const min = parseInt(this.getAttribute('min'));

            if (isNaN(value) || value < min) {
                value = min;
            } else if (value > max) {
                value = max;
                StoreUtils.showToast("Quantité maximale atteinte");
            }

            this.value = value;
        });

        const addToCartBtn = document.getElementById('add-to-cart');
        const addToWishlistBtn = document.getElementById('add-to-wishlist');

        const readMoreBtn = document.querySelector('.read-more-btn');
        const descriptionExcerpt = document.querySelector('.description-excerpt');
        const descriptionFull = document.querySelector('.description-full');

        readMoreBtn.addEventListener('click', function() {
            if (descriptionFull.classList.contains('hidden')) {
                descriptionFull.classList.remove('hidden');
                descriptionExcerpt.style.display = 'none';
                this.textContent = 'Lire moins';
            } else {
                descriptionFull.classList.add('hidden');
                descriptionExcerpt.style.display = 'block';
                this.textContent = 'Lire plus';
            }
        });

        const colorOptions = document.querySelectorAll('.color-option');

        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                const selectedColor = this.getAttribute('data-color');
                console.log(`Couleur sélectionnée: ${selectedColor}`);
            });
        });

        addToCartBtn.addEventListener('click', function() {
            const quantity = parseInt(quantityInput.value);
            const selectedColor = document.querySelector('.color-option.active').getAttribute('data-color');

            const productData = {
                id: product.id,
                title: product.title,
                artist: product.artist,
                price: product.price,
                image: `/images/${product.images[0]}`,
                color: selectedColor,
                quantity: quantity
            };

            StoreUtils.addToCart(productData);
            StoreUtils.showToast("Produit ajouté au panier");
        });

        addToWishlistBtn.addEventListener('click', function() {
            const isInWishlist = StoreUtils.isInWishlist(product.id);

            if (isInWishlist) {
                StoreUtils.removeFromWishlist(product.id);
                StoreUtils.showToast("Produit retiré des favoris");
                const wishlistIcon = document.querySelector('#add-to-wishlist i');
                wishlistIcon.classList.remove('fas');
                wishlistIcon.classList.add('far');
            } else {
                const productData = {
                    id: product.id,
                    title: product.title,
                    artist: product.artist,
                    price: product.price,
                    image: `/images/${product.images[0]}`
                };
                StoreUtils.addToWishlist(productData);
                StoreUtils.showToast("Produit ajouté aux favoris");
                const wishlistIcon = document.querySelector('#add-to-wishlist i');
                wishlistIcon.classList.remove('far');
                wishlistIcon.classList.add('fas');
            }
        });

        if (StoreUtils.isInWishlist(product.id)) {
            const wishlistIcon = document.querySelector('#add-to-wishlist i');
            wishlistIcon.classList.remove('far');
            wishlistIcon.classList.add('fas');
        }
    }

    function getProductIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || '1';
    }

    async function loadProductData(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`);
            const product = await response.json();
    
            if (product) {
                document.title = `${product.title} - ${product.artist} | VinylVault`;
                document.querySelector('.product-info h1').textContent = product.title;
                document.querySelector('.artist').textContent = product.artist;
                document.querySelector('.ref').textContent = `Réf: VIN${product.id.toString().padStart(5, '0')}`;
                document.querySelector('.current-price').textContent = product.price;
    
                if (product.originalPrice) {
                    document.querySelector('.original-price').textContent = product.originalPrice;
                    document.querySelector('.discount-tag').textContent = product.discount;
                } else {
                    document.querySelector('.original-price').style.display = 'none';
                    document.querySelector('.discount-tag').style.display = 'none';
                }
    
                const mainImage = document.getElementById('main-image');
                const thumbnails = document.querySelectorAll('.thumbnail img');
                if (product.images && product.images.length > 0) {
                    mainImage.src = `/images/${product.images[0]}`;
                    thumbnails.forEach((thumb, index) => {
                        if (product.images[index]) {
                            thumb.src = `/images/${product.images[index]}`;
                            thumb.parentElement.setAttribute('data-src', `/images/${product.images[index]}`);
                        }
                    });
                }
    
                document.querySelector('.stock-info').textContent = `En stock (${product.stock} exemplaires)`;
                document.getElementById('quantity').setAttribute('max', product.stock);
    
                // Gestion de la description
                const fullDescription = product.description;
                
                // Création d'un extrait de la description (100 premiers caractères)
                const excerptLength = 100;
                const excerpt = fullDescription.length > excerptLength 
                    ? fullDescription.substring(0, excerptLength) + '...' 
                    : fullDescription;
                
                const descriptionExcerpt = document.querySelector('.description-excerpt');
                const descriptionFull = document.querySelector('.description-full');
                const readMoreBtn = document.querySelector('.read-more-btn');
                
                // Configurer l'extrait et la description complète
                descriptionExcerpt.textContent = excerpt;
                descriptionFull.innerHTML = `<p>${fullDescription}</p>`;
                
                // Afficher ou masquer le bouton "Lire plus" selon la longueur de la description
                if (fullDescription.length <= excerptLength) {
                    readMoreBtn.style.display = 'none';
                } else {
                    readMoreBtn.style.display = 'block';
                    readMoreBtn.textContent = 'Lire plus';
                    descriptionFull.classList.add('hidden');
                }
    
                const characteristicsList = document.querySelector('.product-characteristics ul');
                characteristicsList.innerHTML = `
                    <li><span>Genre:</span> ${getGenreName(product.genre)}</li>
                    <li><span>Année:</span> ${product.era.replace('s', '')}0s</li>
                    <li><span>Format:</span> ${product.characteristics.format}</li>
                    <li><span>Label:</span> ${product.characteristics.label}</li>
                    <li><span>Matière:</span> ${product.characteristics.matiere}</li>
                `;
    
                updateBreadcrumb(product);
                setupProductPage(product);
            }
        } catch (error) {
            console.error('Erreur lors du chargement du produit:', error);
            document.querySelector('main').innerHTML = `
                <div class="error-message">
                    <h2>Produit non trouvé</h2>
                    <p>Désolé, le produit demandé n'existe pas ou n'est plus disponible.</p>
                    <a href="index.html" class="back-to-home">Retourner à l'accueil</a>
                </div>
            `;
        }
    }

    function updateBreadcrumb(product) {
        const breadcrumb = document.querySelector('.breadcrumb');
        breadcrumb.innerHTML = `
            <a href="index.html">Accueil</a> > 
            <a href="index.html?filter=${product.genre}">${getGenreName(product.genre)}</a> > 
            <span>${product.title}</span>
        `;
    }

    function getGenreName(genre) {
        const genres = {
            'rock': 'Rock',
            'jazz': 'Jazz',
            'electronic': 'Électronique',
            'hiphop': 'Hip-Hop',
            'classique': 'Classique',
            'pop': 'Pop'
        };
        return genres[genre] || genre;
    }
});
