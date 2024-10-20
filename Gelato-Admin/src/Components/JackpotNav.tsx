import { useState } from "react";
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import { UserIcon } from "./Icons";
import MobilaNav from "./MobilaNav";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAppContext } from "../Utilities/contexts/AppContext";
import { shortenAddress } from "../Utilities/helper";
import { zeroAddress } from "viem";

const JackpotNav = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  const { setAccessToken, setIsLoggedIn } = useAppContext();
  const closeOffcanvas = () => setShowOffcanvas(false);

  const handleLogout = () => {
    disconnect();
    setIsLoggedIn(false);
    setAccessToken("");
    localStorage.removeItem("accessToken");
  };

  return (
    <>
      <Navbar expand="lg" className="navbar-main">
        <Container>
          <Navbar.Brand></Navbar.Brand>
          <Navbar.Offcanvas
            show={showOffcanvas}
            onHide={closeOffcanvas}
            id="offcanvasNavbar-expand-lg"
            aria-labelledby="offcanvasNavbarLabel-expand-lg"
            placement="end">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel-expand-lg"></Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end align-items-center flex-grow-1 pe-lg-3 NavList">
                <div className="nav-rignt-sit d-lg-flex justify-content-center align-items-center">
                  {!account.isConnected ? (
                    <div className="nabDropList">
                      <button className="btn-primay" onClick={() => open()}>
                        Connect Wallet
                      </button>
                    </div>
                  ) : (
                    <button className="wallet-log-btn" onClick={handleLogout}>
                      <span>
                        {shortenAddress(account.address || zeroAddress)}
                      </span>{" "}
                      <UserIcon />
                    </button>
                  )}
                </div>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      <MobilaNav setShowOffcanvas={setShowOffcanvas} />
    </>
  );
};

export default JackpotNav;
