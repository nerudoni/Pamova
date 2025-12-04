// src/pages/Home.tsx
import React from "react";
import styles from "./Home.module.css";

const Home: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span>EST. 2013</span>
          </div>
          <h1 className={styles.heroTitle}>
            Industrial Excellence
            <span className={styles.heroAccent}>Built With Precision</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Premium fuel infrastructure and specialized industrial construction
            for Africa's leading energy companies. Uncompromising quality since
            2013.
          </p>
          <div className={styles.heroButtons}>
            <a href="/projects" className={styles.primaryBtn}>
              Our Projects
            </a>
            <a href="/contact" className={styles.secondaryBtn}>
              Inquire
            </a>
          </div>
        </div>
        <div className={styles.scrollIndicator}>
          <span>Scroll</span>
          <div className={styles.scrollLine}></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50+</div>
              <div className={styles.statLabel}>Fuel Installations</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>11+</div>
              <div className={styles.statLabel}>Years Experience</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>2M+</div>
              <div className={styles.statLabel}>Liters Storage Built</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>40+</div>
              <div className={styles.statLabel}>Expert Engineers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className={styles.services}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Specializations</h2>
            <p className={styles.sectionSubtitle}>
              Highly specialized construction services for critical
              infrastructure
            </p>
          </div>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>⛽</div>
              <h3>Fuel Storage Tanks</h3>
              <p>
                Massive-scale fuel storage solutions with advanced safety
                systems and precision engineering.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🏗️</div>
              <h3>Filling Stations</h3>
              <p>
                Premium fuel stations with integrated retail spaces and advanced
                distribution systems.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🏭</div>
              <h3>Industrial Facilities</h3>
              <p>
                Specialized warehouses, processing plants, and industrial
                complexes built to exacting standards.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>💧</div>
              <h3>Water Infrastructure</h3>
              <p>
                Large-scale water storage and distribution systems for
                industrial and municipal use.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🏢</div>
              <h3>Commercial Construction</h3>
              <p>
                Office complexes, residential flats, and commercial spaces with
                luxury finishes.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🔧</div>
              <h3>Specialized Projects</h3>
              <p>
                Custom engineering solutions for unique industrial and
                infrastructure challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Differentiators */}
      <section className={styles.premium}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Company Standard</h2>
            <p className={styles.sectionSubtitle}>
              Why leading energy companies choose us for their most critical
              infrastructure
            </p>
          </div>
          <div className={styles.premiumGrid}>
            <div className={styles.premiumItem}>
              <h3>Elite Engineering</h3>
              <p>
                Our diverse team of specialized engineers brings international
                standards to every project, ensuring structural integrity and
                long-term reliability.
              </p>
            </div>
            <div className={styles.premiumItem}>
              <h3>Absolute Precision</h3>
              <p>
                Fuel infrastructure demands zero tolerance for error. We deliver
                millimeter-perfect installations with comprehensive quality
                assurance.
              </p>
            </div>
            <div className={styles.premiumItem}>
              <h3>Premium Materials</h3>
              <p>
                We source only the highest-grade materials and components,
                ensuring durability and performance in Africa's challenging
                environments.
              </p>
            </div>
            <div className={styles.premiumItem}>
              <h3>Confidential Service</h3>
              <p>
                Discretion and professionalism for clients who value privacy and
                exclusive partnership in their strategic infrastructure
                development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className={styles.projects}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Strategic Projects</h2>
            <p className={styles.sectionSubtitle}>
              Critical infrastructure developments across Southern Africa
            </p>
          </div>
          <div className={styles.projectsGrid}>
            <div className={styles.projectCard}>
              <div className={styles.projectImage}>
                <div className={styles.imagePlaceholder}></div>
                <div className={styles.projectOverlay}>
                  <span className={styles.projectClient}>Puma Energy</span>
                </div>
              </div>
              <div className={styles.projectInfo}>
                <h3>2M Liter Bulk Fuel Storage</h3>
                <p>
                  Massive-scale fuel storage facility with advanced safety
                  systems and automated distribution
                </p>
                <span className={styles.projectCategory}>
                  Fuel Infrastructure
                </span>
              </div>
            </div>
            <div className={styles.projectCard}>
              <div className={styles.projectImage}>
                <div className={styles.imagePlaceholder}></div>
                <div className={styles.projectOverlay}>
                  <span className={styles.projectClient}>Premium Client</span>
                </div>
              </div>
              <div className={styles.projectInfo}>
                <h3>Luxury Fuel Station Network</h3>
                <p>
                  Premium filling stations with integrated retail spaces and
                  advanced fuel management systems
                </p>
                <span className={styles.projectCategory}>Commercial Fuel</span>
              </div>
            </div>
            <div className={styles.projectCard}>
              <div className={styles.projectImage}>
                <div className={styles.imagePlaceholder}></div>
                <div className={styles.projectOverlay}>
                  <span className={styles.projectClient}>
                    Mr W's Construction
                  </span>
                </div>
              </div>
              <div className={styles.projectInfo}>
                <h3>Corporate Headquarters</h3>
                <p>
                  State-of-the-art office and warehouse facility showcasing our
                  construction capabilities
                </p>
                <span className={styles.projectCategory}>Commercial</span>
              </div>
            </div>
          </div>
          <div className={styles.projectsCta}>
            <a href="/projects" className={styles.primaryBtn}>
              View Project Portfolio
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Strategic Infrastructure Partnerships</h2>
            <p>
              For critical fuel and industrial projects requiring the highest
              standards of engineering and discretion. Limited client portfolio
              ensures focused excellence.
            </p>
            <a href="/contact" className={styles.primaryBtn}>
              Begin Conversation
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
