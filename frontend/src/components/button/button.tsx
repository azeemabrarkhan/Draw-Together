import { ButtonSizes } from "../../enums";
import styles from "./styles.module.css";

type ButtonPropsType = {
  isSelected: boolean;
  onClick: () => void;
  isDisabled?: boolean;
  size?: ButtonSizes;
  url?: string;
  text?: string;
  tooltipText?: string;
};

export const Button = ({
  isSelected,
  isDisabled,
  onClick,
  size,
  url,
  text,
  tooltipText,
}: ButtonPropsType) => {
  return (
    <div className={styles["button_container"]}>
      <button
        className={`${styles.button} ${
          size === ButtonSizes.SMALL ? styles.small : ""
        } ${isSelected ? styles.selected : ""}`}
        onClick={onClick}
        disabled={isDisabled}
      >
        {url && (
          <div
            className={styles.content}
            style={{ backgroundImage: url }}
          ></div>
        )}
        {text && <div className={styles.content}>{text}</div>}
      </button>
      {tooltipText && <span className={styles["tool_tip"]}>{tooltipText}</span>}
    </div>
  );
};
