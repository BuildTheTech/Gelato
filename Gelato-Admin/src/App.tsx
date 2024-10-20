import { ReactElement, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Admin from "./Pages/Admin";
import { AppProvider } from "./Utilities/contexts/AppContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const Wrapper = ({
    children,
  }: {
    children: ReactElement | ReactElement[];
  }) => {
    const location = useLocation();
    useEffect(() => {
      document.documentElement.scrollTo(0, 0);
    }, [location.pathname, location.search]);

    return children;
  };

  return (
    <AppProvider>
      <BrowserRouter>
        <Wrapper>
          <Routes>
            <Route index element={<Admin />} />
          </Routes>
        </Wrapper>
        <ToastContainer
          position="top-right"
          // autoClose={5000}
          autoClose={false}
          hideProgressBar={true}
          newestOnTop={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
