import { useState } from "react";
import type { HomeStateType } from "../../pages";
import { ToolTypes } from "../../enums";

import styles from "./styles.module.css";

const TOOLS = Object.values(ToolTypes).map((tool) => ({
  name: tool,
  icon: `url("/icons/${tool}.png")`,
}));

const STROKE_SIZES = [2, 4, 6, 8, 10];

type ToolBarPropsType = HomeStateType & {
  setToolBarConfig: React.Dispatch<React.SetStateAction<HomeStateType>>;
};

export const ToolBar = (props: ToolBarPropsType) => {
  const [isSizeToolTipOpen, setIsSizeToolTipOpen] = useState(false);
  const { selectedTool, color, strokeSize, setToolBarConfig } = props;

  const handleToolSelect = (toolType: ToolTypes) => {
    setToolBarConfig((prevConfig) => ({
      ...prevConfig,
      selectedTool: toolType,
    }));
  };

  const handleColorSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToolBarConfig((prevConfig) => ({
      ...prevConfig,
      color: e.target.value,
    }));
  };

  const handleStrokeSizeSelect = (strokeSize: number) => {
    setToolBarConfig((prevConfig) => ({
      ...prevConfig,
      strokeSize: strokeSize,
    }));
    toggleSizeToolTip();
  };

  const toggleSizeToolTip = () => {
    setIsSizeToolTipOpen((prev) => !prev);
  };

  return (
    <div className={styles["tool-bar"]}>
      {TOOLS.map((tool) => (
        <button
          className={`${styles.option} ${
            tool.name === selectedTool ? styles.selected : ""
          }`}
          key={tool.name}
          onClick={() => handleToolSelect(tool.name)}
        >
          <div
            className={styles.icon}
            style={{ backgroundImage: tool.icon }}
          ></div>
        </button>
      ))}
      <input
        type="color"
        className={`${styles.option} ${styles["color-selector"]}`}
        value={color}
        onChange={(e) => handleColorSelect(e)}
      ></input>
      <div className={styles.sizeButtonContainer}>
        <button
          className={`${styles.option} ${
            isSizeToolTipOpen ? styles.selected : ""
          }`}
          onClick={toggleSizeToolTip}
        >
          Size
        </button>
        {isSizeToolTipOpen && (
          <div className={styles.sizeToolTip}>
            {STROKE_SIZES.map((size) => (
              <button
                className={size === strokeSize ? styles.selected : ""}
                onClick={() => handleStrokeSizeSelect(size)}
              >{`Stroke ${size / 2}`}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
