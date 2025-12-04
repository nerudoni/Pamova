import React from "react";
import styles from "./Contact.module.css";

function Contact() {
  return (
    <div className={styles.contactContainer}>
      <div className={styles.contactCard}>
        <h2 className={styles.contactTitle}>Contact Mr W's construction</h2>
        <p className={styles.contactSubtitle}>
          Get in touch with our engineering team
        </p>

        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <p className={styles.contactText}>
              1234 Address, On Address Road, Zambia
            </p>
          </div>

          <div className={styles.contactItem}>
            <p className={styles.contactText}>Email: user@email.com</p>
          </div>

          <div className={styles.contactItem}>
            <p className={styles.contactText}>Phone: +22222222222</p>
          </div>

          <div className={styles.contactItem}>
            <p className={styles.contactText}>
              Business Hours: Mon-Fri 8:00 AM - 5:00 PM
            </p>
          </div>
        </div>

        <p className={styles.contactNote}>
          We specialize in fuel infrastructure projects and are available to
          discuss your engineering needs.
        </p>
      </div>
    </div>
  );
}

export default Contact;
