import styles from "./styles.module.css";

type ColorInputPropsType = {
  color: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tooltipText?: string;
};

export const ColorInput = ({
  color,
  onChange,
  tooltipText,
}: ColorInputPropsType) => {
  return (
    <div className={styles["color_selector_container"]}>
      <input
        type="color"
        className={styles["color_selector"]}
        value={color}
        onChange={onChange}
      ></input>
      {tooltipText && <span className={styles["tool_tip"]}>{tooltipText}</span>}
    </div>
  );
};
