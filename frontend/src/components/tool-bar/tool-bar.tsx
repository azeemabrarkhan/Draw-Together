import { useState } from "react";
import { Button } from "../";
import type { HomeStateAction } from "../../pages";
import type { Coordinates, StrokeHistory } from "../../models";
import { downloadFile } from "../../utils";
import {
  ToolTypes,
  ButtonSizes,
  HomeStateActionTypes,
  CanvasActions,
} from "../../enums";

import styles from "./styles.module.css";

const STROKE_SIZES = [2, 4, 6, 8, 10];

const TOOLS = Object.values(ToolTypes).map((tool) => ({
  name: tool,
  icon: `url("/icons/${tool}.png")`,
}));

const CANVAS_ACTIONS = Object.values(CanvasActions).map((action) => ({
  name: action,
  icon: `url("/icons/${action}.png")`,
}));

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

export const ToolBar = ({
  color,
  history,
  redoHistory,
  selectedTool,
  strokeSize,
  zoom,
  setCanvasConfig,
  canvasRef,
  panCoords,
}: ToolBarPropsType) => {
  const [isSizeToolTipOpen, setIsSizeToolTipOpen] = useState(false);

  const handleToolSelect = (toolType: ToolTypes) => {
    setCanvasConfig({
      type: HomeStateActionTypes.SET_TOOL,
      payload: toolType,
    });
  };

  const handleColorSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasConfig({
      type: HomeStateActionTypes.SET_COLOR,
      payload: e.target.value,
    });
  };

  const handleStrokeSizeSelect = (strokeSize: number) => {
    setCanvasConfig({
      type: HomeStateActionTypes.SET_STROKE_SIZE,
      payload: strokeSize,
    });

    toggleSizeToolTip();
  };

  const toggleSizeToolTip = () => {
    setIsSizeToolTipOpen((prev) => !prev);
  };

  const handleCanvasAction = (actionName: CanvasActions) => {
    switch (actionName) {
      case CanvasActions.UNDO:
        setCanvasConfig({
          type: HomeStateActionTypes.UNDO,
        });
        break;

      case CanvasActions.REDO:
        setCanvasConfig({
          type: HomeStateActionTypes.REDO,
        });
        break;

      case CanvasActions.SAVE:
        if (!canvasRef.current) return;

        downloadFile(canvasRef.current.toDataURL("image/jpeg", 1), "Canvas");
        break;

      case CanvasActions.EXPORT:
        const jsonString = JSON.stringify(history, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        downloadFile(URL.createObjectURL(blob), `history.json`);
        break;

      case CanvasActions.IMPORT:
        break;

      default:
        break;
    }
  };

  const getButtonState = (actionName: CanvasActions) => {
    switch (actionName) {
      case CanvasActions.EXPORT:
      case CanvasActions.SAVE:
      case CanvasActions.UNDO:
        return history.length === 0;

      case CanvasActions.REDO:
        return redoHistory.length === 0;

      case CanvasActions.NEW:
      case CanvasActions.IMPORT:
        return false;
    }
  };

  return (
    <div className={styles["tool_bar"]}>
      {CANVAS_ACTIONS.map((action) => (
        <Button
          key={action.name}
          isSelected={false}
          onClick={() => handleCanvasAction(action.name)}
          url={action.icon}
          isDisabled={getButtonState(action.name)}
        />
      ))}
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
