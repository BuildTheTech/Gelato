import { HashLink as Link } from "react-router-hash-link";
import { MenuIcon } from "./Icons";

interface MobileNavProps {
  setShowOffcanvas: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobilaNav = ({ setShowOffcanvas }: MobileNavProps) => {
  return (
    <>
      <ul className="phone-navbar d-lg-none">
        <li>
          <Link
            aria-controls="offcanvasNavbar-expand-lg"
            onClick={() => setShowOffcanvas((prev) => !prev)}
            to={""}>
            <MenuIcon />
            Menu
          </Link>
        </li>
      </ul>
    </>
  );
};

export default MobilaNav;
