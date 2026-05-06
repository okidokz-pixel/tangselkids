"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

export type RegisterSheetOptions = {
  title?: string;
  subtitle?: string;
  onRegistered?: () => void;
  /** Show only name + address in the profile step (hide photo, DOB, kids) — used for the upgrade-then-pay flow */
  minimalProfile?: boolean;
};

type RegisterSheetContextType = {
  isOpen: boolean;
  options: RegisterSheetOptions;
  openRegisterSheet: (opts?: RegisterSheetOptions) => void;
  closeRegisterSheet: () => void;
};

const RegisterSheetContext = createContext<RegisterSheetContextType>({
  isOpen: false,
  options: {},
  openRegisterSheet: () => {},
  closeRegisterSheet: () => {},
});

export function RegisterSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<RegisterSheetOptions>({});

  return (
    <RegisterSheetContext.Provider
      value={{
        isOpen,
        options,
        openRegisterSheet: (opts = {}) => { setOptions(opts); setIsOpen(true); },
        closeRegisterSheet: () => { setIsOpen(false); setOptions({}); },
      }}
    >
      {children}
    </RegisterSheetContext.Provider>
  );
}

export function useRegisterSheet() {
  return useContext(RegisterSheetContext);
}
