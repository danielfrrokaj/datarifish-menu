// Functions to handle menu category interactions
function showCategory(categoryId) {
    // Hide the categories view
    document.getElementById('categoriesView').style.display = 'none';
    // Show the menu sections
    document.getElementById('menuSections').style.display = 'block';
    
    // Hide all sections first
    const sections = document.querySelectorAll('.menu-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show the selected category
    document.getElementById(categoryId).style.display = 'block';
}

function showCategories() {
    // Show the categories view
    document.getElementById('categoriesView').style.display = 'block';
    // Hide the menu sections
    document.getElementById('menuSections').style.display = 'none';
}

// Initialize the menu view
document.addEventListener('DOMContentLoaded', () => {
    showCategories();
}); 