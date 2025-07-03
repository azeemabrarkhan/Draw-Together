import styles from "./styles.module.css";

type ButtonPropsType = {
  isSelected: boolean;
  onClick: () => void;
  url?: string;
  text?: string;
};

export const Button = ({ isSelected, onClick, url, text }: ButtonPropsType) => {
  return (
    <button
      className={`${styles.button} ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
    >
      {url && (
        <div className={styles.icon} style={{ backgroundImage: url }}></div>
      )}
      {text && text}
    </button>
  );
};
