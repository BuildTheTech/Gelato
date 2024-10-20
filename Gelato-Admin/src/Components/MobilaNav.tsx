import { useState } from "react";
import { PiTwitterLogoLight, PiYoutubeLogoLight } from "react-icons/pi";
import { TbBrandTelegram } from "react-icons/tb";
import { HashLink as Link } from "react-router-hash-link";
import {
  BookIcon,
  BriefcaseIcon,
  BuyIcon,
  MenuIcon,
  SocialIcon,
  UsersIcon,
  WalletIcon,
} from "./Icons";

interface MobileNavProps {
  setShowOffcanvas: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobilaNav = ({ setShowOffcanvas }: MobileNavProps) => {
  const [activeMenu, setActiveMenu] = useState<"dapp" | "socials" | null>(null);

  const handleZapperOpen = () => {
    setShowOffcanvas(false);
  };

  const toggleMenu = (menu: "dapp" | "socials" | null) => {
    setActiveMenu((prevMenu) => (prevMenu === menu ? null : menu));
  };

  return (
    <>
      <ul className="phone-navbar d-lg-none">
        <li>
          <Link
            aria-controls="offcanvasNavbar-expand-lg"
            onClick={() => setShowOffcanvas((prev) => !prev)}
            to={""}
          >
            <MenuIcon />
            Menu
          </Link>
        </li>
        <li>
          <Link onClick={() => toggleMenu("dapp")} to={""}>
            <BuyIcon />
            dApp
          </Link>
        </li>
        <li>
          <Link to={""}>
            <BookIcon />
            Docs
          </Link>
        </li>
        <li>
          <Link onClick={() => toggleMenu("socials")} to={""}>
            <SocialIcon />
            Socials
          </Link>
        </li>
      </ul>
      {activeMenu === "dapp" && <DappNav handleZapperOpen={handleZapperOpen} />}
      {activeMenu === "socials" && <SocialNav />}
    </>
  );
};

const DappNav = ({ handleZapperOpen }: { handleZapperOpen: () => void }) => (
  <ul className="phone-navbar dapp-nav d-lg-none">
    <li>
      <Link to="/dapp#vault-id" smooth>
        <BuyIcon />
        My Wallet
      </Link>
    </li>
    <li>
      <Link to="/dapp#yield-id" smooth>
        <BriefcaseIcon />
        My Yield
      </Link>
    </li>
    <li>
      <Link to="/dapp#referral-id" smooth>
        <UsersIcon />
        My Referral
      </Link>
    </li>
    <li>
      <Link onClick={handleZapperOpen} to="">
        <WalletIcon />
        Zapper
      </Link>
    </li>
  </ul>
);

const SocialNav = () => (
  <ul className="phone-navbar dapp-nav nav-social d-lg-none">
    <li>
      <Link to="">
        <TbBrandTelegram />
        Telegram
      </Link>
    </li>
    <li>
      <Link to="">
        <PiTwitterLogoLight />
        Twitter
      </Link>
    </li>
    <li>
      <Link to="">
        <PiYoutubeLogoLight />
        Youtube
      </Link>
    </li>
  </ul>
);

export default MobilaNav;
