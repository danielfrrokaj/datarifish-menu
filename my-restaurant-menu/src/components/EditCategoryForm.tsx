import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaLanguage } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import '../styles/EditMenuItemForm.css'; // We'll reuse the same CSS

interface EditCategoryFormProps {
  categoryId: string | null;
  onClose: () => void;
  onSave: () => void;
}

interface Translation {
  language: string;
  name: string;
}

interface Category {
  id: string;
  translations: Translation[];
}

const SUPPORTED_LANGUAGES = ['en', 'al', 'it'];

const EditCategoryForm = ({ categoryId, onClose, onSave }: EditCategoryFormProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Category>({
    id: '',
    translations: SUPPORTED_LANGUAGES.map(lang => ({
      language: lang,
      name: ''
    }))
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    } else {
      setLoading(false);
    }
  }, [categoryId]);

  const fetchCategoryData = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;

      const { data: translationsData, error: translationsError } = await supabase
        .from('category_translations')
        .select('*')
        .eq('category_id', categoryId);

      if (translationsError) throw translationsError;

      // Merge existing translations with supported languages
      const translations = SUPPORTED_LANGUAGES.map(lang => {
        const existing = translationsData?.find(t => t.language === lang);
        return {
          language: lang,
          name: existing?.name || ''
        };
      });

      setFormData({
        id: categoryData.id,
        translations
      });
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // For a new category, create it first
      if (!categoryId) {
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert([{}])
          .select('id')
          .single();

        if (categoryError) throw categoryError;
        
        formData.id = newCategory.id;
      }

      // Update translations
      for (const translation of formData.translations) {
        if (!translation.name.trim()) continue; // Skip empty translations
        
        const { error: translationError } = await supabase
          .from('category_translations')
          .upsert({
            category_id: formData.id,
            language: translation.language,
            name: translation.name
          }, {
            onConflict: 'category_id,language'
          });

        if (translationError) throw translationError;
      }

      onSave();
    } catch (err) {
      console.error('Error saving category:', err);
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
          {categoryId ? 'Edit Category' : 'Add Category'}
        </h2>

        {error && (
          <div className="edit-form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-form">
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
                  required={index === 0} // At least one translation is required
                />
              </div>
            ))}
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

export default EditCategoryForm; 