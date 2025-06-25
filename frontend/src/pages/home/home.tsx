import CanvasBoard from "../../components/canvas-board/canvas-board";
import ToolBar from "../../components/tool-bar/tool-bar";

import styles from "./styles.module.css";

const Home = () => {
  return (
    <div className={styles.home}>
      <ToolBar />
      <CanvasBoard />
    </div>
  );
};

export default Home;
