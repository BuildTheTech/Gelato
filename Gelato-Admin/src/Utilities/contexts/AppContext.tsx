import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context data
export type AppContextType = {
  showLoginModal: boolean;
  setShowLoginModal: (val: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  accessToken: string;
  setAccessToken: (val: string) => void;
};

// Set default values for the context
const appContextDefaultValues: AppContextType = {
  showLoginModal: false,
  setShowLoginModal: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  accessToken: "",
  setAccessToken: () => {},
};

// Create the context
export const AppContext = createContext<AppContextType>(
  appContextDefaultValues
);

// Custom hook to use the AppContext
export const useAppContext = () => {
  return useContext(AppContext);
};

// Define the provider component that will wrap the application
type Props = {
  children: ReactNode;
};

export const AppProvider = ({ children }: Props) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  // The value object contains all the state and functions we want to expose via context
  const value: AppContextType = {
    showLoginModal,
    setShowLoginModal,
    isLoggedIn,
    setIsLoggedIn,
    accessToken,
    setAccessToken,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
