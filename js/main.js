// Default menu data with translations
const defaultMenuData = {
    categories: [
        {
            id: 'starters',
            icon: 'fas fa-bread-slice',
            name: {
                en: 'Starters',
                it: 'Antipasti',
                sq: 'Paragjellë'
            }
        },
        {
            id: 'main_courses',
            icon: 'fas fa-fish',
            name: {
                en: 'Main Courses',
                it: 'Secondi Piatti',
                sq: 'Gjellë Kryesore'
            }
        },
        {
            id: 'seafood',
            icon: 'fas fa-shrimp',
            name: {
                en: 'Seafood',
                it: 'Frutti di Mare',
                sq: 'Fruta Deti'
            }
        },
        {
            id: 'desserts',
            icon: 'fas fa-ice-cream',
            name: {
                en: 'Desserts',
                it: 'Dolci',
                sq: 'Ëmbëlsira'
            }
        }
    ],
    items: [
        {
            id: 'fish_soup',
            category: 'starters',
            name: {
                en: 'Fish Soup',
                it: 'Zuppa di Pesce',
                sq: 'Supë Peshku'
            },
            description: {
                en: 'Fresh fish soup with vegetables and herbs',
                it: 'Zuppa di pesce fresco con verdure ed erbe',
                sq: 'Supë peshku e freskët me perime dhe erëza'
            },
            price: 800,
            image: 'fish-soup.jpg'
        },
        {
            id: 'calamari',
            category: 'starters',
            name: {
                en: 'Fried Calamari',
                it: 'Calamari Fritti',
                sq: 'Kallamarë të Skuqur'
            },
            description: {
                en: 'Crispy fried calamari rings with tartar sauce',
                it: 'Anelli di calamari fritti croccanti con salsa tartara',
                sq: 'Unaza kallamari të skuqura kërcëlluese me salcë tartare'
            },
            price: 1200,
            image: 'calamari.jpg'
        },
        {
            id: 'seafood_risotto',
            category: 'main_courses',
            name: {
                en: 'Seafood Risotto',
                it: 'Risotto ai Frutti di Mare',
                sq: 'Rizoto me Fruta Deti'
            },
            description: {
                en: 'Creamy risotto with mixed seafood and white wine',
                it: 'Risotto cremoso ai frutti di mare e vino bianco',
                sq: 'Rizoto kremore me fruta deti dhe verë të bardhë'
            },
            price: 1800,
            image: 'seafood-risotto.jpg'
        },
        {
            id: 'grilled_octopus',
            category: 'seafood',
            name: {
                en: 'Grilled Octopus',
                it: 'Polpo alla Griglia',
                sq: 'Oktapod në Skarë'
            },
            description: {
                en: 'Tender octopus grilled with olive oil and herbs',
                it: 'Polpo tenero grigliato con olio d\'oliva ed erbe',
                sq: 'Oktapod i butë në skarë me vaj ulliri dhe erëza'
            },
            price: 2200,
            image: 'octopus.jpg'
        },
        {
            id: 'sea_bass',
            category: 'main_courses',
            name: {
                en: 'Grilled Sea Bass',
                it: 'Spigola alla Griglia',
                sq: 'Levreku në Skarë'
            },
            description: {
                en: 'Fresh sea bass grilled to perfection with Mediterranean herbs',
                it: 'Spigola fresca grigliata alla perfezione con erbe mediterranee',
                sq: 'Levrek i freskët i pjekur në perfeksion me erëza mesdhetare'
            },
            price: 2500,
            image: 'sea-bass.jpg'
        },
        {
            id: 'mixed_seafood_grill',
            category: 'seafood',
            name: {
                en: 'Mixed Seafood Grill',
                it: 'Grigliata Mista di Mare',
                sq: 'Zgara e Përzier me Fruta Deti'
            },
            description: {
                en: 'Selection of grilled fish and seafood with lemon and herbs',
                it: 'Selezione di pesce e frutti di mare alla griglia con limone ed erbe',
                sq: 'Përzgjedhje peshku dhe fruta deti në skarë me limon dhe erëza'
            },
            price: 3500,
            image: 'mixed-grill.jpg'
        },
        {
            id: 'tiramisu',
            category: 'desserts',
            name: {
                en: 'Tiramisu',
                it: 'Tiramisù',
                sq: 'Tiramisu'
            },
            description: {
                en: 'Classic Italian dessert with coffee and mascarpone',
                it: 'Classico dessert italiano con caffè e mascarpone',
                sq: 'Ëmbëlsirë klasike italiane me kafe dhe maskarpone'
            },
            price: 800,
            image: 'tiramisu.jpg'
        },
        {
            id: 'panna_cotta',
            category: 'desserts',
            name: {
                en: 'Panna Cotta',
                it: 'Panna Cotta',
                sq: 'Pana Kota'
            },
            description: {
                en: 'Vanilla panna cotta with berry sauce',
                it: 'Panna cotta alla vaniglia con salsa ai frutti di bosco',
                sq: 'Pana kota me vanilje dhe sos manaferash'
            },
            price: 700,
            image: 'panna-cotta.jpg'
        }
    ]
};

// Get menu data from localStorage or use default
let menuData = JSON.parse(localStorage.getItem('menuData')) || defaultMenuData;

// Initialize localStorage with default data if empty
if (!localStorage.getItem('menuData')) {
    localStorage.setItem('menuData', JSON.stringify(defaultMenuData));
}

// Current language
let currentLang = 'sq'; // Default language

// DOM Elements
const languageModal = document.getElementById('languageModal');
const mainContent = document.getElementById('mainContent');
const categoriesContainer = document.getElementById('categories');
const menuItemsContainer = document.getElementById('menuItems');
const currentLangBtn = document.getElementById('currentLang');
const currentLangFlag = document.getElementById('currentLangFlag');
const currentLangText = document.getElementById('currentLangText');

// Create wave container
const waveContainer = document.createElement('div');
waveContainer.className = 'wave-container';
waveContainer.innerHTML = `
    <div class="wave wave1"></div>
    <div class="wave wave2"></div>
    <div class="wave wave3"></div>
`;
document.querySelector('header').appendChild(waveContainer);

// Language translations
const translations = {
    back: {
        en: 'Back',
        it: 'Indietro',
        sq: 'Kthehu'
    }
};

// Add back button container
const backButtonContainer = document.createElement('div');
backButtonContainer.className = 'back-button-container';
backButtonContainer.style.display = 'none';
backButtonContainer.innerHTML = `
    <button id="backButton" class="back-button">
        <i class="fas fa-arrow-left"></i>
        <span class="back-text">${translations.back[currentLang]}</span>
    </button>
`;
document.querySelector('#mainContent').insertBefore(backButtonContainer, categoriesContainer);

// Back button click handler
document.getElementById('backButton').addEventListener('click', () => {
    categoriesContainer.style.display = 'grid';
    menuItemsContainer.style.display = 'none';
    backButtonContainer.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Scroll to top function
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update back button text when language changes
function updateBackButtonText() {
    const backText = document.querySelector('.back-text');
    if (backText) {
        backText.textContent = translations.back[currentLang];
    }
}

// Modify the language selection handler
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentLang = btn.dataset.lang;
        languageModal.style.display = 'none';
        mainContent.style.display = 'block';
        updateLanguageDisplay();
        updateBackButtonText();
        renderCategories();
    });
});

// Update language display in header
function updateLanguageDisplay() {
    const langNames = {
        en: 'English',
        it: 'Italiano',
        sq: 'Shqip'
    };
    const flagCodes = {
        en: 'gb',
        it: 'it',
        sq: 'al'
    };
    currentLangFlag.className = `fi fi-${flagCodes[currentLang]}`;
    currentLangText.textContent = langNames[currentLang];
}

// Render categories
function renderCategories() {
    // Get fresh data from localStorage
    menuData = JSON.parse(localStorage.getItem('menuData')) || defaultMenuData;
    
    categoriesContainer.innerHTML = '';
    menuData.categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-card';
        const iconHtml = category.icon.startsWith('http')
            ? `<img src="${category.icon}" alt="${category.name[currentLang]}" width="40" height="40">`
            : `<i class="${category.icon}"></i>`;
        categoryElement.innerHTML = `
            ${iconHtml}
            <h3>${category.name[currentLang]}</h3>
        `;
        categoryElement.addEventListener('click', () => {
            renderMenuItems(category.id);
            // Hide categories and show back button
            categoriesContainer.style.display = 'none';
            menuItemsContainer.style.display = 'grid';
            backButtonContainer.style.display = 'block';
            // Scroll to top
            scrollToTop();
        });
        categoriesContainer.appendChild(categoryElement);
    });
}

// Render menu items
function renderMenuItems(categoryId) {
    // Get fresh data from localStorage
    menuData = JSON.parse(localStorage.getItem('menuData')) || defaultMenuData;
    
    menuItemsContainer.innerHTML = '';
    const items = menuData.items.filter(item => item.category === categoryId);
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item';
        itemElement.innerHTML = `
            ${item.image ? `
                <div class="menu-item-image">
                    <img src="assets/images/${item.image}" alt="${item.name[currentLang]}">
                </div>
            ` : ''}
            <div class="menu-item-content">
                <h3>${item.name[currentLang]}</h3>
                <p>${item.description[currentLang]}</p>
                <span class="price">${formatPrice(item.price)} ALL</span>
            </div>
        `;
        menuItemsContainer.appendChild(itemElement);
    });
}

// Format price with thousand separator
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Additional styles for categories and menu items
const additionalStyles = `
    .category-card {
        background: var(--white);
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: var(--shadow);
        width: 100%;
        margin: 0;
    }

    .category-card:hover {
        transform: translateY(-5px);
    }

    .category-card i {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: var(--accent-blue);
    }

    .menu-item {
        background: var(--white);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: var(--shadow);
        animation: slideIn 0.3s ease-out;
        width: 100%;
        margin: 0;
    }

    #menuItems {
        display: grid;
        gap: 2rem;
        width: 100%;
        padding: 0 1rem;
        box-sizing: border-box;
    }

    #categories {
        display: grid;
        gap: 2rem;
        width: 100%;
        padding: 0 1rem;
        box-sizing: border-box;
    }

    .menu-item-image {
        height: 200px;
        overflow: hidden;
        width: 100%;
    }

    .menu-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .menu-item:hover .menu-item-image img {
        transform: scale(1.1);
    }

    .menu-item-content {
        padding: 1.5rem;
        width: 100%;
        box-sizing: border-box;
    }

    .menu-item-content h3 {
        color: var(--primary-blue);
        margin-bottom: 0.5rem;
    }

    .menu-item-content p {
        color: var(--text-dark);
        margin-bottom: 1rem;
        opacity: 0.8;
    }

    .price {
        display: block;
        color: var(--accent-blue);
        font-size: 1.2rem;
        font-weight: bold;
    }

    .back-button-container {
        margin-bottom: 2rem;
        padding: 0 1rem;
        width: 100%;
        box-sizing: border-box;
    }

    .back-button {
        background: var(--primary-blue);
        color: var(--white);
        border: none;
        padding: 1rem 2rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        transition: all 0.3s ease;
        width: auto;
    }

    .back-button:hover {
        background: var(--accent-blue);
        transform: translateY(-2px);
    }

    .back-button i {
        font-size: 1.2rem;
    }

    /* Language selector styles */
    .lang-selector {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.3rem 0.5rem;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.85rem;
    }

    .lang-selector:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .lang-selector:hover span {
        color: var(--white);
    }

    .fi {
        display: inline-block;
        width: 1.2rem;
        height: 0.9rem;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        vertical-align: middle;
    }

    .lang-selector .fi {
        width: 1.2rem;
        height: 0.9rem;
    }

    .lang-btn {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.6rem 1rem;
        width: 100%;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 0.3rem;
    }

    .lang-btn:hover {
        background: var(--primary-blue);
    }

    .lang-btn:hover span {
        color: var(--white);
    }

    .lang-btn .fi {
        width: 1.4rem;
        height: 1rem;
    }

    .lang-btn span {
        font-size: 0.95rem;
        transition: color 0.2s ease;
    }

    #currentLangFlag {
        width: 1.2rem;
        height: 0.9rem;
    }

    #currentLangText {
        transition: color 0.2s ease;
        font-size: 0.85rem;
    }

    @media (max-width: 768px) {
        #menuItems, #categories {
            grid-template-columns: 1fr;
        }

        .menu-item {
            margin: 0 auto;
        }

        .menu-item-image {
            height: 180px;
        }

        .back-button {
            width: 100%;
            justify-content: center;
        }

        .lang-selector {
            padding: 0.25rem 0.4rem;
            font-size: 0.8rem;
        }

        .fi,
        .lang-selector .fi,
        #currentLangFlag {
            width: 1.1rem;
            height: 0.8rem;
        }

        .lang-btn {
            padding: 0.5rem 0.8rem;
        }

        .lang-modal-content {
            padding: 1rem;
        }
    }

    /* Wave animation styles */
    .wave-container {
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 80px;
        overflow: hidden;
        transform: rotate(180deg);
    }

    .wave {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 200%;
        height: 100%;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' fill='%23ffffff' opacity='0.25'/%3E%3C/svg%3E");
        background-repeat: repeat-x;
        background-position: 0 bottom;
        background-size: 1200px 100px;
        transform-origin: center bottom;
    }

    .wave1 {
        animation: wave-slide 10s linear infinite;
        z-index: 1;
        opacity: 0.3;
    }

    .wave2 {
        animation: wave-slide 7s linear infinite;
        z-index: 2;
        opacity: 0.5;
    }

    .wave3 {
        animation: wave-slide 4s linear infinite;
        z-index: 3;
        opacity: 0.2;
    }

    @keyframes wave-slide {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-50%);
        }
    }

    /* Update header styles */
    header {
        position: relative;
        background: var(--primary-blue);
        padding: 2rem 1rem;
        color: var(--white);
        text-align: center;
        overflow: hidden;
    }

    header h1 {
        position: relative;
        z-index: 4;
        margin: 0;
        font-size: 2.5rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        .wave-container {
            height: 50px;
            bottom: -1px;
        }

        .wave {
            background-size: 800px 60px;
        }

        header {
            padding: 1.5rem 1rem;
        }

        header h1 {
            font-size: 2rem;
        }
    }
`;

// Add additional styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Add storage event listener to update menu when changes are made in admin panel
window.addEventListener('storage', (e) => {
    if (e.key === 'menuData') {
        menuData = JSON.parse(e.newValue);
        renderCategories();
    }
});

// Remove language selector related code
document.getElementById('currentLang')?.remove(); 