import { useState } from "react";
import { Button } from "../";
import type { HomeStateAction } from "../../pages";
import type { Coordinates, StrokeHistory } from "../../models";
import { ToolTypes, ButtonSizes, HomeStateActionTypes } from "../../enums";

import styles from "./styles.module.css";

const TOOLS = Object.values(ToolTypes).map((tool) => ({
  name: tool,
  icon: `url("/icons/${tool}.png")`,
}));

const STROKE_SIZES = [2, 4, 6, 8, 10];

type ToolBarPropsType = {
  color: string;
  history: StrokeHistory[];
  redoHistory: StrokeHistory[];
  selectedTool: ToolTypes;
  strokeSize: number;
  zoom: { current: number; last: number };
  setCanvasConfig: React.ActionDispatch<[action: HomeStateAction]>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  panCoords: React.RefObject<Coordinates>;
};

export const ToolBar = (props: ToolBarPropsType) => {
  const [isSizeToolTipOpen, setIsSizeToolTipOpen] = useState(false);
  const { selectedTool, color, strokeSize, setCanvasConfig } = props;

  const handleToolSelect = (toolType: ToolTypes) => {
    setCanvasConfig({
      type: HomeStateActionTypes.SELECTED_TOOL,
      payload: toolType,
    });
  };

  const handleColorSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasConfig({
      type: HomeStateActionTypes.COLOR,
      payload: e.target.value,
    });
  };

  const handleStrokeSizeSelect = (strokeSize: number) => {
    setCanvasConfig({
      type: HomeStateActionTypes.STROKE_SIZE,
      payload: strokeSize,
    });

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
        className={styles["color-selector"]}
        value={color}
        onChange={(e) => handleColorSelect(e)}
      ></input>
      <div className={styles["size_button_container"]}>
        <Button
          isSelected={isSizeToolTipOpen}
          onClick={toggleSizeToolTip}
          text="Size"
        />
        {isSizeToolTipOpen && (
          <div className={styles.sizes}>
            {STROKE_SIZES.map((size) => (
              <Button
                key={size}
                isSelected={size === strokeSize}
                onClick={() => handleStrokeSizeSelect(size)}
                text={`${size / 2}`}
                size={ButtonSizes.SMALL}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
