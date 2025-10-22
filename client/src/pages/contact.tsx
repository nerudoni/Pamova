// Contact.tsx
import React from "react";
import styles from "./Contact.module.css";

function Contact() {
  return (
    <div className={styles.contactContainer}>
      <div className={styles.contactCard}>
        <h2 className={styles.contactTitle}>Pamova HQ</h2>
        <div className={styles.contactInfo}>
          <p className={styles.contactItem}>
            1234 adress, on adress road, Zambia
          </p>
          <p className={styles.contactItem}>Email: user@email.com</p>
          <p className={styles.contactItem}>Phone: +22222222222</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
