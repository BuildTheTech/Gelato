import { useLocation } from "react-router-dom";
import MainNav from "./MainNav";
import { ReactElement } from "react";

const Layout = ({ children }: { children: ReactElement | ReactElement[] }) => {
  const location = useLocation();
  let additionalClass = "main-landing";

  if (location.pathname === "") {
    additionalClass = "";
  }

  return (
    <div className={`wrapper ${additionalClass}`}>
      <header>
        <MainNav />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
