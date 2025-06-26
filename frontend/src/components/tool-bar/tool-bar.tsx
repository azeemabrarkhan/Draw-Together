import { useContext, useState } from "react";
import { ToolNames } from "../../enums/toolNames";
import styles from "./styles.module.css";
import { ToolBarContext } from "../../contexts/toolbar-context";

const tools = Object.values(ToolNames).map((tool) => ({
  name: tool,
  icon: `url("icons/${tool}.png")`,
}));

const ToolBar = () => {
  const [isSizeToolTipOpen, setIsSizeToolTipOpen] = useState(false);
  const { selectedTool, color, strokeSize, setToolBarConfig } =
    useContext(ToolBarContext);

  const handleToolSelect = (toolName: ToolNames) => {
    setToolBarConfig((prevConfig) => ({
      ...prevConfig,
      selectedTool: toolName,
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
      strokeSize,
    }));
    toggleSizeToolTip();
  };

  const toggleSizeToolTip = () => {
    setIsSizeToolTipOpen((prev) => !prev);
  };

  return (
    <div className={styles["tool-bar"]}>
      {tools.map((tool) => (
        <button
          className={`${styles.option} ${
            tool.name === selectedTool ? styles.selected : ""
          }`}
          key={tool.name}
          onClick={() => handleToolSelect(tool.name)}
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
        value={color}
        onChange={(e) => handleColorSelect(e)}
      ></input>
      <div className={styles.sizeButtonContainer}>
        <button className={styles.option} onClick={toggleSizeToolTip}>
          Size
        </button>
        {isSizeToolTipOpen && (
          <div className={styles.sizeToolTip}>
            {[1, 2, 3, 4, 5, 6].map((size) => {
              console.log(size === strokeSize);
              return (
                <button
                  className={size === strokeSize ? styles.selected : ""}
                  onClick={() => handleStrokeSizeSelect(size)}
                >{`Stroke ${size}`}</button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolBar;
