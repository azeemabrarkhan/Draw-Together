import React, { useState } from "react";
import type { ToolNames } from "../enums/toolNames";

type ToolBarContextType = {
  selectedTool: ToolNames | null;
  color: string;
  strokeSize: number;
  setToolBarConfig: React.Dispatch<
    React.SetStateAction<Omit<ToolBarContextType, "setToolBarConfig">>
  >;
};

const defaultConfig = {
  selectedTool: null,
  color: "#000000",
  strokeSize: 2,
  setToolBarConfig: () => {},
};

export const ToolBarContext =
  React.createContext<ToolBarContextType>(defaultConfig);

const ToolBarContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [{ selectedTool, color, strokeSize }, setToolBarConfig] = useState<
    Omit<ToolBarContextType, "setToolBarConfig">
  >({
    selectedTool: null,
    color: "#000000",
    strokeSize: 2,
  });

  return (
    <ToolBarContext.Provider
      value={{ selectedTool, color, strokeSize, setToolBarConfig }}
    >
      {children}
    </ToolBarContext.Provider>
  );
};

export default ToolBarContextProvider;
