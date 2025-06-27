import React, { useState } from "react";
import { ToolTypes } from "../enums/toolTypes";

type ToolBarContextType = {
  selectedTool: ToolTypes;
  color: string;
  strokeSize: number;
  setToolBarConfig: React.Dispatch<
    React.SetStateAction<Omit<ToolBarContextType, "setToolBarConfig">>
  >;
};

const defaultConfig: ToolBarContextType = {
  selectedTool: ToolTypes.DRAW,
  color: "#000000",
  strokeSize: 1,
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
    selectedTool: ToolTypes.DRAW,
    color: "#000000",
    strokeSize: 1,
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
