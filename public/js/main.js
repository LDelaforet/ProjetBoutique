document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const filterGenre = document.getElementById('filter-genre');
    const filterEra = document.getElementById('filter-era');
    const filterArtistType = document.getElementById('filter-artist-type');
    const sortOption = document.getElementById('sort-option');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mainNav = document.querySelector('.main-nav');
    const wishlistCount = document.getElementById('wishlist-count');
    const cartCount = document.getElementById('cart-count');

    // État de l'application
    let products = [];
    let filteredProducts = [];
    let currentPage = 1;
    const productsPerPage = 6;
    let currentFilters = {
        genre: '',
        era: '',
        artistType: '',
        search: '',
        sort: 'default'
    };

    // Initialiser la page
    init();

    async function init() {
        // Charger les produits depuis l'API
        products = await fetchProducts();
        
        // Vérifier si une URL contient un paramètre de filtre
        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');

        if (filterParam) {
            currentFilters.genre = filterParam;
            filterGenre.value = filterParam;
        }

        applyFilters();
        setupEventListeners();
        updateCounters();
    }

    async function fetchProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
            return [];
        }
    }

    function updateCounters() {
        const wishlist = StoreUtils.getWishlist();
        wishlistCount.textContent = wishlist.length;

        const cart = StoreUtils.getCart();
        cartCount.textContent = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    }

    function setupEventListeners() {
        searchBtn.addEventListener('click', applySearch);
        searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && applySearch());
        filterGenre.addEventListener('change', updateFilters);
        filterEra.addEventListener('change', updateFilters);
        filterArtistType.addEventListener('change', updateFilters);
        sortOption.addEventListener('change', updateFilters);
        resetFiltersBtn.addEventListener('click', resetFilters);
        loadMoreBtn.addEventListener('click', loadMoreProducts);
        hamburgerMenu.addEventListener('click', toggleMobileMenu);
        
        productsContainer.addEventListener('click', handleProductCardClick);
    }

    function applySearch() {
        currentFilters.search = searchInput.value.trim().toLowerCase();
        currentPage = 1;
        applyFilters();
    }

    function updateFilters() {
        currentFilters.genre = filterGenre.value;
        currentFilters.era = filterEra.value;
        currentFilters.artistType = filterArtistType.value;
        currentFilters.sort = sortOption.value;
        currentPage = 1;
        applyFilters();
    }

    function resetFilters() {
        currentFilters = {
            genre: '',
            era: '',
            artistType: '',
            search: '',
            sort: 'default'
        };

        filterGenre.value = '';
        filterEra.value = '';
        filterArtistType.value = '';
        sortOption.value = 'default';
        searchInput.value = '';

        currentPage = 1;
        applyFilters();
    }

    function applyFilters() {
        filteredProducts = products.filter(product => {
            const matchesSearch = !currentFilters.search || 
                product.title.toLowerCase().includes(currentFilters.search) || 
                product.artist.toLowerCase().includes(currentFilters.search);
            
            const matchesGenre = !currentFilters.genre || product.genre === currentFilters.genre;
            const matchesEra = !currentFilters.era || product.era === currentFilters.era;
            const matchesArtistType = !currentFilters.artistType || product.artistType === currentFilters.artistType;

            return matchesSearch && matchesGenre && matchesEra && matchesArtistType;
        });

        sortProducts();
        renderProducts();
    }

    function sortProducts() {
        const priceToNumber = (priceStr) => parseFloat(priceStr.replace(',', '.').replace(' €', ''));

        switch (currentFilters.sort) {
            case 'price-asc':
                filteredProducts.sort((a, b) => priceToNumber(a.price) - priceToNumber(b.price));
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => priceToNumber(b.price) - priceToNumber(a.price));
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.title.localeCompare(a.title, 'fr'));
                break;
            default:
                break;
        }
    }

    function renderProducts() {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToDisplay = filteredProducts.slice(startIndex, endIndex);
    
        // Vider le conteneur pour la première page
        if (currentPage === 1) {
            productsContainer.innerHTML = '';
        }
    
        // Afficher les produits
        productsToDisplay.forEach(product => {
            const isInWishlist = StoreUtils.isInWishlist(product.id);
            const wishlistIconClass = isInWishlist ? 'fas' : 'far';
            const mainImage = product.images && product.images[0] ? `/images/${product.images[0]}` : '/images/albumTemplate.jpg';
            const secondaryImage = product.images && product.images[1] ? `/images/${product.images[1]}` : mainImage;
    
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-id', product.id);
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
    
        // Gérer le bouton "Charger plus"
        manageLoadMoreButton(endIndex);
    }
    
    function manageLoadMoreButton(endIndex) {
        // Supprimer l'ancien bouton s'il existe
        const oldButton = document.getElementById('load-more-btn');
        if (oldButton) {
            oldButton.remove();
        }
    
        // Créer le bouton seulement s'il reste des produits à afficher
        if (endIndex < filteredProducts.length) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.id = 'load-more-btn';
            loadMoreBtn.textContent = 'Charger plus';
            loadMoreBtn.addEventListener('click', loadMoreProducts);
            
            // Créer un conteneur pour le bouton
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'load-more-container';
            buttonContainer.appendChild(loadMoreBtn);
            
            // Ajouter le bouton après les produits
            productsContainer.parentNode.insertBefore(buttonContainer, productsContainer.nextSibling);
        }
    }
    

    function loadMoreProducts() {
        currentPage++;
        renderProducts();
    }

    function toggleMobileMenu() {
        mainNav.classList.toggle('active');
        hamburgerMenu.classList.toggle('active');
    }

    function handleProductCardClick(e) {
        const wishlistBtn = e.target.closest('.wishlist-btn');
        if (wishlistBtn) {
            const productCard = wishlistBtn.closest('.product-card');
            const productId = parseInt(productCard.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);

            if (product) {
                const wasAdded = StoreUtils.toggleWishlist(productId, {
                    id: product.id,
                    title: product.title,
                    artist: product.artist,
                    price: product.price,
                    image: product.images ? `/images/${product.images[0]}` : '/images/albumTemplate.jpg'
                });

                const icon = wishlistBtn.querySelector('i');
                icon.className = wasAdded ? 'fas fa-heart' : 'far fa-heart';
                StoreUtils.showToast(wasAdded ? "Produit ajouté aux favoris" : "Produit retiré des favoris");
                updateCounters();
            }
        }
    }
});