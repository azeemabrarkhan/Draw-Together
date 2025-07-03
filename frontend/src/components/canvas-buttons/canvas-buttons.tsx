import { Button } from "../";
import { CanvasActions } from "../../enums";
import type { Coordinates, StrokeHistory } from "../../models";
import { setupCanvas } from "../../utils/canvas";

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
        }
        setupCanvas(canvas.current, panCoords.current, zoom, history.current);
        break;

      case CanvasActions.REDO:
        const removedRedoHistoryItem = redoHistory.current.pop();
        if (removedRedoHistoryItem) {
          history.current.push(removedRedoHistoryItem);
        }
        setupCanvas(canvas.current, panCoords.current, zoom, history.current);
        break;

      case CanvasActions.SAVE:
        break;

      case CanvasActions.EXPORT:
        break;

      case CanvasActions.IMPORT:
        break;

      default:
        break;
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
        />
      ))}
    </div>
  );
};
