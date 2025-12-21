// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

interface Project {
  projectID: number;
  project_name: string;
  description: string;
  client: string;
  status: string;
  country: string;
  address: string;
  created_at: string;
}

const Home: React.FC = () => {
  const [newestProjects, setNewestProjects] = useState<Project[]>([]);
  const [projectImages, setProjectImages] = useState<{ [key: number]: string }>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects and get the newest ones
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/projects", {
          credentials: "include",
        });
        const data = await response.json();

        // Sort by created_at descending and take first 3
        const sorted = data
          .sort(
            (a: Project, b: Project) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 3);
        setNewestProjects(sorted);

        // Fetch first image for each project
        const imagesMap: { [key: number]: string } = {};
        await Promise.all(
          sorted.map(async (project: Project) => {
            try {
              const imagesRes = await fetch(
                `http://localhost:3000/projects/${project.projectID}/images`
              );
              const imagesData = await imagesRes.json();
              if (imagesData.length > 0) {
                imagesMap[project.projectID] = imagesData[0].image_url;
              }
            } catch (err) {
              console.error(
                `Error fetching images for project ${project.projectID}:`,
                err
              );
            }
          })
        );

        setProjectImages(imagesMap);
      } catch (err) {
        console.error("Error fetching newest projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              <h3>Fuel Storage Tanks</h3>
              <p>
                Massive-scale fuel storage solutions with advanced safety
                systems and precision engineering.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <h3>Filling Stations</h3>
              <p>
                Premium fuel stations with integrated retail spaces and advanced
                distribution systems.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <h3>Industrial Facilities</h3>
              <p>
                Specialized warehouses, processing plants, and industrial
                complexes built to exacting standards.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <h3>Water Infrastructure</h3>
              <p>
                Large-scale water storage and distribution systems for
                industrial and municipal use.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <h3>Commercial Construction</h3>
              <p>
                Office complexes, residential flats, and commercial spaces with
                luxury finishes.
              </p>
            </div>
            <div className={styles.serviceCard}>
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
            <h2 className={styles.sectionTitle}>Latest Projects</h2>
            <p className={styles.sectionSubtitle}>
              Our most recent strategic infrastructure developments
            </p>
          </div>

          {loading ? (
            <div className={styles.loadingProjects}>
              Loading latest projects...
            </div>
          ) : newestProjects.length > 0 ? (
            <>
              <div className={styles.projectsGrid}>
                {newestProjects.map((project) => (
                  <div key={project.projectID} className={styles.projectCard}>
                    <Link
                      to={`/projects/${project.projectID}`}
                      className={styles.projectLink}
                    >
                      <div className={styles.projectImage}>
                        {projectImages[project.projectID] ? (
                          <img
                            src={`http://localhost:3000${
                              projectImages[project.projectID]
                            }`}
                            alt={project.project_name}
                            className={styles.projectImage}
                          />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <div className={styles.placeholderIcon}>🏗️</div>
                          </div>
                        )}
                        <div className={styles.yearOverlay}>
                          {new Date(project.created_at).getFullYear()}
                        </div>
                      </div>
                      <div className={styles.projectInfo}>
                        <h3 className={styles.projectTitle}>
                          {project.project_name}
                        </h3>
                        <div className={styles.projectArrow}>
                          <span className={styles.arrowIcon}>→</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              <div className={styles.projectsCta}>
                <a href="/projects" className={styles.primaryBtn}>
                  View All Projects
                </a>
              </div>
            </>
          ) : (
            <div className={styles.noProjects}>
              <p>No projects available at the moment.</p>
              <a href="/projects" className={styles.primaryBtn}>
                View All Projects
              </a>
            </div>
          )}
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
