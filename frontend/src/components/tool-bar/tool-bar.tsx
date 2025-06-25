import { useState } from "react";
import { ToolNames } from "../../enums/toolNames";
import styles from "./styles.module.css";

const tools = Object.values(ToolNames).map((tool) => ({
  name: tool,
  icon: `url("icons/${tool}.png")`,
}));

const ToolBar = () => {
  const [config, setConfig] = useState<{ selectedToolName: ToolNames | null }>({
    selectedToolName: null,
  });

  const handleOptionSelect = (toolName: ToolNames) => {
    setConfig((prevConfig) => ({ ...prevConfig, selectedToolName: toolName }));
  };

  return (
    <div className={styles["tool-bar"]}>
      {tools.map((tool) => (
        <button
          className={`${styles.option} ${
            tool.name === config.selectedToolName ? styles.selected : ""
          }`}
          key={tool.name}
          onClick={() => handleOptionSelect(tool.name)}
        >
          <div
            className={styles.icon}
            style={{ backgroundImage: tool.icon }}
          ></div>
        </button>
      ))}
      <span className={styles.divider}>---</span>
      <input
        type="color"
        className={`${styles.option} ${styles["color-selector"]}`}
      ></input>
      <button className={styles.option}>Size</button>
    </div>
  );
};

export default ToolBar;
