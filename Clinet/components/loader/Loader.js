import React from "react";
import styles from "../../styles/Boxes.module.css";
const BoxesComponent = () => {
  return (
    <div className="bg-gray-200 bg-center bg-[length:150px_200px] bg-no-repeat bg-[url('/logo.jpg')]">
      <div className={styles.body}>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className={styles.box}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className={styles.box}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className={styles.box}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxesComponent;
