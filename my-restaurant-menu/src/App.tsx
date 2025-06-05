import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FaHome, FaUtensils, FaBars, FaTimes } from "react-icons/fa";
import { IoLanguage } from "react-icons/io5";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import RatingPage from "./pages/Rating";
import "./styles/global.css";

const App = () => {
  const { t, i18n } = useTranslation();
  const languages = ["en", "al", "it"];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsMenuOpen(false);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <nav className="navbar">
            <div className="container">
              {/* Left: Icon */}
              <Link to="/" className="nav-icon">
                <FaUtensils className="brand-icon" />
              </Link>

              {/* Center: Brand Name */}
              <div className="nav-brand">
                <Link to="/">
                  <span>Detari Fish</span>
                </Link>
              </div>

              {/* Right: Menu Button & Navigation */}
              <div className="nav-right">
                <button
                  className="mobile-menu-btn"
                  onClick={toggleMenu}
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
                <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>
                    <FaHome /> <span>{t("home")}</span>
                  </Link>
                  <Link to="/menu" onClick={() => setIsMenuOpen(false)}>
                    <FaUtensils /> <span>{t("menu")}</span>
                  </Link>
                  <div className="language-switcher">
                    <IoLanguage className="language-icon" />
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        className={`btn ${i18n.language === lang ? "btn-primary" : ""}`}
                        onClick={() => handleLanguageChange(lang)}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="/rating" element={<RatingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="footer">
            <div className="container">
              <div className="footer-content-compact">
                <div className="footer-left">
                  <FaUtensils style={{ marginRight: '8px' }} />
                  <span>Detari Fish © {new Date().getFullYear()}</span>
                </div>
                <div className="footer-right">
                  <Link to="/rating" className="footer-link-compact" onClick={() => setIsMenuOpen(false)}>
                    {t("rate_our_service", "Rate Service")}
                  </Link>
                  <select
                    value={i18n.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="footer-language-switcher-compact"
                  >
                    <option value="en">EN</option>
                    <option value="al">AL</option>
                    <option value="it">IT</option>
                  </select>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
