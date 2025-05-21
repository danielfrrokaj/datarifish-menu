import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaImage, FaLanguage, FaMoneyBillAlt, FaList } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import '../styles/EditMenuItemForm.css';

interface EditMenuItemFormProps {
  itemId: string | null;
  onClose: () => void;
  onSave: () => void;
}

interface Translation {
  language: string;
  name: string;
  description: string | null;
}

interface MenuItem {
  id: string;
  category_id: string;
  price: number;
  image_url: string | null;
  translations: Translation[];
}

const SUPPORTED_LANGUAGES = ['en', 'al', 'it'];

const EditMenuItemForm = ({ itemId, onClose, onSave }: EditMenuItemFormProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<MenuItem>({
    id: '',
    category_id: '',
    price: 0,
    image_url: null,
    translations: SUPPORTED_LANGUAGES.map(lang => ({
      language: lang,
      name: '',
      description: ''
    }))
  });

  useEffect(() => {
    if (itemId) {
      fetchItemData();
    }
    fetchCategories();
  }, [itemId]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*, category_translations(*)');
    
    if (error) {
      setError('Error fetching categories');
      return;
    }
    setCategories(data || []);
  };

  const fetchItemData = async () => {
    if (!itemId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: itemData, error: itemError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;

      const { data: translationsData, error: translationsError } = await supabase
        .from('menu_item_translations')
        .select('*')
        .eq('menu_item_id', itemId);

      if (translationsError) throw translationsError;

      // Merge existing translations with supported languages
      const translations = SUPPORTED_LANGUAGES.map(lang => {
        const existing = translationsData?.find(t => t.language === lang);
        return {
          language: lang,
          name: existing?.name || '',
          description: existing?.description || ''
        };
      });

      setFormData({
        id: itemData.id,
        category_id: itemData.category_id,
        price: itemData.price,
        image_url: itemData.image_url,
        translations
      });
    } catch (err) {
      console.error('Error fetching item data:', err);
      setError('Failed to load item data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Update menu item
      const { error: itemError } = await supabase
        .from('menu_items')
        .update({
          category_id: formData.category_id,
          price: formData.price,
          image_url: formData.image_url
        })
        .eq('id', formData.id);

      if (itemError) throw itemError;

      // Update translations
      for (const translation of formData.translations) {
        const { error: translationError } = await supabase
          .from('menu_item_translations')
          .upsert({
            menu_item_id: formData.id,
            language: translation.language,
            name: translation.name,
            description: translation.description
          }, {
            onConflict: 'menu_item_id,language'
          });

        if (translationError) throw translationError;
      }

      onSave();
    } catch (err) {
      console.error('Error saving item:', err);
      setError('Failed to save changes');
    }
  };

  if (loading) {
    return <div className="edit-form-loading">Loading...</div>;
  }

  return (
    <div className="edit-form-overlay">
      <div className="edit-form-container">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className="edit-form-title">
          {itemId ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>

        {error && (
          <div className="edit-form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-section">
            <div className="section-header">
              <FaList />
              <h3>Category</h3>
            </div>
            <select
              value={formData.category_id}
              onChange={e => setFormData(prev => ({
                ...prev,
                category_id: e.target.value
              }))}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.category_translations.find((t: any) => t.language === 'en')?.name || 
                   category.category_translations[0]?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <div className="section-header">
              <FaLanguage />
              <h3>Translations</h3>
            </div>
            {formData.translations.map((translation, index) => (
              <div key={translation.language} className="translation-inputs">
                <h4>{translation.language.toUpperCase()}</h4>
                <input
                  type="text"
                  placeholder="Name"
                  value={translation.name}
                  onChange={e => {
                    const newTranslations = [...formData.translations];
                    newTranslations[index] = {
                      ...translation,
                      name: e.target.value
                    };
                    setFormData(prev => ({
                      ...prev,
                      translations: newTranslations
                    }));
                  }}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={translation.description || ''}
                  onChange={e => {
                    const newTranslations = [...formData.translations];
                    newTranslations[index] = {
                      ...translation,
                      description: e.target.value
                    };
                    setFormData(prev => ({
                      ...prev,
                      translations: newTranslations
                    }));
                  }}
                />
              </div>
            ))}
          </div>

          <div className="form-section">
            <div className="section-header">
              <FaMoneyBillAlt />
              <h3>Price (ALL)</h3>
            </div>
            <input
              type="number"
              value={formData.price}
              onChange={e => setFormData(prev => ({
                ...prev,
                price: parseFloat(e.target.value)
              }))}
              min="100"
              max="10000"
              step="10"
              required
            />
          </div>

          <div className="form-section">
            <div className="section-header">
              <FaImage />
              <h3>Image</h3>
            </div>
            <div className="image-upload">
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Menu item"
                  className="preview-image"
                />
              )}
              <input
                type="text"
                placeholder="Enter image URL"
                value={formData.image_url || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  image_url: e.target.value
                }))}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              <FaTimes /> Cancel
            </button>
            <button type="submit" className="save-button">
              <FaSave /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuItemForm; 