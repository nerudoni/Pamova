// Navbar.tsx
import React, { useState } from "react";
import styles from "./Navbar.module.css";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Backdrop for mobile menu when open */}
      {isMenuOpen && (
        <div className={styles.backdrop} onClick={toggleMenu}></div>
      )}

      {/* Navigation bar */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          {/* Logo */}
          <div className={styles.logo}>
            <a href="/">Pamova</a>
          </div>

          {/* Navigation items - visible on desktop */}
          <ul
            className={`${styles.navMenu} ${isMenuOpen ? styles.active : ""}`}
          >
            <li className={styles.navItem}>
              <a
                href="/"
                className={styles.navLink}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
            </li>
            <li className={styles.navItem}>
              <a
                href="/about"
                className={styles.navLink}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
            </li>
            <li className={styles.navItem}>
              <a
                href="/projects"
                className={styles.navLink}
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </a>
            </li>
            <li className={styles.navItem}>
              <a
                href="/contact"
                className={styles.navLink}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
            </li>
            <li className={styles.navItem}>
              <a
                href="/login"
                className={styles.loginBtn}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </a>
            </li>
          </ul>

          {/* Hamburger menu - visible on mobile */}
          <div
            className={`${styles.hamburger} ${isMenuOpen ? styles.active : ""}`}
            onClick={toggleMenu}
          >
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
