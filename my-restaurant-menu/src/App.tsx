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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="footer">
            <div className="container">
              <div className="footer-content">
                <div className="footer-brand">
                  <FaUtensils />
                  <span>Detari Fish</span>
                </div>
                <p className="footer-text">
                  <span>
                    Need a menu like{" "}
                    <a href="https://danielfrrokaj.com">this</a>?
                  </span>
                  <br />
                  {t("footer")} - {new Date().getFullYear()}
                </p>
                <div className="footer-links">
                  <select
                    value={i18n.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    style={{
                      color: "inherit",
                      minWidth: "60px",
                      fontSize: window.innerWidth < 600 ? "0.875rem" : "1rem",
                      border: "none",
                      background: "transparent",
                    }}
                  >
                    <option value="en">EN</option>
                    <option value="al">AL</option>
                    <option value="it">IT</option>
                  </select>
                </div>
                <p className="footerText"></p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
