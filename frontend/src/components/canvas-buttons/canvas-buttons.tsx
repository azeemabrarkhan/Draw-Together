import { Button } from "../";
import { CanvasActions } from "../../enums";
import type { Coordinates, StrokeHistory } from "../../models";
import { setupCanvas } from "../../utils/canvas";
import { downloadFile } from "../../utils/file";

import styles from "./styles.module.css";

const CANVAS_BUTTONS = Object.values(CanvasActions).map((action) => ({
  name: action,
  icon: `url("/icons/${action}.png")`,
}));

type CanvasButtonsPropsType = {
  canvas: React.RefObject<HTMLCanvasElement | null>;
  panCoords: React.RefObject<Coordinates>;
  history: React.RefObject<StrokeHistory[]>;
  redoHistory: React.RefObject<StrokeHistory[]>;
  zoom: number;
};

export const CanvasButtons = ({
  canvas,
  panCoords,
  zoom,
  history,
  redoHistory,
}: CanvasButtonsPropsType) => {
  const handleCanvasAction = (actionName: CanvasActions) => {
    switch (actionName) {
      case CanvasActions.UNDO:
        const removedHistoryItem = history.current.pop();
        if (removedHistoryItem) {
          redoHistory.current.push(removedHistoryItem);
          setupCanvas(canvas.current, panCoords.current, zoom, history.current);
        }
        break;

      case CanvasActions.REDO:
        const removedRedoHistoryItem = redoHistory.current.pop();
        if (removedRedoHistoryItem) {
          history.current.push(removedRedoHistoryItem);
          setupCanvas(canvas.current, panCoords.current, zoom, history.current);
        }
        break;

      case CanvasActions.SAVE:
        if (!canvas.current) return;

        downloadFile(canvas.current.toDataURL("image/jpeg", 1), "Canvas");
        break;

      case CanvasActions.EXPORT:
        const jsonString = JSON.stringify(history.current, null, 2);
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
        return history.current.length === 0;

      case CanvasActions.REDO:
        return redoHistory.current.length === 0;

      case CanvasActions.IMPORT:
        return false;
    }
  };

  return (
    <div className={styles["canvas_buttons"]}>
      {CANVAS_BUTTONS.map((action) => (
        <Button
          key={action.name}
          isSelected={false}
          onClick={() => handleCanvasAction(action.name)}
          url={action.icon}
          isDisabled={getButtonState(action.name)}
        />
      ))}
    </div>
  );
};
