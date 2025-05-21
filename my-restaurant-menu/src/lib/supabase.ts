import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wduulnxgdghldosxacol.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkdXVsbnhnZGdobGRvc3hhY29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzMzNzMsImV4cCI6MjA2MzM0OTM3M30._bQBUpKlPQlNWatt1I4cVzPL5oCq6e2QEpyssq2sO9k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key) => {
        try {
          return Promise.resolve(localStorage.getItem(key));
        } catch (e) {
          return Promise.resolve(null);
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (e) {
          return Promise.resolve();
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
          return Promise.resolve();
        } catch (e) {
          return Promise.resolve();
        }
      },
    },
  },
  db: {
    schema: 'public'
  }
});

export type Language = 'en' | 'al' | 'it';

export interface Category {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryTranslation {
  id: string;
  category_id: string;
  language: Language;
  name: string;
}

export interface MenuItemType {
  id: string;
  category_id: string;
  price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuItemTranslation {
  id: string;
  menu_item_id: string;
  language: Language;
  name: string;
  description: string | null;
} 