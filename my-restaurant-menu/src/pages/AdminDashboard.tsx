import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
              <button className="add-button">Add Category</button>
            </div>
            <div className="categories-list">
              {categories.map(category => (
                <div key={category.id} className="category-card">
                  <div className="category-translations">
                    {category.translations.map(translation => (
                      <div key={translation.language} className="translation">
                        <span className="language">{translation.language}:</span>
                        <span className="name">{translation.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="category-actions">
                    <button className="edit-button">Edit</button>
                    <button className="delete-button">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="menu-items-section">
            <div className="section-header">
              <h2>Menu Items</h2>
              <button className="add-button">Add Menu Item</button>
            </div>
            <div className="menu-items-list">
              {menuItems.map(item => (
                <div key={item.id} className="menu-item-card">
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="item-image" />
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
                    <div className="item-price">€{item.price.toFixed(2)}</div>
                  </div>
                  <div className="item-actions">
                    <button className="edit-button">Edit</button>
                    <button className="delete-button">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 