import React from "react";
import styles from "./about.module.css";

const About: React.FC = () => {
  return (
    <div className={styles.aboutContainer}>
      {/* Header Section */}
      <header className={styles.header}>
        <h1 className={styles.title}>About Mr W's construction</h1>
        <p className={styles.subtitle}>Engineering Excellence Since 2013</p>
      </header>

      {/* Company History Section */}
      <section className={styles.section}>
        <div className={styles.contentBox}>
          <h2>Our Heritage</h2>
          <p>
            Founded in 2013, Mr W's construction has established itself as a
            premier engineering and construction firm specializing in fuel
            infrastructure projects. With over a decade of experience, we have
            built a reputation for delivering complex fuel storage and
            distribution systems with uncompromising quality and precision.
          </p>
          <p>
            Our journey began with a vision to transform fuel infrastructure
            development through innovative engineering solutions and rigorous
            attention to detail. Today, we continue to push the boundaries of
            what's possible in fuel construction while maintaining our founding
            principles of integrity and excellence.
          </p>
        </div>
      </section>

      {/* Mission and Vision Sections */}
      <section className={styles.section}>
        <div className={styles.contentBox}>
          <h2>Our Purpose</h2>
          <div className={styles.missionVisionGrid}>
            <div className={styles.missionBox}>
              <h3>Mission</h3>
              <p>
                To deliver exceptional fuel infrastructure solutions through
                innovative engineering, uncompromising quality, and steadfast
                commitment to client success and safety excellence.
              </p>
            </div>
            <div className={styles.visionBox}>
              <h3>Vision</h3>
              <p>
                To be the leading fuel construction specialist recognized
                globally for engineering excellence, reliability, and
                sustainable infrastructure development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className={styles.section}>
        <div className={styles.contentBox}>
          <h2>Who We Are</h2>
          <p>
            Mr W's construction is a team of dedicated engineers, project
            managers, and construction specialists with deep expertise in fuel
            infrastructure. We combine technical excellence with practical
            construction knowledge to deliver projects that meet the highest
            standards of safety, efficiency, and reliability.
          </p>
          <p>
            Our approach is built on collaboration, innovation, and a relentless
            pursuit of quality. We understand that fuel infrastructure requires
            specialized knowledge and precision engineering, which is why we
            maintain the highest standards in every aspect of our work.
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className={styles.section}>
        <div className={styles.contentBox}>
          <h2>Our Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Quality Excellence</h3>
              <p className={styles.valueDescription}>
                Uncompromising commitment to superior craftsmanship and
                engineering precision in every project we undertake.
              </p>
            </div>
            <div className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Safety First</h3>
              <p className={styles.valueDescription}>
                Rigorous safety protocols and continuous improvement to protect
                our team, clients, and the environment.
              </p>
            </div>
            <div className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Innovation</h3>
              <p className={styles.valueDescription}>
                Embracing cutting-edge technologies and methodologies to deliver
                forward-thinking fuel infrastructure solutions.
              </p>
            </div>
            <div className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Integrity</h3>
              <p className={styles.valueDescription}>
                Building trust through transparency, ethical practices, and
                unwavering commitment to our promises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Worked With Section */}
      <section className={styles.section}>
        <div className={styles.contentBox}>
          <h2>Trusted Partnerships</h2>
          <p>
            We are proud to have collaborated with leading organizations in the
            energy and infrastructure sectors. Our commitment to excellence has
            earned us the trust of industry leaders.
          </p>
          <ul className={styles.companyList}>
            <li className={styles.companyItem}>
              <div className={styles.companyLogo}></div>
              <p className={styles.companyName}>Energy Solutions Ltd</p>
            </li>
            <li className={styles.companyItem}>
              <div className={styles.companyLogo}></div>
              <p className={styles.companyName}>FuelTech International</p>
            </li>
            <li className={styles.companyItem}>
              <div className={styles.companyLogo}></div>
              <p className={styles.companyName}>InfraBuild Corporation</p>
            </li>
            <li className={styles.companyItem}>
              <div className={styles.companyLogo}></div>
              <p className={styles.companyName}>PowerGrid Systems</p>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default About;
