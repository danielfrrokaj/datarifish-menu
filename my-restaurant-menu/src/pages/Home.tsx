import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import card1 from "../assets/card1.jpg";
import card2 from "../assets/card2.jpg";
import card3 from "../assets/card3.jpg";
import { useState } from "react";

const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLanguageSelect = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLanguageModal(false);
    navigate("/menu");
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>{t("welcome")}</h1>
          <h2>{t("slogan")}</h2>
          <button className="hero-btn" onClick={() => setShowLanguageModal(true)}>
            {t("menu")}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="grid features-grid">
            <div className="feature-card">
              <img src={card1} alt="Fresh Seafood" />
              <h3>Fresh Seafood</h3>
              <p>
                Daily fresh catch from the Adriatic Sea, prepared with passion
                and expertise.
              </p>
            </div>
            <div className="feature-card">
              <img src={card2} alt="Traditional Recipes" />
              <h3>Traditional Recipes</h3>
              <p>
                Authentic recipes passed down through generations, with a modern
                twist.
              </p>
            </div>
            <div className="feature-card">
              <img src={card3} alt="Restauraunt" />
              <h3>Enjoy Local Albanian Environment</h3>
              <p>
                Our Restauraunt offers a unique experience, where you can enjoy
                traditional Albanian cuisine in a cozy and welcoming atmosphere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-us-section home-about-us">
        <div className="container">
          <h2>{t('about_us_title', 'About Us')}</h2>
          <p>
            {t('about_us_para1', 'Our menu is updated in real-time, almost every day, based on what fresh ingredients we have in stock. We pride ourselves on serving the freshest catch.')}
          </p>
          <p>
            {t('about_us_para2', 'The fish we serve is sustainably sourced, fished from the Ionian and Adriatic seas by dedicated local fishermen, ensuring quality and supporting our community.')}
          </p>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="home-image-gallery">
        <div className="container">
          <img 
            src="https://media.istockphoto.com/id/454307021/photo/fishing.jpg?s=612x612&w=0&k=20&c=_ySgI980LovX9D3TGx-gYjRo_Dt6pPABgGnyGjQWE0Q=" 
            alt={t('fishing_image_alt_1', 'Fishing gear on a boat')} 
            className="gallery-image"
          />
          <img 
            src="https://media.istockphoto.com/id/1137792584/photo/small-fishing-boat-on-the-sea.jpg?s=612x612&w=0&k=20&c=i9E26DdHFqyx_BupzAveh5BV4rdLSCVj2vUmIjswTUo=" 
            alt={t('fishing_image_alt_2', 'Small fishing boat on the sea')} 
            className="gallery-image"
          />
        </div>
      </section>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="language-modal-backdrop">
          <div className="language-modal-content">
            <h3>{t('select_language', 'Select Language')}</h3>
            <button onClick={() => handleLanguageSelect('al')}>🇦🇱 {t('language_al', 'Shqip')}</button>
            <button onClick={() => handleLanguageSelect('en')}>🇬🇧 {t('language_en', 'English')}</button>
            <button onClick={() => handleLanguageSelect('it')}>🇮🇹 {t('language_it', 'Italiano')}</button>
            <button className="cancel-btn" onClick={() => setShowLanguageModal(false)}>{t('cancel', 'Cancel')}</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
