import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category, CategoryTranslation, MenuItemType, MenuItemTranslation, Language } from '../lib/supabase';
import { supabase } from '../lib/supabase';
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
    translations: {
      en: { name: '', description: '' },
      al: { name: '', description: '' },
      it: { name: '', description: '' },
    },
  });
  const [newCategory, setNewCategory] = useState({
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
        translations:category_translations (
          id,
          category_id,
          language,
          name
        )
      `);
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    setCategories(data || []);
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        category_id,
        price,
        image_url,
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
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert([{}])
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
    fetchCategories();
  };

  const handleAddMenuItem = async () => {
    if (!newItem.category_id || !newItem.price) {
      console.error('Category and price are required');
      return;
    }

    const { data: menuItem, error: menuItemError } = await supabase
      .from('menu_items')
      .insert([{
        category_id: newItem.category_id,
        price: parseFloat(newItem.price),
        image_url: newItem.image_url || null,
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

  const getTranslation = (translations: any[], field: string = 'name') => {
    const translation = translations?.find(t => t.language === i18n.language);
    return translation ? translation[field] : translations?.[0]?.[field] || '';
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
              {categories.map((category) => (
                <tr key={category.id}>
                  {(['en', 'al', 'it'] as Language[]).map((lang) => (
                    <td key={lang}>
                      {category.translations.find(t => t.language === lang)?.name || ''}
                    </td>
                  ))}
                  <td>
                    <div className="action-buttons">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.id}>
                  <td>{getTranslation(item.translations)}</td>
                  <td>
                    {getTranslation(categories.find(c => c.id === item.category_id)?.translations || [])}
                  </td>
                  <td>{item.price.toLocaleString('sq-AL')} ALL</td>
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
            <div className="dialog-content">
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
                  >
                    <option value="">Select a category</option>
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
                {(['en', 'al', 'it'] as Language[]).map((lang) => (
                  <div key={lang} className="language-section">
                    <h3>Translation ({lang.toUpperCase()})</h3>
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
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="dialog-actions">
                <button className="btn" onClick={() => setIsAddingItem(false)}>
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