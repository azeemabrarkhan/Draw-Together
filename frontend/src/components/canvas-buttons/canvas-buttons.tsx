import { CanvasActions } from "../../enums";

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
        <button
          key={action.name}
          className={styles["action_button"]}
          onClick={() => handleCanvasAction(action.name)}
        >
          <div
            className={styles.icon}
            style={{ backgroundImage: action.icon }}
          ></div>
        </button>
      ))}
    </div>
  );
};
