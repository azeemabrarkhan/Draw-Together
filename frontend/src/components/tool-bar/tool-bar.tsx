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

const BUTTONS_TO_RENDER = [
  CanvasActions.NEW,
  CanvasActions.SAVE,
  CanvasActions.EXPORT,
  CanvasActions.IMPORT,
  CanvasActions.UNDO,
  CanvasActions.REDO,
  CanvasActions.ZOOM_IN,
  CanvasActions.ZOOM_OUT,
  ToolTypes.PAN,
  ToolTypes.SELECT,
  CanvasActions.MOVE_FORWARD,
  CanvasActions.MOVE_BACKWARD,
  ToolTypes.DRAW,
  ToolTypes.ERASER,
  ToolTypes.LINE,
  ToolTypes.CIRCLE,
  ToolTypes.SQUARE,
  ToolTypes.RECTANGLE,
  ToolTypes.UP_TRIANGLE,
  ToolTypes.RIGHT_TRIANGLE,
  ToolTypes.DOWN_TRIANGLE,
  ToolTypes.LEFT_TRIANGLE,
  ToolTypes.FILL,
].map((name) => ({
  name: name,
  icon: `url("/icons/${name}.png")`,
}));

const CANVAS_ACTIONS = Object.values(CanvasActions);

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
  selectedShape: StrokeHistory | null;
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
  selectedShape,
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
        setCanvasConfig({
          type: HomeStateActionTypes.SET_SELECTED_SHAPE,
          payload: null,
        });

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

      case CanvasActions.MOVE_FORWARD:
      case CanvasActions.MOVE_BACKWARD:
        if (canvasRef.current && selectedShape) {
          const zIndexs = history.map((shape) => shape.zIndex);
          const minZIndex = Math.min(...zIndexs);
          const maxZIndex = Math.max(...zIndexs);
          const newZIndex =
            actionName === CanvasActions.MOVE_FORWARD
              ? maxZIndex + 1
              : minZIndex - 1;

          const shapeWithUpdateIndex = {
            ...selectedShape,
            zIndex: newZIndex,
            data: structuredClone(selectedShape.data),
          };

          setCanvasConfig({
            type: HomeStateActionTypes.ADD_HISTORY,
            payload: shapeWithUpdateIndex,
          });

          setCanvasConfig({
            type: HomeStateActionTypes.SET_SELECTED_SHAPE,
            payload: shapeWithUpdateIndex,
          });
        }

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

      case CanvasActions.MOVE_BACKWARD:
      case CanvasActions.MOVE_FORWARD:
        return selectedShape === null;
    }
  };

  return (
    <div className={styles["tool_bar"]}>
      {BUTTONS_TO_RENDER.map((button) => {
        return CANVAS_ACTIONS.includes(button.name as CanvasActions) ? (
          <Button
            key={button.name}
            isSelected={false}
            onClick={() => handleCanvasAction(button.name as CanvasActions)}
            url={button.icon}
            isDisabled={getButtonState(button.name as CanvasActions)}
            tooltipText={button.name}
          />
        ) : (
          <Button
            key={button.name}
            isSelected={button.name === selectedTool}
            onClick={() => handleToolSelect(button.name as ToolTypes)}
            url={button.icon}
            tooltipText={button.name}
          />
        );
      })}
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
