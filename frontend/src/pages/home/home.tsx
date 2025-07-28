import { useEffect, useReducer, useRef } from "react";
import { toast } from "react-toastify";
import { CanvasBoard, ToolBar } from "../../components";
import type { Coordinates, StrokeHistory } from "../../models";
import { ToolTypes, HomeStateActionTypes, Colors } from "../../enums";
import { uploadFile, isStrokeHistoryArray } from "../../utils";

import styles from "./styles.module.css";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
export const ZOOM_STEP = 0.5;
const DEFAULT_ZOOM = 1;

type HomeStateType = {
  isImporting: boolean;
  strokeColor: string;
  fillColor: string;
  history: StrokeHistory[];
  redoHistory: StrokeHistory[];
  selectedTool: ToolTypes;
  strokeSize: number;
  zoom: { current: number; last: number };
  selectedShape: StrokeHistory | null;
};

export type HomeStateAction =
  | { type: HomeStateActionTypes.SET_IS_IMPORTING; payload: boolean }
  | { type: HomeStateActionTypes.SET_STROKE_COLOR; payload: string }
  | { type: HomeStateActionTypes.SET_FILL_COLOR; payload: string }
  | { type: HomeStateActionTypes.SET_HISTORY; payload: StrokeHistory[] }
  | { type: HomeStateActionTypes.ADD_HISTORY; payload: StrokeHistory }
  | { type: HomeStateActionTypes.UNDO }
  | { type: HomeStateActionTypes.REDO }
  | { type: HomeStateActionTypes.SET_TOOL; payload: ToolTypes }
  | { type: HomeStateActionTypes.SET_STROKE_SIZE; payload: number }
  | { type: HomeStateActionTypes.SET_ZOOM; payload: number }
  | {
      type: HomeStateActionTypes.SET_SELECTED_SHAPE;
      payload: StrokeHistory | null;
    };

const homeStateReducer = (
  state: HomeStateType,
  action: HomeStateAction
): HomeStateType => {
  switch (action.type) {
    case HomeStateActionTypes.SET_IS_IMPORTING:
      return { ...state, isImporting: action.payload };

    case HomeStateActionTypes.SET_STROKE_COLOR:
      return { ...state, strokeColor: action.payload };

    case HomeStateActionTypes.SET_FILL_COLOR:
      return { ...state, fillColor: action.payload };

    case HomeStateActionTypes.SET_HISTORY:
      return {
        ...state,
        redoHistory: [],
        history: action.payload,
        selectedShape: null,
      };

    case HomeStateActionTypes.ADD_HISTORY:
      return {
        ...state,
        history: state.history.concat(action.payload),
      };

    case HomeStateActionTypes.UNDO: {
      const historyCopy = [...state.history];
      const lastHistoryItem = historyCopy.pop();
      const redoHistoryCopy = lastHistoryItem
        ? [...state.redoHistory, lastHistoryItem]
        : [...state.redoHistory];

      return {
        ...state,
        history: historyCopy,
        redoHistory: redoHistoryCopy,
        selectedShape: null,
      };
    }

    case HomeStateActionTypes.REDO: {
      const redoHistoryCopy = [...state.redoHistory];
      const lastRedoHistoryItem = redoHistoryCopy.pop();
      const historyCopy = lastRedoHistoryItem
        ? [...state.history, lastRedoHistoryItem]
        : [...state.history];
      return {
        ...state,
        history: historyCopy,
        redoHistory: redoHistoryCopy,
        selectedShape: null,
      };
    }

    case HomeStateActionTypes.SET_TOOL:
      return {
        ...state,
        selectedTool: action.payload,
        selectedShape: null,
      };

    case HomeStateActionTypes.SET_STROKE_SIZE:
      return { ...state, strokeSize: action.payload };

    case HomeStateActionTypes.SET_ZOOM:
      if (action.payload < MIN_ZOOM || action.payload > MAX_ZOOM) return state;
      else
        return {
          ...state,
          zoom: { current: action.payload, last: state.zoom.current },
          selectedShape: null,
        };

    case HomeStateActionTypes.SET_SELECTED_SHAPE:
      return {
        ...state,
        selectedShape: action.payload,
      };

    default:
      return state;
  }
};

export const Home = () => {
  const [canvasConfig, setCanvasConfig] = useReducer(homeStateReducer, {
    isImporting: false,
    strokeColor: Colors.BLACK,
    fillColor: Colors.WHITE,
    history: [],
    redoHistory: [],
    selectedTool: ToolTypes.DRAW,
    strokeSize: 2,
    zoom: { current: DEFAULT_ZOOM, last: DEFAULT_ZOOM },
    selectedShape: null,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panCoords = useRef<Coordinates>({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasConfig.isImporting) return;

    uploadFile()
      .then((data) => {
        if (isStrokeHistoryArray(data)) {
          setCanvasConfig({
            type: HomeStateActionTypes.SET_HISTORY,
            payload: data,
          });
          toast.success("File uploaded successfully.");
        } else {
          toast.error("Unsupported JSON file format.");
        }
      })
      .catch((e) => toast.error(e.message))
      .finally(() =>
        setCanvasConfig({
          type: HomeStateActionTypes.SET_IS_IMPORTING,
          payload: false,
        })
      );
  }, [canvasConfig.isImporting]);

  const props = { ...canvasConfig, setCanvasConfig, canvasRef, panCoords };

  return (
    <div className={styles.home}>
      <ToolBar {...props} />
      <CanvasBoard {...props} />
    </div>
  );
};
