// About.tsx
import React from "react";
import styles from "./about.module.css";

const About: React.FC = () => {
  return (
    <div className={styles.aboutContainer}>
      {/* Company History Section */}
      <section className={styles.section}>
        <div className={styles.contentBox}>
          <h2>Company History</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            imperdiet orci nec felis ullamcorper varius. Mauris mattis tristique
            leo vitae mollis. Etiam ut tellus ac nibh pulvinar consequat.
            Integer finibus volutpat rhoncus. Mauris sem lorem, sodales et
            lectus vehicula, suscipit cursus tortor. Aliquam nec varius tellus,
            a elementum purus. Nullam ac quam tellus.
          </p>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className={styles.section}>
        <div className={styles.contentBox}>
          <h3>Mission Statement</h3>
          {/* Add mission statement content here when available */}
        </div>
      </section>

      {/* Who We Are Section */}
      <section className={styles.section}>
        <div className={styles.contentBox}>
          <h2>Who we are</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            imperdiet orci nec felis ullamcorper varius. Mauris mattis tristique
            leo vitae mollis. Etiam ut tellus ac nibh pulvinar consequat.
            Integer finibus volutpat rhoncus. Mauris sem lorem, sodales et
            lectus vehicula, suscipit cursus tortor. Aliquam nec varius tellus,
            a elementum purus. Nullam ac quam tellus.
          </p>
        </div>
      </section>

      {/* Vision Statement Section */}
      <section className={styles.section}>
        <div className={styles.contentBox}>
          <h3>Vision Statement</h3>
          {/* Add vision statement content here when available */}
        </div>
      </section>

      {/* Companies Worked With Section */}
      <section className={styles.section}>
        <div className={styles.contentBox}>
          <h2>Companies worked with</h2>
          <ul className={styles.companyList}>
            <li>
              <img className={styles.companyImg} src="" alt="company-1"></img>
            </li>
            <li>
              <img className={styles.companyImg} src="" alt="company-2"></img>
            </li>
            <li>
              <img className={styles.companyImg} src="" alt="company-3"></img>
            </li>
            <li>
              <img className={styles.companyImg} src="" alt="company-4"></img>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default About;
