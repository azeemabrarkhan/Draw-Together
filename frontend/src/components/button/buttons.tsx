import { ButtonSizes } from "../../enums/button-sizes";
import styles from "./styles.module.css";

type ButtonPropsType = {
  isSelected: boolean;
  onClick: () => void;
  size?: ButtonSizes;
  url?: string;
  text?: string;
};

export const Button = ({
  isSelected,
  onClick,
  size,
  url,
  text,
}: ButtonPropsType) => {
  return (
    <button
      className={`${styles.button} ${
        size === ButtonSizes.SMALL ? styles.small : ""
      } ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
    >
      {url && (
        <div className={styles.icon} style={{ backgroundImage: url }}></div>
      )}
      {text && text}
    </button>
  );
};
