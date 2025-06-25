import styles from "./styles.module.css";

type NavBarProps = {};

const NavBar = (props: NavBarProps) => {
  return (
    <div className={styles.navbar}>
      <div className={styles.logo}></div>
    </div>
  );
};

export default NavBar;
