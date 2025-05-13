// Icon picker functionality
const iconCategories = {
    'Food & Drinks': [
        { icon: 'fas fa-fish', name: 'Fish' },
        { icon: 'fas fa-shrimp', name: 'Shrimp' },
        { icon: 'fas fa-bread-slice', name: 'Bread' },
        { icon: 'fas fa-cheese', name: 'Cheese' },
        { icon: 'fas fa-egg', name: 'Egg' },
        { icon: 'fas fa-bacon', name: 'Bacon' },
        { icon: 'fas fa-drumstick-bite', name: 'Drumstick' },
        { icon: 'fas fa-hamburger', name: 'Burger' },
        { icon: 'fas fa-pizza-slice', name: 'Pizza' },
        { icon: 'fas fa-hotdog', name: 'Hot Dog' },
        { icon: 'fas fa-ice-cream', name: 'Ice Cream' },
        { icon: 'fas fa-cookie', name: 'Cookie' },
        { icon: 'fas fa-candy-cane', name: 'Candy' },
        { icon: 'fas fa-apple-alt', name: 'Apple' },
        { icon: 'fas fa-lemon', name: 'Lemon' },
        { icon: 'fas fa-pepper-hot', name: 'Pepper' },
        { icon: 'fas fa-carrot', name: 'Carrot' },
    ],
    'Beverages': [
        { icon: 'fas fa-wine-glass-alt', name: 'Wine' },
        { icon: 'fas fa-wine-bottle', name: 'Wine Bottle' },
        { icon: 'fas fa-beer', name: 'Beer' },
        { icon: 'fas fa-cocktail', name: 'Cocktail' },
        { icon: 'fas fa-glass-martini-alt', name: 'Martini' },
        { icon: 'fas fa-glass-whiskey', name: 'Whiskey' },
        { icon: 'fas fa-coffee', name: 'Coffee' },
        { icon: 'fas fa-mug-hot', name: 'Hot Drink' },
    ],
    'Kitchen & Restaurant': [
        { icon: 'fas fa-utensils', name: 'Utensils' },
        { icon: 'fas fa-concierge-bell', name: 'Service Bell' },
        { icon: 'fas fa-mortar-pestle', name: 'Mortar' },
        { icon: 'fas fa-blender', name: 'Blender' },
        { icon: 'fas fa-fire', name: 'Fire' },
        { icon: 'fas fa-seedling', name: 'Fresh' },
        { icon: 'fas fa-leaf', name: 'Leaf' },
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
            <input type="text" id="iconSearch" placeholder="Search icons..." class="icon-search">
        </div>
        <div class="icon-picker-categories">
            ${Object.entries(iconCategories).map(([category, icons]) => `
                <div class="icon-category">
                    <h3>${category}</h3>
                    <div class="icon-grid">
                        ${icons.map(icon => `
                            <div class="icon-option" data-icon="${icon.icon}" data-name="${icon.name.toLowerCase()}">
                                <i class="${icon.icon}"></i>
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

// Add styles for icon picker
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
    }
`;
document.head.appendChild(iconPickerStyles);

// Modify the category form function
function showCategoryForm(category = null) {
    const form = document.createElement('form');
    form.id = 'categoryForm';
    
    // Create a hidden input for storing the selected icon
    const iconInput = document.createElement('input');
    iconInput.type = 'hidden';
    iconInput.id = 'categoryIcon';
    iconInput.name = 'icon';
    iconInput.value = category ? category.icon : 'fas fa-utensils';

    // Create icon preview/selector button
    const iconPreview = document.createElement('div');
    iconPreview.id = 'selectedIconPreview';
    iconPreview.innerHTML = `
        <i class="${category ? category.icon : 'fas fa-utensils'}"></i>
        <span>Click to change icon</span>
    `;

    form.innerHTML = `
        <div class="form-group">
            <label>Icon:</label>
            ${iconPreview.outerHTML}
            ${iconInput.outerHTML}
        </div>
        <div class="form-group">
            <label>Name (English):</label>
            <input type="text" name="name_en" value="${category ? category.name.en : ''}" required>
        </div>
        <div class="form-group">
            <label>Name (Italian):</label>
            <input type="text" name="name_it" value="${category ? category.name.it : ''}" required>
        </div>
        <div class="form-group">
            <label>Name (Albanian):</label>
            <input type="text" name="name_sq" value="${category ? category.name.sq : ''}" required>
        </div>
        <button type="submit">${category ? 'Update' : 'Add'} Category</button>
    `;

    // Icon search functionality
    function setupIconSearch() {
        const searchInput = document.getElementById('iconSearch');
        const iconOptions = document.querySelectorAll('.icon-option');

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            iconOptions.forEach(option => {
                const iconName = option.dataset.name;
                option.style.display = iconName.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }

    // Show modal when clicking icon preview
    document.body.addEventListener('click', function(e) {
        if (e.target.closest('#selectedIconPreview')) {
            iconPickerModal.style.display = 'block';
            setupIconSearch();
        }
    });

    // Handle icon selection
    iconPickerModal.addEventListener('click', function(e) {
        const iconOption = e.target.closest('.icon-option');
        if (iconOption) {
            const selectedIcon = iconOption.dataset.icon;
            document.getElementById('categoryIcon').value = selectedIcon;
            document.querySelector('#selectedIconPreview i').className = selectedIcon;
            iconPickerModal.style.display = 'none';

            // Remove selection from all icons and add to selected
            document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
            iconOption.classList.add('selected');
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === iconPickerModal) {
            iconPickerModal.style.display = 'none';
        }
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        
        const categoryData = {
            id: category ? category.id : generateId(),
            icon: formData.get('icon'),
            name: {
                en: formData.get('name_en'),
                it: formData.get('name_it'),
                sq: formData.get('name_sq')
            }
        };

        if (category) {
            updateCategory(categoryData);
        } else {
            addCategory(categoryData);
        }

        closeModal();
    });

    showModal(form);
}

// ... rest of your existing code ... 