import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Detari Fish',
      menu: 'Menu',
      admin: 'Admin',
      categories: 'Categories',
      items: 'Items',
      price: 'Price',
      description: 'Description',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      save: 'Save',
      cancel: 'Cancel',
      login: 'Login',
      logout: 'Logout',
      home: 'Home',
      back: 'Back',
    },
  },
  al: {
    translation: {
      welcome: 'Mirë se vini në Detari Fish',
      menu: 'Menu',
      admin: 'Admin',
      categories: 'Kategoritë',
      items: 'Artikujt',
      price: 'Çmimi',
      description: 'Përshkrimi',
      actions: 'Veprimet',
      edit: 'Ndrysho',
      delete: 'Fshi',
      add: 'Shto',
      save: 'Ruaj',
      cancel: 'Anulo',
      login: 'Hyr',
      logout: 'Dil',
      home: 'Ballina',
      back: 'Kthehu',
    },
  },
  it: {
    translation: {
      welcome: 'Benvenuti a Detari Fish',
      menu: 'Menu',
      admin: 'Admin',
      categories: 'Categorie',
      items: 'Articoli',
      price: 'Prezzo',
      description: 'Descrizione',
      actions: 'Azioni',
      edit: 'Modifica',
      delete: 'Elimina',
      add: 'Aggiungi',
      save: 'Salva',
      cancel: 'Annulla',
      login: 'Accedi',
      logout: 'Esci',
      home: 'Home',
      back: 'Indietro',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    debug: true,
  });

export default i18n; 