import { ButtonSizes } from "../../enums";
import styles from "./styles.module.css";

type ButtonPropsType = {
  isSelected: boolean;
  onClick: () => void;
  isDisabled?: boolean;
  size?: ButtonSizes;
  url?: string;
  text?: string;
};

export const Button = ({
  isSelected,
  isDisabled,
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
      disabled={isDisabled}
    >
      {url && (
        <div className={styles.icon} style={{ backgroundImage: url }}></div>
      )}
      {text && text}
    </button>
  );
};
