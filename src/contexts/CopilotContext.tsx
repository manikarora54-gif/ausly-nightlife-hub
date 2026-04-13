import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CopilotContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const CopilotContext = createContext<CopilotContextType>({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
});

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  return (
    <CopilotContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </CopilotContext.Provider>
  );
}

export function useCopilot() {
  return useContext(CopilotContext);
}
