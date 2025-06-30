import { useState } from "react";
import CanvasBoard from "../../components/canvas-board/canvas-board";
import ToolBar from "../../components/tool-bar/tool-bar";
import { ToolTypes } from "../../enums/toolTypes";

import styles from "./styles.module.css";

export type HomeStateType = {
  selectedTool: ToolTypes;
  color: string;
  strokeSize: number;
};

const Home = () => {
  const [toolBarConfig, setToolBarConfig] = useState<HomeStateType>({
    selectedTool: ToolTypes.DRAW,
    color: "#000000",
    strokeSize: 1,
  });

  return (
    <div className={styles.home}>
      <ToolBar {...toolBarConfig} setToolBarConfig={setToolBarConfig} />
      <CanvasBoard {...toolBarConfig} />
    </div>
  );
};

export default Home;
