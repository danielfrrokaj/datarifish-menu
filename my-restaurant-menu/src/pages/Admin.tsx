import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category, CategoryTranslation, MenuItemType, MenuItemTranslation, Language } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { FaTrash, FaPencilAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import EditMenuItemForm from '../components/EditMenuItemForm';
import EditCategoryForm from '../components/EditCategoryForm';
import '../styles/Admin.css';

const Admin = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<(Category & { translations: CategoryTranslation[] })[]>([]);
  const [menuItems, setMenuItems] = useState<(MenuItemType & { translations: MenuItemTranslation[] })[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    category_id: '',
    price: '',
    image_url: '',
    availability: true,
    translations: {
      en: { name: '', description: '' },
      al: { name: '', description: '' },
      it: { name: '', description: '' },
    },
  });
  const [newCategory, setNewCategory] = useState({
    image_url: '',
    order_index: 0,
    translations: {
      en: { name: '' },
      al: { name: '' },
      it: { name: '' },
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        created_at,
        updated_at,
        image_url,
        order_index,
        translations:category_translations (
          id,
          category_id,
          language,
          name
        )
      `)
      .order('order_index', { ascending: true, nullsFirst: false });
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    const sortedData = (data || []).sort((a, b) => {
        const orderA = a.order_index === null || a.order_index === undefined ? Infinity : a.order_index;
        const orderB = b.order_index === null || b.order_index === undefined ? Infinity : b.order_index;
        return orderA - orderB;
    });
    setCategories(sortedData);
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        category_id,
        price,
        image_url,
        availability,
        created_at,
        updated_at,
        translations:menu_item_translations (
          id,
          menu_item_id,
          language,
          name,
          description
        )
      `);
    
    if (error) {
      console.error('Error fetching menu items:', error);
      return;
    }
    setMenuItems(data || []);
  };

  const handleAddCategory = async () => {
    const nextOrderIndex = categories.length > 0 
      ? Math.max(...categories.map(c => c.order_index || 0)) + 1 
      : 0;

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert([{ 
        image_url: newCategory.image_url || null,
        order_index: nextOrderIndex
      }])
      .select()
      .single();

    if (categoryError || !category) {
      console.error('Error adding category:', categoryError);
      return;
    }

    const translations = Object.entries(newCategory.translations).map(([lang, trans]) => ({
      category_id: category.id,
      language: lang as Language,
      name: trans.name,
    }));

    const { error: translationsError } = await supabase
      .from('category_translations')
      .insert(translations);

    if (translationsError) {
      console.error('Error adding category translations:', translationsError);
      return;
    }

    setIsAddingCategory(false);
    setNewCategory({
      image_url: '',
      order_index: 0,
      translations: {
        en: { name: '' },
        al: { name: '' },
        it: { name: '' },
      },
    });
    fetchCategories();
  };

  const handleAddMenuItem = async () => {
    if (!newItem.category_id) {
      console.error('Category is required');
      return;
    }

    const priceValue = newItem.price.trim() === '' ? null : parseFloat(newItem.price);

    const { data: menuItem, error: menuItemError } = await supabase
      .from('menu_items')
      .insert([{
        category_id: newItem.category_id,
        price: priceValue,
        image_url: newItem.image_url || null,
        availability: newItem.availability,
      }])
      .select()
      .single();

    if (menuItemError || !menuItem) {
      console.error('Error adding menu item:', menuItemError);
      return;
    }

    // Filter out empty translations
    const translations = Object.entries(newItem.translations)
      .filter(([_, trans]) => trans.name.trim() !== '')
      .map(([lang, trans]) => ({
        menu_item_id: menuItem.id,
        language: lang as Language,
        name: trans.name.trim(),
        description: trans.description?.trim() || null,
      }));

    if (translations.length === 0) {
      console.error('At least one translation is required');
      return;
    }

    const { error: translationsError } = await supabase
      .from('menu_item_translations')
      .insert(translations);

    if (translationsError) {
      console.error('Error adding menu item translations:', translationsError);
      // Clean up the menu item if translations fail
      await supabase.from('menu_items').delete().eq('id', menuItem.id);
      return;
    }

    setIsAddingItem(false);
    setNewItem({
      category_id: '',
      price: '',
      image_url: '',
      availability: true,
      translations: {
        en: { name: '', description: '' },
        al: { name: '', description: '' },
        it: { name: '', description: '' },
      },
    });
    fetchMenuItems();
  };

  const handleDeleteMenuItem = async (id: string) => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting menu item:', error);
      return;
    }

    fetchMenuItems();
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return;
    }

    fetchCategories();
  };

  const handleEditCategory = (id: string) => {
    setEditingCategoryId(id);
  };

  const handleCloseEditCategory = () => {
    setEditingCategoryId(null);
  };

  const handleSaveEditCategory = () => {
    fetchCategories();
    setEditingCategoryId(null);
  };

  const handleEditMenuItem = (id: string) => {
    setEditingItemId(id);
  };

  const handleCloseEdit = () => {
    setEditingItemId(null);
  };

  const handleSaveEdit = () => {
    fetchMenuItems();
    setEditingItemId(null);
  };

  const getTranslation = (translations: any[], field: string = 'name', preferredLang: string = 'al', fallbackLang1: string = 'en') => {
    if (!translations || translations.length === 0) return '';
    let translation = translations.find(t => t.language === preferredLang);
    if (!translation || !translation[field]) {
      translation = translations.find(t => t.language === fallbackLang1);
    }
    if (!translation || !translation[field]) {
      translation = translations.find(t => t.language === i18n.language);
    }
    if (!translation || !translation[field]) {
      translation = translations[0];
    }
    return translation ? translation[field] : '';
  };

  const handleToggleAvailability = async (itemId: string, currentAvailability: boolean) => {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ availability: !currentAvailability })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling availability:', error);
      // Potentially set an error state to show in UI
      return;
    }

    if (data) {
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, availability: data.availability } : item
        )
      );
    }
  };

  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (currentIndex === -1) return;

    const currentCategory = categories[currentIndex];
    let targetIndex = -1;

    if (direction === 'up') {
      if (currentIndex === 0) return; // Already at the top
      targetIndex = currentIndex - 1;
    } else {
      if (currentIndex === categories.length - 1) return; // Already at the bottom
      targetIndex = currentIndex + 1;
    }

    const targetCategory = categories[targetIndex];

    if (!currentCategory || !targetCategory) return;

    // Swap order_index values
    const updates = [
      supabase.from('categories').update({ order_index: targetCategory.order_index }).eq('id', currentCategory.id),
      supabase.from('categories').update({ order_index: currentCategory.order_index }).eq('id', targetCategory.id)
    ];

    const results = await Promise.all(updates);
    const errors = results.map(res => res.error).filter(Boolean);

    if (errors.length > 0) {
      errors.forEach(err => console.error('Error moving category:', err));
    } else {
      fetchCategories(); // Re-fetch to update UI based on new order
    }
  };

  return (
    <div className="admin">
      <div className="container">
        <h1>{t('admin')}</h1>

        {/* Categories Section */}
        <section className="section">
          <div className="section-header">
            <h2>{t('categories')}</h2>
            <button className="btn btn-primary" onClick={() => setEditingCategoryId('new')}>
              {t('add')}
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name (EN)</th>
                <th>Name (AL)</th>
                <th>Name (IT)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id}>
                  {(['en', 'al', 'it'] as Language[]).map((lang) => (
                    <td key={lang}>
                      {category.translations.find(t => t.language === lang)?.name || ''}
                    </td>
                  ))}
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon move-btn"
                        onClick={() => handleMoveCategory(category.id, 'up')}
                        disabled={index === 0}
                        title={t('move_up', 'Move Up')}
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        className="btn-icon move-btn"
                        onClick={() => handleMoveCategory(category.id, 'down')}
                        disabled={index === categories.length - 1}
                        title={t('move_down', 'Move Down')}
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        className="btn-icon edit-btn"
                        onClick={() => handleEditCategory(category.id)}
                        title={t('edit')}
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        className="btn-icon delete-btn"
                        onClick={() => handleDeleteCategory(category.id)}
                        title={t('delete')}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Menu Items Section */}
        <section className="section">
          <div className="section-header">
            <h2>{t('items')}</h2>
            <button className="btn btn-primary" onClick={() => setIsAddingItem(true)}>
              {t('add')}
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.id}>
                  <td>{getTranslation(item.translations, 'name', 'al', 'en')}</td>
                  <td>
                    {getTranslation(categories.find(c => c.id === item.category_id)?.translations || [], 'name', 'al', 'en')}
                  </td>
                  <td>
                    {item.price !== null && item.price !== undefined 
                      ? `${item.price.toLocaleString('sq-AL')} ALL` 
                      : t('price_not_set', 'N/A')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={item.availability ? 'status-available' : 'status-unavailable'}>
                        {item.availability ? 'Available' : 'Unavailable'}
                      </span>
                      <label className="toggle-switch" title={item.availability ? 'Mark as Unavailable' : 'Mark as Available'}>
                        <input 
                          type="checkbox" 
                          checked={item.availability}
                          onChange={() => handleToggleAvailability(item.id, item.availability)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit-btn"
                        onClick={() => handleEditMenuItem(item.id)}
                        title={t('edit')}
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        className="btn-icon delete-btn"
                        onClick={() => handleDeleteMenuItem(item.id)}
                        title={t('delete')}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Add Category Dialog */}
        {isAddingCategory && (
          <div className="dialog">
            <div className="dialog-content">
              <div className="dialog-header">
                <h2 className="dialog-title">{t('add')} {t('categories')}</h2>
              </div>
              <div className="form-grid">
                <div>
                  <label htmlFor="category-image-url">{t('category_image_url', 'Image URL')}</label>
                  <input
                    id="category-image-url"
                    className="form-control"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={newCategory.image_url}
                    onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })}
                  />
                </div>
                {(['en', 'al', 'it'] as Language[]).map((lang) => (
                  <div key={lang}>
                    <label htmlFor={`category-name-${lang}`}>Name ({lang.toUpperCase()})</label>
                    <input
                      id={`category-name-${lang}`}
                      className="form-control"
                      type="text"
                      value={newCategory.translations[lang].name}
                      onChange={(e) => setNewCategory({
                        ...newCategory,
                        translations: {
                          ...newCategory.translations,
                          [lang]: { ...newCategory.translations[lang], name: e.target.value },
                        },
                      })}
                    />
                  </div>
                ))}
              </div>
              <div className="dialog-actions">
                <button className="btn" onClick={() => setIsAddingCategory(false)}>
                  {t('cancel')}
                </button>
                <button className="btn btn-primary" onClick={handleAddCategory}>
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Menu Item Dialog */}
        {isAddingItem && (
          <div className="dialog">
            <div 
              className="dialog-content" 
              style={{ backgroundColor: '#1a202c', color: '#f7fafc' }}
            >
              <div className="dialog-header">
                <h2 className="dialog-title">{t('add')} {t('items')}</h2>
              </div>
              <div className="form-grid">
                <div>
                  <label htmlFor="category">{t('categories')}</label>
                  <select
                    id="category"
                    className="form-control"
                    value={newItem.category_id}
                    onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
                    required
                  >
                    <option value="">{t('select_category', 'Select a category')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {getTranslation(category.translations)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="price">{t('price')} (ALL)</label>
                  <input
                    id="price"
                    className="form-control"
                    type="number"
                    min="100"
                    max="10000"
                    step="10"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="image">{t('image')} URL</label>
                  <input
                    id="image"
                    className="form-control"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={newItem.image_url}
                    onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="item-availability">{t('availability', 'Availability')}</label>
                  <label className="toggle-switch" title={newItem.availability ? 'Set as Unavailable' : 'Set as Available'} style={{ marginTop: '8px' }}>
                    <input
                      id="item-availability"
                      type="checkbox"
                      checked={newItem.availability}
                      onChange={(e) => setNewItem({ ...newItem, availability: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {(['en', 'al', 'it'] as Language[]).map((lang) => (
                  <div key={lang} className="language-input-group">
                    <h3 className="language-group-title">{t(`language_${lang}_translation`, `Translation (${lang.toUpperCase()})`)}</h3>
                    <div className="form-group">
                      <label htmlFor={`name-${lang}`}>Name</label>
                      <input
                        id={`name-${lang}`}
                        className="form-control"
                        type="text"
                        value={newItem.translations[lang].name}
                        onChange={(e) => setNewItem({
                          ...newItem,
                          translations: {
                            ...newItem.translations,
                            [lang]: { ...newItem.translations[lang], name: e.target.value },
                          },
                        })}
                        style={{ 
                          backgroundColor: 'var(--dark-input-bg, #2d3748)', 
                          color: 'var(--dark-text, #f7fafc)',
                          borderColor: 'var(--dark-border, #4a5568)'
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`description-${lang}`}>Description</label>
                      <textarea
                        id={`description-${lang}`}
                        className="form-control"
                        rows={2}
                        value={newItem.translations[lang].description}
                        onChange={(e) => setNewItem({
                          ...newItem,
                          translations: {
                            ...newItem.translations,
                            [lang]: { ...newItem.translations[lang], description: e.target.value },
                          },
                        })}
                        style={{ 
                          backgroundColor: 'var(--dark-input-bg, #2d3748)', 
                          color: 'var(--dark-text, #f7fafc)',
                          borderColor: 'var(--dark-border, #4a5568)' 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="dialog-actions">
                <button 
                  className="btn" 
                  onClick={() => setIsAddingItem(false)}
                  style={{
                    backgroundColor: 'var(--dark-input-bg, #2d3748)',
                    color: 'var(--dark-text, #f7fafc)',
                    borderColor: 'var(--dark-border, #4a5568)'
                  }}
                >
                  {t('cancel')}
                </button>
                <button className="btn btn-primary" onClick={handleAddMenuItem}>
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Menu Item Form */}
        {editingItemId && (
          <EditMenuItemForm
            itemId={editingItemId}
            onClose={handleCloseEdit}
            onSave={handleSaveEdit}
          />
        )}

        {/* Edit Category Form */}
        {editingCategoryId && (
          <EditCategoryForm
            categoryId={editingCategoryId === 'new' ? null : editingCategoryId}
            onClose={handleCloseEditCategory}
            onSave={handleSaveEditCategory}
          />
        )}
      </div>
    </div>
  );
};

export default Admin; 