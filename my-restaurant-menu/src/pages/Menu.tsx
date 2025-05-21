import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category, CategoryTranslation, MenuItemType, MenuItemTranslation } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import '../styles/Menu.css';

const Menu = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<(Category & { category_translations: CategoryTranslation[] })[]>([]);
  const [menuItems, setMenuItems] = useState<(MenuItemType & { menu_item_translations: MenuItemTranslation[] })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 48); // 48px is navbar height
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [i18n.language]);

  useEffect(() => {
    if (selectedCategory) {
      fetchMenuItems();
    }
  }, [selectedCategory, i18n.language]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*, category_translations(*)');

      if (categoriesError) {
        console.error('Error details:', categoriesError);
        setError(categoriesError.message);
        return;
      }

      if (!categoriesData) {
        console.log('No categories data received');
        setError('No categories found');
        return;
      }

      console.log('Categories fetched successfully:', categoriesData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error('Unexpected error during fetch:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const fetchMenuItems = async () => {
    if (!selectedCategory) return;

    try {
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('*, menu_item_translations(*)')
        .eq('category_id', selectedCategory);

      if (menuItemsError) {
        console.error('Error fetching menu items:', menuItemsError);
        setError(menuItemsError.message);
        return;
      }

      setMenuItems(menuItemsData || []);
      setError(null);
    } catch (err) {
      console.error('Unexpected error fetching menu items:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const getCategoryTranslation = (translations: CategoryTranslation[] | undefined) => {
    if (!translations || translations.length === 0) {
      console.warn('No category translations available');
      return '';
    }
    const translation = translations.find(t => t.language === i18n.language);
    if (!translation) {
      const fallback = translations.find(t => t.language === 'en') || translations[0];
      return fallback.name;
    }
    return translation.name;
  };

  const getMenuItemTranslation = (translations: MenuItemTranslation[] | undefined, field: 'name' | 'description' = 'name') => {
    if (!translations || translations.length === 0) {
      console.warn('No menu item translations available');
      return '';
    }
    const translation = translations.find(t => t.language === i18n.language);
    if (!translation) {
      const fallback = translations.find(t => t.language === 'en') || translations[0];
      return fallback[field] || '';
    }
    return translation[field] || '';
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Scroll to top of the page when changing categories
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setMenuItems([]);
    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (error) {
    return (
      <div className="menu">
        <div className="container">
          <h1>{t('menu')}</h1>
          <div className="error-message">
            Error loading menu: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="menu">
        <div className="menu-header">
          <h1>{t('menu')}</h1>
        </div>
        <div className="container">
          <div className="categories-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategorySelect(category.id)}
              >
                <h2 className="category-title">
                  {getCategoryTranslation(category.category_translations)}
                </h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu">
      <div className={`fixed-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="menu-header">
          <button className="back-button" onClick={handleBack}>
            ← {t('back')}
          </button>
          <div className="menu-header-content">
            <h1>
              {getCategoryTranslation(categories.find(c => c.id === selectedCategory)?.category_translations)}
            </h1>
          </div>
        </div>

        <div className="category-carousel">
          <div className="category-carousel-inner">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-pill ${category.id === selectedCategory ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                {getCategoryTranslation(category.category_translations)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="menu-content">
        <div className="container">
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div className="menu-item" key={item.id}>
                {item.image_url !== null && (
                  <img
                    className="menu-item-image"
                    src={item.image_url as string}
                    alt={getMenuItemTranslation(item.menu_item_translations)}
                  />
                )}
                <div className="menu-item-content">
                  <h3 className="menu-item-title">
                    {getMenuItemTranslation(item.menu_item_translations)}
                  </h3>
                  <p className="menu-item-description">
                    {getMenuItemTranslation(item.menu_item_translations, 'description')}
                  </p>
                  <p className="menu-item-price">
                    {item.price.toLocaleString('sq-AL')} ALL
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu; 