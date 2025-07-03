import { useState } from "react";
import { CanvasBoard, ToolBar } from "../../components";
import { ToolTypes } from "../../enums";

import styles from "./styles.module.css";

export type HomeStateType = {
  selectedTool: ToolTypes;
  color: string;
  strokeSize: number;
};

export const Home = () => {
  const [toolBarConfig, setToolBarConfig] = useState<HomeStateType>({
    selectedTool: ToolTypes.DRAW,
    color: "#000000",
    strokeSize: 2,
  });

  return (
    <div className={styles.home}>
      <ToolBar {...toolBarConfig} setToolBarConfig={setToolBarConfig} />
      <CanvasBoard {...toolBarConfig} />
    </div>
  );
};
