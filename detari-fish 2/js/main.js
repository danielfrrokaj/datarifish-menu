document.addEventListener('DOMContentLoaded', () => {
    // Get the selected language from localStorage or default to English
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';
    
    // Update the page content with the selected language
    updateContent(currentLang);
    
    // Add smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

function switchLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    updateContent(lang);
}

function updateContent(lang) {
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update the HTML lang attribute
    document.documentElement.lang = lang;
} 