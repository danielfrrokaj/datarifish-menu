import { TableFooter } from "@mui/material";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Detari Fish",
      slogan: "A restaurant that offers everything, quality and service",
      menu: "Menu",
      admin: "Admin",
      categories: "Categories",
      items: "Items",
      price: "Price",
      description: "Description",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      add: "Add",
      save: "Save",
      cancel: "Cancel",
      login: "Login",
      logout: "Logout",
      home: "Home",
      back: "Back",
      footer: "Detari Fish - All Rights Reserved",
    },
  },
  al: {
    translation: {
      welcome: "Mirësevini në Detari Fish",
      slogan: "Një restorant që i ofron të gjitha, dashuri dhe kualitet",
      menu: "Menu",
      admin: "Admin",
      categories: "Kategoritë",
      items: "Artikujt",
      price: "Çmimi",
      description: "Përshkrimi",
      actions: "Veprimet",
      edit: "Ndrysho",
      delete: "Fshi",
      add: "Shto",
      save: "Ruaj",
      cancel: "Anulo",
      login: "Hyr",
      logout: "Dil",
      home: "Ballina",
      back: "Kthehu",
      footer: "Detari Fish - Të gjitha të drejtat e rezervuara",
    },
  },
  it: {
    translation: {
      welcome: "Benvenuti a Detari Fish",
      slogan: "Un restaurant that offers everything, quality and service",
      menu: "Menu",
      admin: "Admin",
      categories: "Categorie",
      items: "Articoli",
      price: "Prezzo",
      description: "Descrizione",
      actions: "Azioni",
      edit: "Modifica",
      delete: "Elimina",
      add: "Aggiungi",
      save: "Salva",
      cancel: "Annulla",
      login: "Accedi",
      logout: "Esci",
      home: "Home",
      back: "Indietro",
      footer: "Detari Fish - Tutti i diritti riservati",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  debug: true,
});

export default i18n;
