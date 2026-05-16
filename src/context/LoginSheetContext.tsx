"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

type LoginSheetContextType = {
  isOpen: boolean;
  openLoginSheet: () => void;
  closeLoginSheet: () => void;
};

const LoginSheetContext = createContext<LoginSheetContextType>({
  isOpen: false,
  openLoginSheet: () => {},
  closeLoginSheet: () => {},
});

export function LoginSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LoginSheetContext.Provider
      value={{
        isOpen,
        openLoginSheet: () => setIsOpen(true),
        closeLoginSheet: () => setIsOpen(false),
      }}
    >
      {children}
    </LoginSheetContext.Provider>
  );
}

export function useLoginSheet() {
  return useContext(LoginSheetContext);
}
