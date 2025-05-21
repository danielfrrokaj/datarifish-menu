import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>{t('welcome')}</h1>
          <h2>Experience the finest seafood in three languages</h2>
          <button 
            className="hero-btn"
            onClick={() => navigate('/menu')}
          >
            {t('menu')}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="grid features-grid">
            <div className="feature-card">
              <h3>Fresh Seafood</h3>
              <p>
                Daily fresh catch from the Adriatic Sea, prepared with passion and expertise.
              </p>
            </div>
            <div className="feature-card">
              <h3>Traditional Recipes</h3>
              <p>
                Authentic recipes passed down through generations, with a modern twist.
              </p>
            </div>
            <div className="feature-card">
              <h3>Multilingual Service</h3>
              <p>
                Enjoy our menu in English, Albanian, and Italian for your convenience.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 