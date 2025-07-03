import { useState } from "react";
import type { HomeStateType } from "../../pages";
import { ToolTypes } from "../../enums";

import styles from "./styles.module.css";
import { Button } from "../button/buttons";

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
    <div className={styles["tool_bar"]}>
      {TOOLS.map((tool) => (
        <Button
          key={tool.name}
          isSelected={tool.name === selectedTool}
          onClick={() => handleToolSelect(tool.name)}
          url={tool.icon}
        />
      ))}
      <input
        type="color"
        className={`${styles.option} ${styles["color-selector"]}`}
        value={color}
        onChange={(e) => handleColorSelect(e)}
      ></input>
      <div className={styles["size_button_container"]}>
        <Button
          isSelected={isSizeToolTipOpen}
          onClick={toggleSizeToolTip}
          text="Size"
        />
        {isSizeToolTipOpen &&
          STROKE_SIZES.map((size) => (
            <button
              key={size}
              className={`${styles.sizes} ${
                size === strokeSize ? styles.selected : ""
              }`}
              onClick={() => handleStrokeSizeSelect(size)}
            >
              {size / 2}
            </button>
          ))}
      </div>
    </div>
  );
};
