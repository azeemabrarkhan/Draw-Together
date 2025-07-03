import { CanvasActions } from "../../enums";
import { Button } from "../button/buttons";

import styles from "./styles.module.css";

const CANVAS_BUTTONS = Object.values(CanvasActions).map((action) => ({
  name: action,
  icon: `url("/icons/${action}.png")`,
}));

export const CanvasButtons = () => {
  const handleCanvasAction = (actionName: CanvasActions) => {};

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
