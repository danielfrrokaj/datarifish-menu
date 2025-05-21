import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaTrash, FaPencilAlt, FaPlus } from 'react-icons/fa';
import EditMenuItemForm from '../components/EditMenuItemForm';
import '../styles/AdminDashboard.css';

interface Category {
  id: string;
  translations: {
    language: string;
    name: string;
  }[];
}

interface MenuItem {
  id: string;
  category_id: string;
  price: number;
  image_url: string | null;
  translations: {
    language: string;
    name: string;
    description: string | null;
  }[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Fetch categories and their translations
  const fetchCategories = async () => {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      setError('Error fetching categories');
      return;
    }

    const { data: translationsData, error: translationsError } = await supabase
      .from('category_translations')
      .select('*');

    if (translationsError) {
      setError('Error fetching category translations');
      return;
    }

    // Combine categories with their translations
    const categoriesWithTranslations = categoriesData.map(category => ({
      ...category,
      translations: translationsData
        .filter(t => t.category_id === category.id)
        .map(t => ({
          language: t.language,
          name: t.name
        }))
    }));

    setCategories(categoriesWithTranslations);
  };

  // Fetch menu items and their translations
  const fetchMenuItems = async () => {
    const { data: itemsData, error: itemsError } = await supabase
      .from('menu_items')
      .select('*');

    if (itemsError) {
      setError('Error fetching menu items');
      return;
    }

    const { data: translationsData, error: translationsError } = await supabase
      .from('menu_item_translations')
      .select('*');

    if (translationsError) {
      setError('Error fetching menu item translations');
      return;
    }

    // Combine items with their translations
    const itemsWithTranslations = itemsData.map(item => ({
      ...item,
      translations: translationsData
        .filter(t => t.menu_item_id === item.id)
        .map(t => ({
          language: t.language,
          name: t.name,
          description: t.description
        }))
    }));

    setMenuItems(itemsWithTranslations);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        await fetchCategories();
        await fetchMenuItems();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleEdit = (itemId: string) => {
    setEditingItemId(itemId);
  };

  const handleCloseEdit = () => {
    setEditingItemId(null);
  };

  const handleSaveEdit = () => {
    fetchMenuItems();
    setEditingItemId(null);
  };

  const handleAddNew = () => {
    setEditingItemId('new');
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      // First delete translations
      const { error: translationsError } = await supabase
        .from('menu_item_translations')
        .delete()
        .eq('menu_item_id', itemId);

      if (translationsError) {
        throw translationsError;
      }

      // Then delete the menu item
      const { error: itemError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (itemError) {
        throw itemError;
      }

      // Update local state
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
        </button>
      </header>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Menu Items
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="dashboard-content">
        {activeTab === 'categories' ? (
          <div className="categories-section">
            <div className="section-header">
              <h2>Categories</h2>
              <button className="add-button" /* onClick={() => handleAddCategory()} */ >
                <FaPlus /> Add Category
              </button>
            </div>
            <div className="categories-list">
              {categories.map(category => (
                <div key={category.id} className="category-card">
                  <div className="category-translations">
                    {category.translations.map(translation => (
                      <div key={translation.language} className="translation">
                        <span className="language">{translation.language.toUpperCase()}:</span>
                        <span className="name">{translation.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="category-actions">
                    <button 
                      className="edit-button icon-button" 
                      onClick={() => console.log('Edit category clicked:', category.id)} // Placeholder action
                      title="Edit category"
                    >
                      <FaPencilAlt />
                    </button>
                    <button 
                      className="delete-button icon-button" 
                      onClick={() => console.log('Delete category clicked:', category.id)} // Placeholder action
                      title="Delete category"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="menu-items-section">
            <div className="section-header">
              <h2>Menu Items</h2>
              <button className="add-button" onClick={handleAddNew}>
                <FaPlus /> Add Menu Item
              </button>
            </div>
            <div className="menu-items-list">
              {menuItems.map(item => (
                <div key={item.id} className="menu-item-card">
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.translations[0]?.name || ''} 
                      className="item-image" 
                    />
                  )}
                  <div className="item-details">
                    <div className="item-translations">
                      {item.translations.map(translation => (
                        <div key={translation.language} className="translation">
                          <span className="language">{translation.language}:</span>
                          <span className="name">{translation.name}</span>
                          {translation.description && (
                            <p className="description">{translation.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="item-price">
                      {item.price.toLocaleString('sq-AL')} ALL
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="edit-button icon-button"
                      onClick={() => handleEdit(item.id)}
                      title="Edit item"
                    >
                      <FaPencilAlt />
                    </button>
                    <button 
                      className="delete-button icon-button"
                      onClick={() => handleDelete(item.id)}
                      title="Delete item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editingItemId && (
        <EditMenuItemForm
          itemId={editingItemId === 'new' ? null : editingItemId}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 