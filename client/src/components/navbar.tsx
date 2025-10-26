// Navbar.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Navbar.module.css";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Check login status
    axios
      .get("http://localhost:3000/check-login", { withCredentials: true })
      .then((res) => {
        setIsLoggedIn(res.data.loggedIn);
        if (res.data.loggedIn) {
          setCurrentUser(res.data.user);
        }
      })
      .catch(console.error);

    // Get current path
    setCurrentPath(window.location.pathname);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Check if we're on a public page
  const isPublicPage = [
    "/",
    "/about",
    "/projects",
    "/contact",
    "/login",
  ].includes(currentPath);

  // Check if we're on an employee-only page
  const isEmployeePage = ["/dashboard", "/manage", "/settings"].includes(
    currentPath
  );

  return (
    <>
      {/* Backdrop for mobile menu when open */}
      {isMenuOpen && (
        <div className={styles.backdrop} onClick={closeMenu}></div>
      )}

      {/* Navigation bar */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          {/* Logo - always goes to homepage */}
          <div className={styles.logo}>
            <a href="/" onClick={closeMenu}>
              Pamova
            </a>
          </div>

          {/* Navigation items - visible on desktop */}
          <ul
            className={`${styles.navMenu} ${isMenuOpen ? styles.active : ""}`}
          >
            {/* Public pages - shown when on public pages */}
            {isPublicPage && (
              <>
                <li className={styles.navItem}>
                  <a href="/" className={styles.navLink} onClick={closeMenu}>
                    Home
                  </a>
                </li>
                <li className={styles.navItem}>
                  <a
                    href="/about"
                    className={styles.navLink}
                    onClick={closeMenu}
                  >
                    About
                  </a>
                </li>
                <li className={styles.navItem}>
                  <a
                    href="/projects"
                    className={styles.navLink}
                    onClick={closeMenu}
                  >
                    Projects
                  </a>
                </li>
                <li className={styles.navItem}>
                  <a
                    href="/contact"
                    className={styles.navLink}
                    onClick={closeMenu}
                  >
                    Contact
                  </a>
                </li>
              </>
            )}

            {/* Employee-only pages - shown when on employee pages */}
            {isEmployeePage && (
              <>
                <li className={styles.navItem}>
                  <a
                    href="/dashboard"
                    className={styles.navLink}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </a>
                </li>
                <li className={styles.navItem}>
                  <a
                    href="/manage"
                    className={styles.navLink}
                    onClick={closeMenu}
                  >
                    Manage
                  </a>
                </li>
                <li className={styles.navItem}>
                  <a
                    href="/settings"
                    className={styles.navLink}
                    onClick={closeMenu}
                  >
                    Settings
                  </a>
                </li>
              </>
            )}

            {/* Auth button - changes based on login status and page */}
            <li className={styles.navItem}>
              {isLoggedIn ? (
                // Logged in
                isEmployeePage ? (
                  // On employee pages: Show Logout
                  <a
                    href="/logout"
                    className={styles.logoutBtn}
                    onClick={closeMenu}
                  >
                    Logout
                  </a>
                ) : (
                  // On public pages: Show Dashboard
                  <a
                    href="/dashboard"
                    className={styles.dashboardBtn}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </a>
                )
              ) : (
                // Not logged in: Show Login button
                <a
                  href="/login"
                  className={styles.loginBtn}
                  onClick={closeMenu}
                >
                  Login
                </a>
              )}
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
