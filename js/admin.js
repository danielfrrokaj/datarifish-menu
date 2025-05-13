// Authentication state
let authToken = sessionStorage.getItem('adminAuthToken');
const AUTH_TOKEN_KEY = 'adminAuthToken';
const LOGIN_ATTEMPTS_KEY = 'loginAttempts';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Check if user is locked out
function isLockedOut() {
    const lockoutTime = localStorage.getItem('lockoutUntil');
    if (lockoutTime && parseInt(lockoutTime) > Date.now()) {
        const remainingMinutes = Math.ceil((parseInt(lockoutTime) - Date.now()) / (60 * 1000));
        return `Too many login attempts. Please try again in ${remainingMinutes} minutes.`;
    }
    return false;
}

// Reset login attempts
function resetLoginAttempts() {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutUntil');
}

// Increment login attempts and check for lockout
function handleFailedLogin() {
    const attempts = parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '0') + 1;
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, attempts);
    
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem('lockoutUntil', lockoutUntil);
        return isLockedOut();
    }
    return `Invalid password. ${MAX_LOGIN_ATTEMPTS - attempts} attempts remaining.`;
}

// Generate secure token
function generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Login functionality
async function login() {
    const password = document.getElementById('adminPassword').value;
    const lockoutMessage = isLockedOut();
    
    if (lockoutMessage) {
        alert(lockoutMessage);
        return;
    }

    try {
        // Hash the password (in a real app, this would be done server-side)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        
        // In a real app, this would be a server request
        if (hashedPassword === '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918') { // admin
            const token = generateToken();
            sessionStorage.setItem(AUTH_TOKEN_KEY, token);
            authToken = token;
            resetLoginAttempts();
            loginContainer.style.display = 'none';
            adminPanel.style.display = 'flex';
            loadData();
            
            // Set session expiry
            setTimeout(logout, 3600000); // 1 hour
        } else {
            const message = handleFailedLogin();
            alert(message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    }
}

// Check authentication on page load
function checkAuth() {
    if (!authToken) {
        logout();
        return;
    }
    
    loginContainer.style.display = 'none';
    adminPanel.style.display = 'flex';
    loadData();
}

// Logout functionality
function logout() {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    authToken = null;
    loginContainer.style.display = 'flex';
    adminPanel.style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

// Add authentication check to all sensitive functions
function requireAuth(fn) {
    return function(...args) {
        if (!authToken) {
            logout();
            return;
        }
        return fn.apply(this, args);
    };
}

// Wrap sensitive functions with authentication check
const loadData = requireAuth(function() {
    const data = JSON.parse(localStorage.getItem('menuData')) || {
        categories: [],
        items: []
    };
    currentItems = data.items; // Store items for filtering
    renderCategories(data.categories);
    renderItems(currentItems);
    updateCategorySelect(data.categories);
});

const saveData = requireAuth(function(data) {
    localStorage.setItem('menuData', JSON.stringify(data));
    loadData();
});

// Initialize authentication check
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeIconPicker();
    initializeSearch();
    initializeImagePreview();
});

// Add security headers
const meta = document.createElement('meta');
meta.httpEquiv = 'Content-Security-Policy';
meta.content = "default-src 'self' https://cdnjs.cloudflare.com https://img.icons8.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' https://img.icons8.com data:; script-src 'self' 'unsafe-inline';";
document.head.appendChild(meta);

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const adminPanel = document.getElementById('adminPanel');
const categoriesList = document.getElementById('categoriesList');
const itemsList = document.getElementById('itemsList');
const categoryModal = document.getElementById('categoryModal');
const itemModal = document.getElementById('itemModal');
const categoryForm = document.getElementById('categoryForm');
const itemForm = document.getElementById('itemForm');
const itemCategory = document.getElementById('itemCategory');
const categoryIconInput = document.getElementById('categoryIcon');
const iconPickerPreview = document.getElementById('selectedIconPreview');
const itemSearch = document.getElementById('itemSearch');
const searchLanguage = document.getElementById('searchLanguage');

// State
let editingItemId = null;
let editingCategoryId = null;
let customIcons = JSON.parse(localStorage.getItem('customIcons')) || [];
let currentItems = []; // Store current items for filtering

// Section navigation
function showSection(section) {
    document.getElementById('categoriesSection').style.display = section === 'categories' ? 'block' : 'none';
    document.getElementById('itemsSection').style.display = section === 'items' ? 'block' : 'none';
    
    // Update active button
    document.querySelectorAll('.sidebar button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(section));
    });
}

// Icon picker functionality
const iconCategories = {
    'Food & Drinks': [
        { type: 'font-awesome', icon: 'fas fa-fish', name: 'Fish' },
        { type: 'font-awesome', icon: 'fas fa-shrimp', name: 'Shrimp' },
        { type: 'font-awesome', icon: 'fas fa-bread-slice', name: 'Bread' },
        { type: 'font-awesome', icon: 'fas fa-cheese', name: 'Cheese' },
        { type: 'font-awesome', icon: 'fas fa-egg', name: 'Egg' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/salad.png', name: 'Salad' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/pizza.png', name: 'Pizza' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/sushi.png', name: 'Sushi' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/kawaii-sushi.png', name: 'Kawaii Sushi' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/fish-food.png', name: 'Fish Food' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/prawn.png', name: 'Prawn' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/crab.png', name: 'Crab' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/octopus.png', name: 'Octopus' },
        { type: 'font-awesome', icon: 'fas fa-ice-cream', name: 'Ice Cream' },
        { type: 'font-awesome', icon: 'fas fa-cookie', name: 'Cookie' },
    ],
    'Beverages': [
        { type: 'font-awesome', icon: 'fas fa-wine-glass-alt', name: 'Wine' },
        { type: 'font-awesome', icon: 'fas fa-wine-bottle', name: 'Wine Bottle' },
        { type: 'font-awesome', icon: 'fas fa-beer', name: 'Beer' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/cocktail.png', name: 'Cocktail' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/coffee.png', name: 'Coffee' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/tea.png', name: 'Tea' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/wine-glass.png', name: 'Wine Glass' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/champagne.png', name: 'Champagne' },
    ],
    'Kitchen & Restaurant': [
        { type: 'font-awesome', icon: 'fas fa-utensils', name: 'Utensils' },
        { type: 'font-awesome', icon: 'fas fa-concierge-bell', name: 'Service Bell' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/chef-hat.png', name: 'Chef Hat' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/cooking-pot.png', name: 'Cooking Pot' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/frying-pan.png', name: 'Frying Pan' },
        { type: 'icons8', icon: 'https://img.icons8.com/3d-fluency/94/cutlery.png', name: 'Cutlery' },
        { type: 'font-awesome', icon: 'fas fa-seedling', name: 'Fresh' },
    ]
};

// Create icon picker modal
const iconPickerModal = document.createElement('div');
iconPickerModal.id = 'iconPickerModal';
iconPickerModal.className = 'modal';
iconPickerModal.innerHTML = `
    <div class="modal-content icon-picker-content">
        <div class="icon-picker-header">
            <h2>Select an Icon</h2>
            <div class="custom-icon-input">
                <input type="text" id="customIconUrl" placeholder="Paste Icons8 URL (e.g., https://img.icons8.com/3d-fluency/94/...)">
                <input type="text" id="customIconName" placeholder="Icon name">
                <button type="button" id="addCustomIcon" class="add-custom-icon-btn">
                    <i class="fas fa-plus"></i> Add Custom Icon
                </button>
            </div>
            <input type="text" id="iconSearch" placeholder="Search icons..." class="icon-search">
        </div>
        <div class="icon-picker-categories">
            <div class="icon-category">
                <h3>Custom Icons</h3>
                <div class="icon-grid" id="customIconsGrid"></div>
            </div>
            ${Object.entries(iconCategories).map(([category, icons]) => `
                <div class="icon-category">
                    <h3>${category}</h3>
                    <div class="icon-grid">
                        ${icons.map(icon => `
                            <div class="icon-option" data-icon="${icon.icon}" data-type="${icon.type}" data-name="${icon.name.toLowerCase()}">
                                ${icon.type === 'font-awesome' 
                                    ? `<i class="${icon.icon}"></i>` 
                                    : `<img src="${icon.icon}" alt="${icon.name}" width="40" height="40">`
                                }
                                <span>${icon.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
`;
document.body.appendChild(iconPickerModal);

// Add styles for icon picker and custom icons
const iconPickerStyles = document.createElement('style');
iconPickerStyles.textContent = `
    .icon-picker-content {
        max-width: 800px !important;
        width: 90% !important;
        max-height: 80vh;
        overflow-y: auto;
    }

    .icon-picker-header {
        position: sticky;
        top: 0;
        background: white;
        padding: 1rem;
        border-bottom: 1px solid #eee;
        z-index: 1;
    }

    .icon-search {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-top: 1rem;
        font-size: 1rem;
    }

    .icon-category {
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }

    .icon-category h3 {
        margin-bottom: 1rem;
        color: var(--primary-blue);
    }

    .icon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 1rem;
    }

    .icon-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .icon-option:hover {
        background: var(--primary-blue);
        color: white;
        transform: translateY(-2px);
    }

    .icon-option.selected {
        background: var(--primary-blue);
        color: white;
    }

    .icon-option i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    .icon-option img {
        margin-bottom: 0.5rem;
        transition: transform 0.3s ease;
    }

    .icon-option:hover img {
        transform: scale(1.1);
    }

    .icon-option span {
        font-size: 0.8rem;
        text-align: center;
    }

    #selectedIconPreview {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 0.5rem;
    }

    #selectedIconPreview i {
        font-size: 1.5rem;
    }

    #selectedIconPreview img {
        width: 30px;
        height: 30px;
    }

    @media (max-width: 768px) {
        .icon-grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        }

        .icon-option {
            padding: 0.8rem;
        }

        .icon-option i {
            font-size: 1.5rem;
        }

        .icon-option img {
            width: 30px;
            height: 30px;
        }
    }

    // Custom icon styles
    .custom-icon-input {
        margin: 1rem 0;
        display: grid;
        gap: 0.5rem;
    }

    .custom-icon-input input {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.9rem;
    }

    .add-custom-icon-btn {
        background: var(--accent-blue);
        color: white;
        border: none;
        padding: 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        width: 100%;
    }

    .add-custom-icon-btn:hover {
        background: var(--primary-blue);
        transform: translateY(-1px);
    }

    #customIconsGrid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 1rem;
        padding: 1rem 0;
    }

    #customIconsGrid:empty {
        display: none;
    }

    #customIconsGrid:not(:empty) + .icon-category {
        border-top: 1px solid #eee;
        margin-top: 1rem;
        padding-top: 1rem;
    }

    .delete-custom-icon {
        position: absolute;
        top: 0.3rem;
        right: 0.3rem;
        background: rgba(244, 67, 54, 0.9);
        color: white;
        border: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .icon-option {
        position: relative;
    }

    .icon-option:hover .delete-custom-icon {
        opacity: 1;
    }
`;
document.head.appendChild(iconPickerStyles);

// Function to save custom icons
function saveCustomIcons() {
    localStorage.setItem('customIcons', JSON.stringify(customIcons));
}

// Function to render custom icons
function renderCustomIcons() {
    const customIconsGrid = document.getElementById('customIconsGrid');
    if (!customIconsGrid) return;

    customIconsGrid.innerHTML = customIcons.map(icon => `
        <div class="icon-option" data-icon="${icon.url}" data-type="icons8" data-name="${icon.name.toLowerCase()}">
            <img src="${icon.url}" alt="${icon.name}" width="40" height="40">
            <span>${icon.name}</span>
            <button class="delete-custom-icon" data-url="${icon.url}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    // Add delete handlers
    customIconsGrid.querySelectorAll('.delete-custom-icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = btn.dataset.url;
            customIcons = customIcons.filter(icon => icon.url !== url);
            saveCustomIcons();
            renderCustomIcons();
        });
    });
}

// Initialize icon picker functionality
function initializeIconPicker() {
    // Show icon picker modal
    iconPickerPreview.addEventListener('click', () => {
        iconPickerModal.style.display = 'flex';
        renderCustomIcons();
    });

    // Icon search functionality
    const iconSearch = document.getElementById('iconSearch');
    iconSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.icon-option').forEach(option => {
            const iconName = option.dataset.name;
            option.style.display = iconName.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Icon selection
    document.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', () => {
            const iconValue = option.dataset.icon;
            const iconType = option.dataset.type;
            categoryIconInput.value = iconValue;
            
            // Update preview
            iconPickerPreview.innerHTML = iconType === 'font-awesome'
                ? `<i class="${iconValue}"></i><span>${option.querySelector('span').textContent}</span>`
                : `<img src="${iconValue}" alt="${option.querySelector('span').textContent}" width="30" height="30"><span>${option.querySelector('span').textContent}</span>`;
            
            // Close modal
            iconPickerModal.style.display = 'none';
        });
    });

    // Add custom icon handler
    document.getElementById('addCustomIcon')?.addEventListener('click', () => {
        const urlInput = document.getElementById('customIconUrl');
        const nameInput = document.getElementById('customIconName');
        const url = urlInput.value.trim();
        const name = nameInput.value.trim();

        if (!url || !name) {
            alert('Please enter both URL and name for the custom icon');
            return;
        }

        if (!url.startsWith('https://img.icons8.com/')) {
            alert('Please enter a valid Icons8 URL');
            return;
        }

        // Add new custom icon
        customIcons.push({ url, name });
        saveCustomIcons();
        renderCustomIcons();

        // Clear inputs
        urlInput.value = '';
        nameInput.value = '';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === iconPickerModal) {
            iconPickerModal.style.display = 'none';
        }
    });
}

// Add search functionality
function initializeSearch() {
    itemSearch.addEventListener('input', filterItems);
    searchLanguage.addEventListener('change', filterItems);
}

function filterItems() {
    const searchTerm = itemSearch.value.toLowerCase();
    const searchLang = searchLanguage.value;
    
    const filteredItems = currentItems.filter(item => {
        const itemName = item.name[searchLang].toLowerCase();
        const itemDesc = item.description[searchLang].toLowerCase();
        const itemCategory = item.category.toLowerCase();
        
        return itemName.includes(searchTerm) || 
               itemDesc.includes(searchTerm) || 
               itemCategory.includes(searchTerm);
    });
    
    renderItems(filteredItems);
}

// Render functions
function renderCategories(categories) {
    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'item-card';
        const iconHtml = category.icon.startsWith('http')
            ? `<img src="${category.icon}" alt="${category.name.en}" width="30" height="30">`
            : `<i class="${category.icon}"></i>`;
        card.innerHTML = `
            <div class="item-info">
                <h3>${category.name.en}</h3>
                <p>${iconHtml} ${category.id}</p>
            </div>
            <div class="item-actions">
                <button class="edit-btn" onclick="editCategory('${category.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteCategory('${category.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        categoriesList.appendChild(card);
    });
}

function renderItems(items) {
    itemsList.innerHTML = '';
    
    if (items.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <i class="fas fa-search"></i>
            <p>No items found</p>
        `;
        itemsList.appendChild(noResults);
        return;
    }
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-info">
                <h3>${item.name.sq} (${item.name.en})</h3>
                <p>${item.category} - ${formatPrice(item.price)} ALL</p>
                <p class="availability-status ${item.available ? 'available' : 'unavailable'}">
                    <i class="fas ${item.available ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    ${item.available ? 'Available' : 'Unavailable'}
                </p>
            </div>
            <div class="item-actions">
                <button class="availability-btn ${item.available ? 'available' : 'unavailable'}" 
                        onclick="event.stopPropagation(); toggleAvailability('${item.id}')">
                    <i class="fas ${item.available ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                    ${item.available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button class="edit-btn" onclick="event.stopPropagation(); editItem('${item.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="event.stopPropagation(); deleteItem('${item.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        itemsList.appendChild(card);
    });
}

function updateCategorySelect(categories) {
    itemCategory.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name.en;
        itemCategory.appendChild(option);
    });
}

// Modal functions
function showAddCategoryForm() {
    editingCategoryId = null;
    categoryModal.style.display = 'flex';
    document.getElementById('categoryModalTitle').textContent = 'Add Category';
    categoryForm.reset();
}

function showAddItemForm() {
    editingItemId = null;
    itemModal.style.display = 'flex';
    document.getElementById('itemModalTitle').textContent = 'Add Menu Item';
    itemForm.reset();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// CRUD operations
function editCategory(categoryId) {
    const data = JSON.parse(localStorage.getItem('menuData'));
    const category = data.categories.find(c => c.id === categoryId);
    if (category) {
        editingCategoryId = categoryId;
        document.getElementById('categoryModalTitle').textContent = 'Edit Category';
        document.getElementById('categoryId').value = category.id;
        categoryIconInput.value = category.icon;
        document.getElementById('categoryName_en').value = category.name.en;
        document.getElementById('categoryName_it').value = category.name.it;
        document.getElementById('categoryName_sq').value = category.name.sq;
        
        // Update icon preview
        const iconType = category.icon.startsWith('http') ? 'icons8' : 'font-awesome';
        iconPickerPreview.innerHTML = iconType === 'font-awesome'
            ? `<i class="${category.icon}"></i><span>${category.name.en}</span>`
            : `<img src="${category.icon}" alt="${category.name.en}" width="30" height="30"><span>${category.name.en}</span>`;
        
        categoryModal.style.display = 'flex';
    }
}

// Image preview functionality
function initializeImagePreview() {
    const imageInput = document.getElementById('itemImage');
    const imagePreview = document.getElementById('imagePreview');

    imageInput.addEventListener('input', function() {
        const imageUrl = this.value.trim();
        updateImagePreview(imageUrl);
    });

    // Also update preview when editing an item
    if (imageInput.value) {
        updateImagePreview(imageInput.value);
    }
}

function updateImagePreview(imageUrl) {
    const imagePreview = document.getElementById('imagePreview');
    
    if (!imageUrl) {
        imagePreview.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-image"></i>
                <span>Image preview will appear here</span>
            </div>
        `;
        imagePreview.classList.remove('has-image');
        return;
    }

    // Create a new image element
    const img = new Image();
    img.onload = function() {
        imagePreview.innerHTML = '';
        imagePreview.appendChild(img);
        imagePreview.classList.add('has-image');
    };
    
    img.onerror = function() {
        imagePreview.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Invalid image URL</span>
            </div>
        `;
        imagePreview.classList.remove('has-image');
    };
    
    img.src = imageUrl;
}

// Update the editItem function to handle image preview
function editItem(itemId) {
    const data = JSON.parse(localStorage.getItem('menuData')) || { categories: [], items: [] };
    const item = data.items.find(i => i.id === itemId);
    if (item) {
        editingItemId = itemId;
        document.getElementById('itemModalTitle').textContent = 'Edit Menu Item';
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemImage').value = item.image || '';
        document.getElementById('itemAvailable').checked = item.available ?? true;
        
        // Update image preview
        updateImagePreview(item.image || '');
        
        // Set names with Albanian first
        document.getElementById('itemName_sq').value = item.name.sq;
        document.getElementById('itemName_en').value = item.name.en;
        document.getElementById('itemName_it').value = item.name.it;
        
        // Set descriptions with Albanian first
        document.getElementById('itemDesc_sq').value = item.description.sq;
        document.getElementById('itemDesc_en').value = item.description.en;
        document.getElementById('itemDesc_it').value = item.description.it;
        
        itemModal.style.display = 'flex';
    }
}

function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        const data = JSON.parse(localStorage.getItem('menuData')) || { categories: [], items: [] };
        data.categories = data.categories.filter(c => c.id !== categoryId);
        // Also delete all items in this category
        data.items = data.items.filter(i => i.category !== categoryId);
        saveData(data);
    }
}

function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        const data = JSON.parse(localStorage.getItem('menuData')) || { categories: [], items: [] };
        data.items = data.items.filter(i => i.id !== itemId);
        saveData(data);
    }
}

function toggleAvailability(itemId) {
    const data = JSON.parse(localStorage.getItem('menuData')) || { categories: [], items: [] };
    data.items = data.items.map(item => {
        if (item.id === itemId) {
            return { ...item, available: !item.available };
        }
        return item;
    });
    saveData(data);
}

// Form submissions
categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = JSON.parse(localStorage.getItem('menuData')) || { categories: [], items: [] };
    const categoryData = {
        id: document.getElementById('categoryId').value,
        icon: document.getElementById('categoryIcon').value,
        name: {
            en: document.getElementById('categoryName_en').value,
            it: document.getElementById('categoryName_it').value,
            sq: document.getElementById('categoryName_sq').value
        }
    };

    if (editingCategoryId) {
        data.categories = data.categories.map(c => 
            c.id === editingCategoryId ? categoryData : c
        );
    } else {
        data.categories.push(categoryData);
    }

    saveData(data);
    closeModal('categoryModal');
});

itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = JSON.parse(localStorage.getItem('menuData')) || { categories: [], items: [] };
    const itemData = {
        id: document.getElementById('itemId').value,
        category: document.getElementById('itemCategory').value,
        price: parseInt(document.getElementById('itemPrice').value),
        image: document.getElementById('itemImage').value,
        available: document.getElementById('itemAvailable').checked,
        name: {
            en: document.getElementById('itemName_en').value,
            it: document.getElementById('itemName_it').value,
            sq: document.getElementById('itemName_sq').value
        },
        description: {
            en: document.getElementById('itemDesc_en').value,
            it: document.getElementById('itemDesc_it').value,
            sq: document.getElementById('itemDesc_sq').value
        }
    };

    if (editingItemId) {
        data.items = data.items.map(i => 
            i.id === editingItemId ? itemData : i
        );
    } else {
        data.items.push(itemData);
    }

    saveData(data);
    closeModal('itemModal');
});

// Helper functions
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Close modals when clicking outside
window.onclick = (event) => {
    if (event.target === categoryModal) {
        closeModal('categoryModal');
    }
    if (event.target === itemModal) {
        closeModal('itemModal');
    }
};

// Add these styles to your existing styles
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .no-results {
        text-align: center;
        padding: 2rem;
        background: var(--white);
        border-radius: 8px;
        box-shadow: var(--shadow);
    }

    .no-results i {
        font-size: 2rem;
        color: #999;
        margin-bottom: 1rem;
    }

    .no-results p {
        color: #666;
        margin: 0;
    }
`;
document.head.appendChild(searchStyles); 