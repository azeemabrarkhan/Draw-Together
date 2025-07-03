import { NavBar } from "./components";
import { Home } from "./pages";

import styles from "./App.module.css";

function App() {
  return (
    <>
      <NavBar></NavBar>
      <div className={styles.content}>
        <Home></Home>
      </div>
    </>
  );
}

export default App;
