import NavBar from "./components/nav-bar/nav-bar";
import Home from "./pages/home/home";

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
