import React from "react";
import styles from "@/styles/LoginForm.module.css"; // Import CSS module

interface InputFieldProps {
  label: string;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = "text" }) => {
  return (
    <div className={styles.group}>
      <input required type={type} className={styles.input} />
      <span className={styles.highlight}></span>
      <span className={styles.bar}></span>
      <label className={styles.label}>{label}</label>
    </div>
  );
};

export default InputField;
