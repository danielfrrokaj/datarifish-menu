import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category, CategoryTranslation, MenuItemType, MenuItemTranslation, Language } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { FaTrash, FaPencilAlt, FaArrowUp, FaArrowDown, FaListAlt, FaUtensils, FaStar } from 'react-icons/fa';
import EditMenuItemForm from '../components/EditMenuItemForm';
import EditCategoryForm from '../components/EditCategoryForm';
import '../styles/Admin.css';

// Define the type for ServiceRating
interface ServiceRating {
  id: string;
  waiter_rating: number;
  food_rating: number;
  comments: string | null;
  created_at: string;
}

type AdminSection = 'categories' | 'items' | 'ratings'; // Type for active section

const Admin = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<(Category & { translations: CategoryTranslation[] })[]>([]);
  const [menuItems, setMenuItems] = useState<(MenuItemType & { translations: MenuItemTranslation[] })[]>([]);
  const [serviceRatings, setServiceRatings] = useState<ServiceRating[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [activeAdminSection, setActiveAdminSection] = useState<AdminSection>('categories'); // New state for active section

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
    fetchServiceRatings();
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

  const fetchServiceRatings = async () => {
    const { data, error } = await supabase
      .from('service_ratings')
      .select('id, waiter_rating, food_rating, comments, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching service ratings:', error);
      return;
    }
    setServiceRatings(data || []);
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
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) console.error('Error deleting menu item:', error);
    else fetchMenuItems();
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error('Error deleting category:', error);
    else fetchCategories();
  };

  const handleEditCategory = (id: string) => setEditingCategoryId(id);
  const handleCloseEditCategory = () => setEditingCategoryId(null);
  const handleSaveEditCategory = () => {
    fetchCategories();
    setEditingCategoryId(null);
  };

  const handleEditMenuItem = (id: string) => setEditingItemId(id);
  const handleCloseEdit = () => setEditingItemId(null);
  const handleSaveEdit = () => {
    fetchMenuItems();
    setEditingItemId(null);
  };

  const getTranslation = (
    translations: CategoryTranslation[] | MenuItemTranslation[] | undefined,
    field: 'name' | 'description' = 'name',
    preferredLangOverride?: string, 
    fallbackLang1: string = 'en',
    fallbackLang2: string = 'it'
  ): string | undefined => {
    if (!translations || translations.length === 0) return undefined;
    const langOrder = Array.from(new Set([preferredLangOverride, i18n.language, 'al', fallbackLang1, fallbackLang2].filter(Boolean) as string[]));
    for (const lang of langOrder) {
      const translation = translations.find(t => t.language === lang);
      if (translation) {
        if (field === 'description' && 'description' in translation) return translation.description ?? undefined;
        if (field === 'name' && 'name' in translation) return translation.name ?? undefined;
      }
    }
    const firstAvailable = translations[0];
    if (firstAvailable) {
        if (field === 'description' && 'description' in firstAvailable) return firstAvailable.description ?? undefined;
        if (field === 'name' && 'name' in firstAvailable) return firstAvailable.name ?? undefined;
    }
    return undefined;
  };

  const handleToggleAvailability = async (itemId: string, currentAvailability: boolean) => {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ availability: !currentAvailability })
      .eq('id', itemId)
      .select()
      .single();
    if (error) console.error('Error toggling availability:', error);
    if (data) setMenuItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, availability: data.availability } : item));
  };

  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (currentIndex === -1) return;
    const currentCategory = categories[currentIndex];
    let targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const targetCategory = categories[targetIndex];
    if (!currentCategory || !targetCategory) return;
    const updates = [
      supabase.from('categories').update({ order_index: targetCategory.order_index }).eq('id', currentCategory.id),
      supabase.from('categories').update({ order_index: currentCategory.order_index }).eq('id', targetCategory.id)
    ];
    const results = await Promise.all(updates);
    const errors = results.map(res => res.error).filter(Boolean);
    if (errors.length > 0) errors.forEach(err => console.error('Error moving category:', err));
    else fetchCategories();
  };

  const filteredAndSearchedMenuItems = menuItems.filter(item => {
    if (selectedCategoryFilter && item.category_id !== selectedCategoryFilter) return false;
    if (searchTerm.trim() === '') return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = item.translations.some(trans => trans.name?.toLowerCase().includes(term));
    if (nameMatch) return true;
    const descriptionMatch = item.translations.some(trans => trans.description?.toLowerCase().includes(term));
    if (descriptionMatch) return true;
    const category = categories.find(cat => cat.id === item.category_id);
    if (category) {
        const categoryName = getTranslation(category.translations, 'name', i18n.language); 
        if (categoryName?.toLowerCase().includes(term)) return true;
    }
    return false;
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    let langForDate = i18n.language;
    try { new Date().toLocaleDateString(langForDate); } catch (e) { langForDate = 'default'; }
    return new Date(dateString).toLocaleDateString(langForDate, options);
  };

  return (
    <div className="admin-panel-layout">
      <div className="admin-sidebar">
        <button
          className={`admin-nav-link ${activeAdminSection === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveAdminSection('categories')}
        >
          <FaListAlt /> {t('categories')}
        </button>
        <button
          className={`admin-nav-link ${activeAdminSection === 'items' ? 'active' : ''}`}
          onClick={() => setActiveAdminSection('items')}
        >
          <FaUtensils /> {t('items')}
        </button>
        <button
          className={`admin-nav-link ${activeAdminSection === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveAdminSection('ratings')}
        >
          <FaStar /> {t('service_ratings_title', 'Service Ratings')}
        </button>
      </div>

      <div className="admin-content">
        {activeAdminSection === 'categories' && (
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
        )}

        {activeAdminSection === 'items' && (
          <section className="section">
            <div className="section-header">
              <h2>{t('items')}</h2>
              <button className="btn btn-primary" onClick={() => setIsAddingItem(true)}>
                {t('add')}
              </button>
            </div>
            <>
              <div className="controls-container" style={{ marginBottom: '20px', marginTop: '10px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder={t('search_items_categories', 'Search items by name, description, category...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '10px', flexGrow: 1, backgroundColor: '#2d3748', color: '#f7fafc', border: '1px solid #4a5568', borderRadius: 'var(--border-radius-small)' }}
                />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  style={{ padding: '10px', backgroundColor: '#2d3748', color: '#f7fafc', border: '1px solid #4a5568', borderRadius: 'var(--border-radius-small)' }}
                >
                  <option value="">{t('all_categories', 'All Categories')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {getTranslation(category.translations, 'name', i18n.language) || category.id}
                    </option>
                  ))}
                </select>
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
                  {filteredAndSearchedMenuItems.map((item) => (
                    <tr key={item.id}>
                      <td>{getTranslation(item.translations, 'name', i18n.language) || 'N/A'}</td>
                      <td>
                        {getTranslation(categories.find(c => c.id === item.category_id)?.translations || [], 'name', i18n.language) || 'N/A'}
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
            </>
          </section>
        )}

        {activeAdminSection === 'ratings' && (
          <section className="section">
            <div className="section-header">
              <h2>{t('service_ratings_title', 'Service Ratings')}</h2>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>{t('rating_date', 'Date')}</th>
                  <th>{t('waiter_rating', 'Waiter Rating')}</th>
                  <th>{t('food_rating', 'Food Rating')}</th>
                  <th>{t('comments', 'Comments')}</th>
                </tr>
              </thead>
              <tbody>
                {serviceRatings.length > 0 ? (
                  serviceRatings.map((rating) => (
                    <tr key={rating.id}>
                      <td>{formatDate(rating.created_at)}</td>
                      <td>{'⭐'.repeat(rating.waiter_rating)} ({rating.waiter_rating}/5)</td>
                      <td>{'⭐'.repeat(rating.food_rating)} ({rating.food_rating}/5)</td>
                      <td>{rating.comments || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>{t('no_ratings_yet', 'No ratings submitted yet.')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* Add Category Dialog (controlled by isAddingCategory state) */}
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

        {/* Edit Menu Item Form (Dialog) */}
        {editingItemId && (
          <EditMenuItemForm
            itemId={editingItemId}
            onClose={handleCloseEdit}
            onSave={handleSaveEdit}
          />
        )}

        {/* Edit Category Form (Dialog) - Handles both Add (new) and Edit */}
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