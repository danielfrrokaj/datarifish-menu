import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import card1 from "../assets/card1.jpg";
import card2 from "../assets/card2.jpg";
import card3 from "../assets/card3.jpg";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>{t("welcome")}</h1>
          <h2>{t("slogan")}</h2>
          <button className="hero-btn" onClick={() => navigate("/menu")}>
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
    </div>
  );
};

export default Home;
