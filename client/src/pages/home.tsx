// Home.tsx
import React from "react";
import styles from "./Home.module.css";

const Home: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      {/* Hero Section with Background Image */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Client testimonial/company phrase</h1>
        </div>
      </section>

      {/* Testimonial Section with Background Image */}
      <section className={styles.testimonialSection}>
        <div className={styles.sectionContent}>
          <div className={styles.textBox}>
            <h2>Same client testimonial/company phrase</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
              imperdiet orci nec felis ullamcorper varius. Mauris mattis
              tristique leo vitae mollis. Etiam ut tellus ac nibh pulvinar
              consequat. Integer finibus volutpat rhoncus. Mauris sem lorem,
              sodales et lectus vehicula, suscipit cursus tortor. Aliquam nec
              varius tellus, a elementum purus. Nullam ac quam tellus.
            </p>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className={styles.historySection}>
        <div className={styles.contentBox}>
          <h2>Brief description/history</h2>
          <div className={styles.historyContent}>
            <div className={styles.historyText}>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Phasellus imperdiet orci nec felis ullamcorper varius. Mauris
                mattis tristique leo vitae mollis. Etiam ut tellus ac nibh
                pulvinar consequat. Integer finibus volutpat rhoncus. Mauris sem
                lorem, sodales et lectus vehicula, suscipit cursus tortor.
                Aliquam nec varius tellus, a elementum purus. Nullam ac quam
                tellus.
              </p>
            </div>
            <div className={styles.ownerImage}>
              <img src="./src/Files/owner.jpg" alt="founder" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
