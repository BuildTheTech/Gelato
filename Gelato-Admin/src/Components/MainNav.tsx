import { useEffect, useState } from "react";
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import { Link } from "react-router-dom";
import { NavLogo } from "./Image";

import MobilaNav from "./MobilaNav";

const MainNav = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // state for scroll

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeOffcanvas = () => setShowOffcanvas(false);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar
        expand="lg"
        className={`navbar-main ${isScrolled ? "scrolled" : ""}`}
      >
        <Container>
          <Navbar.Brand>
            <Link to="" className="brand-logo" onClick={scrollToTop}>
              <NavLogo />
            </Link>
          </Navbar.Brand>
          <Navbar.Offcanvas
            show={showOffcanvas}
            onHide={closeOffcanvas}
            id="offcanvasNavbar-expand-lg"
            aria-labelledby="offcanvasNavbarLabel-expand-lg"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel-expand-lg">
                <Link
                  to="/"
                  className="brand-logo"
                  onClick={() => {
                    closeOffcanvas();
                    scrollToTop();
                  }}
                >
                  <NavLogo />
                </Link>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-center align-items-center flex-grow-1 pe-lg-3 NavList">
                <div className="nav-main-conent">
                  <NavLinkComponent closeOffcanvas={closeOffcanvas} />
                </div>
              </Nav>
              <div className="nav-rignt d-lg-flex justify-content-center align-items-center">
                <Link to="/dapp" className="btn btn-primay">
                  Launch dApp
                </Link>
              </div>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      <MobilaNav setShowOffcanvas={setShowOffcanvas} />
    </>
  );
};

const NavLinkComponent = ({
  closeOffcanvas,
}: {
  closeOffcanvas: () => void;
}) => (
  <>
    <a href="#features" className="nav-link" onClick={closeOffcanvas}>
      Features
    </a>
    <a href="#process" className="nav-link" onClick={closeOffcanvas}>
      Process
    </a>
    <a href="#advantage" className="nav-link" onClick={closeOffcanvas}>
      Advantage
    </a>
    <a href="#audits" className="nav-link" onClick={closeOffcanvas}>
      Audits
    </a>
    <a href="#team" className="nav-link" onClick={closeOffcanvas}>
      Team
    </a>
  </>
);

export default MainNav;
