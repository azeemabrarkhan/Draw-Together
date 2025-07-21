import { useState } from "react";
import { Button, ColorInput } from "../";
import { ZOOM_STEP, type HomeStateAction } from "../../pages";
import type { Coordinates, StrokeHistory } from "../../models";
import {
  downloadFile,
  downloadObjAsEncodedFile,
  getCurrentTimeStamp,
  setupCanvas,
} from "../../utils";
import {
  ToolTypes,
  ButtonSizes,
  HomeStateActionTypes,
  CanvasActions,
} from "../../enums";

import styles from "./styles.module.css";

const STROKE_SIZES = [2, 4, 6, 8, 10];
const STROKE_SIZE_BUTTON_ICON = `url("/icons/Stroke Size.png")`;

const TOOLS = Object.values(ToolTypes).map((tool) => ({
  name: tool,
  icon: `url("/icons/${tool}.png")`,
}));

const CANVAS_ACTIONS = Object.values(CanvasActions).map((action) => ({
  name: action,
  icon: `url("/icons/${action}.png")`,
}));

type ToolBarPropsType = {
  isImporting: boolean;
  strokeColor: string;
  fillColor: string;
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
  isImporting,
  strokeColor,
  fillColor,
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

  const toggleSizeToolTip = () => {
    setIsSizeToolTipOpen((prev) => !prev);
  };

  const handleToolSelect = (toolType: ToolTypes) => {
    setCanvasConfig({
      type: HomeStateActionTypes.SET_TOOL,
      payload: toolType,
    });
  };

  const handleStrokeColorSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasConfig({
      type: HomeStateActionTypes.SET_STROKE_COLOR,
      payload: e.target.value,
    });
  };

  const handleFillColorSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasConfig({
      type: HomeStateActionTypes.SET_FILL_COLOR,
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

  const handleCanvasAction = (actionName: CanvasActions) => {
    switch (actionName) {
      case CanvasActions.NEW:
        setCanvasConfig({
          type: HomeStateActionTypes.SET_HISTORY,
          payload: [],
        });
        break;
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

        setupCanvas(
          canvasRef.current,
          panCoords.current,
          zoom.current,
          history
        );

        downloadFile(
          canvasRef.current.toDataURL("image/jpeg", 1),
          `${getCurrentTimeStamp()}-canvas`
        );
        break;

      case CanvasActions.EXPORT:
        downloadObjAsEncodedFile(history, `${getCurrentTimeStamp()}-canvas`);
        break;

      case CanvasActions.IMPORT:
        setCanvasConfig({
          type: HomeStateActionTypes.SET_IS_IMPORTING,
          payload: true,
        });
        break;

      case CanvasActions.ZOOM_IN:
        setCanvasConfig({
          type: HomeStateActionTypes.SET_ZOOM,
          payload: zoom.current + ZOOM_STEP,
        });
        break;

      case CanvasActions.ZOOM_OUT:
        setCanvasConfig({
          type: HomeStateActionTypes.SET_ZOOM,
          payload: zoom.current - ZOOM_STEP,
        });
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
        return false;

      case CanvasActions.IMPORT:
        return isImporting;
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
          tooltipText={action.name}
        />
      ))}
      {TOOLS.map((tool) => (
        <Button
          key={tool.name}
          isSelected={tool.name === selectedTool}
          onClick={() => handleToolSelect(tool.name)}
          url={tool.icon}
          tooltipText={tool.name}
        />
      ))}
      <ColorInput
        color={fillColor}
        onChange={handleFillColorSelect}
        tooltipText="Fill Color"
      />
      <ColorInput
        color={strokeColor}
        onChange={handleStrokeColorSelect}
        tooltipText="Stroke Color"
      />
      <div className={styles["size_button_container"]}>
        <Button
          isSelected={isSizeToolTipOpen}
          onClick={toggleSizeToolTip}
          url={STROKE_SIZE_BUTTON_ICON}
          tooltipText={isSizeToolTipOpen ? "" : "Stroke Size"}
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
