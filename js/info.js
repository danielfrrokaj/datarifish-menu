// Translations
const translations = {
    about_fresh: {
        en: 'Fresh Seafood',
        it: 'Pesce Fresco',
        sq: 'Peshk i Freskët'
    },
    about_fresh_desc: {
        en: 'We pride ourselves on serving the freshest seafood, caught daily from the pristine waters of the Mediterranean.',
        it: 'Siamo orgogliosi di servire il pesce più fresco, pescato quotidianamente dalle acque incontaminate del Mediterraneo.',
        sq: 'Ne krenohemi që shërbejmë peshkun më të freskët, të kapur çdo ditë nga ujërat e pastra të Mesdheut.'
    },
    about_cuisine: {
        en: 'Mediterranean Cuisine',
        it: 'Cucina Mediterranea',
        sq: 'Kuzhina Mesdhetare'
    },
    about_cuisine_desc: {
        en: 'Our chefs combine traditional Mediterranean recipes with modern culinary techniques to create unforgettable dishes.',
        it: 'I nostri chef combinano ricette tradizionali mediterranee con tecniche culinarie moderne per creare piatti indimenticabili.',
        sq: 'Kuzhinierët tanë kombinojnë recetat tradicionale mesdhetare me teknikat moderne të gatimit për të krijuar pjata të paharrueshme.'
    },
    about_experience: {
        en: 'Dining Experience',
        it: 'Esperienza Culinaria',
        sq: 'Eksperienca e Ngrënies'
    },
    about_experience_desc: {
        en: 'Enjoy your meal in our beautiful seaside restaurant with stunning views and warm, attentive service.',
        it: 'Goditi il tuo pasto nel nostro bellissimo ristorante sul mare con viste mozzafiato e un servizio caloroso e attento.',
        sq: 'Shijoni ushqimin tuaj në restorantin tonë të bukur buzë detit me pamje mahnitëse dhe shërbim të ngrohtë e të vëmendshëm.'
    },
    back_to_menu: {
        en: 'Back to Menu',
        it: 'Torna al Menu',
        sq: 'Kthehu te Menu'
    }
};

// Language settings
let currentLang = localStorage.getItem('language') || 'sq';
const langNames = { en: 'English', it: 'Italiano', sq: 'Shqip' };
const flagCodes = { en: 'gb', it: 'it', sq: 'al' };

// Update language display
function updateLanguageDisplay() {
    document.getElementById('currentLangFlag').className = `fi fi-${flagCodes[currentLang]}`;
    document.getElementById('currentLangText').textContent = langNames[currentLang];
}

// Update translations
function updateTranslations() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            element.innerHTML = translations[key][currentLang];
        }
    });
}

// Language switcher click handler
document.getElementById('currentLang').addEventListener('click', () => {
    const langs = ['sq', 'en', 'it'];
    const currentIndex = langs.indexOf(currentLang);
    currentLang = langs[(currentIndex + 1) % langs.length];
    localStorage.setItem('language', currentLang);
    updateLanguageDisplay();
    updateTranslations();
});

// Get language from URL parameter if present
function getLanguageFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && ['sq', 'en', 'it'].includes(langParam)) {
        currentLang = langParam;
        localStorage.setItem('language', currentLang);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    getLanguageFromUrl();
    updateLanguageDisplay();
    updateTranslations();
}); 