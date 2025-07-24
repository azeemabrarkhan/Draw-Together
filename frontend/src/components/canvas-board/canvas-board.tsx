import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import { ZOOM_STEP, type HomeStateAction } from "../../pages";
import type { Coordinates, CoordinatesData, StrokeHistory } from "../../models";
import {
  Colors,
  HomeStateActionTypes,
  ToolTypes,
  ShapeResizePoints as ShapeResizeDirections,
  Cursors,
} from "../../enums";
import { CanvasOverlay } from "..";
import {
  drawOnCanvas,
  getCanvasMouseCoords,
  setupCanvas,
  getShapeAtPosition,
  isCoordOnShape,
  getNormalizedEndPointForSymmetricalShapes,
} from "../../utils/canvas";

import styles from "./styles.module.css";

const SELECT_BORDER_LINE_WIDTH = 2;
const SELECT_BORDER_LINE_DASH = [10, 10];
const SELECT_BOX_PADDING = 10;
const SYMMETRICAL_SHAPES = [ToolTypes.CIRCLE, ToolTypes.SQUARE];

type CanvasBoardPropsType = {
  isImporting: boolean;
  strokeColor: string;
  fillColor: string;
  history: StrokeHistory[];
  redoHistory: StrokeHistory[];
  selectedTool: ToolTypes;
  strokeSize: number;
  zoom: { current: number; last: number };
  setCanvasConfig: React.ActionDispatch<[action: HomeStateAction]>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  panCoords: React.RefObject<Coordinates>;
  selectedShape: StrokeHistory | null;
};

export const CanvasBoard = ({
  strokeColor,
  fillColor,
  history,
  redoHistory,
  selectedTool,
  strokeSize,
  zoom,
  setCanvasConfig,
  canvasRef,
  panCoords,
  selectedShape,
}: CanvasBoardPropsType) => {
  const isDrawing = useRef(false);
  const isDragging = useRef(false);
  const isMoving = useRef(false);
  const isResizing = useRef(false);
  const zIndex = useRef(0);
  const lastPanCoords = useRef<Coordinates>({ x: 0, y: 0 });
  const lastMouseCoords = useRef<Coordinates>({ x: 0, y: 0 });
  const shapeFrom = useRef<Coordinates | null>(null);
  const shapeTo = useRef<Coordinates | null>(null);
  const borderFrom = useRef<Coordinates | null>(null);
  const borderTo = useRef<Coordinates | null>(null);
  const strokesData = useRef<CoordinatesData[]>([]);
  const resizeDirection = useRef<ShapeResizeDirections | null>(null);

  const setCursorStyles = useCallback(
    (mousePosition?: Coordinates, selectedShape?: StrokeHistory | null) => {
      const canvas = canvasRef.current;
      if (canvas) {
        switch (selectedTool) {
          case ToolTypes.PAN:
            canvas.style.cursor = Cursors.MOVE;
            break;

          case ToolTypes.ERASER:
          case ToolTypes.FILL:
            canvas.style.cursor = Cursors.NONE;
            break;

          case ToolTypes.SELECT:
            if (!mousePosition || !selectedShape) {
              if (!isMoving.current && !isResizing.current) {
                canvas.style.cursor = Cursors.DEFAULT;
              }
              return;
            }

            if (isMoving.current) {
              canvas.style.cursor = Cursors.GRABBING;
              return;
            }

            if (isResizing.current) {
              return;
            } else {
              resizeDirection.current = null;
            }

            if (isCoordOnShape(mousePosition, selectedShape)) {
              canvas.style.cursor = Cursors.GRAB;
              return;
            }

            const { x, y } = mousePosition;
            const from = borderFrom.current;
            const to = borderTo.current;

            if (from && to) {
              const within = (val: number, min: number, max: number) =>
                val >= min && val <= max;

              const isLeftEdge =
                within(
                  x,
                  from.x - SELECT_BOX_PADDING,
                  from.x + SELECT_BOX_PADDING
                ) &&
                within(
                  y,
                  from.y + SELECT_BOX_PADDING,
                  to.y - SELECT_BOX_PADDING
                );

              const isRightEdge =
                within(
                  x,
                  to.x - SELECT_BOX_PADDING,
                  to.x + SELECT_BOX_PADDING
                ) &&
                within(
                  y,
                  from.y + SELECT_BOX_PADDING,
                  to.y - SELECT_BOX_PADDING
                );

              const isTopEdge =
                within(
                  y,
                  from.y - SELECT_BOX_PADDING,
                  from.y + SELECT_BOX_PADDING
                ) &&
                within(
                  x,
                  from.x + SELECT_BOX_PADDING,
                  to.x - SELECT_BOX_PADDING
                );

              const isBottomEdge =
                within(
                  y,
                  to.y - SELECT_BOX_PADDING,
                  to.y + SELECT_BOX_PADDING
                ) &&
                within(
                  x,
                  from.x + SELECT_BOX_PADDING,
                  to.x - SELECT_BOX_PADDING
                );

              const isTopLeftCorner =
                within(
                  x,
                  from.x - SELECT_BOX_PADDING,
                  from.x + SELECT_BOX_PADDING
                ) &&
                within(
                  y,
                  from.y - SELECT_BOX_PADDING,
                  from.y + SELECT_BOX_PADDING
                );

              const isTopRightCorner =
                within(
                  x,
                  to.x - SELECT_BOX_PADDING,
                  to.x + SELECT_BOX_PADDING
                ) &&
                within(
                  y,
                  from.y - SELECT_BOX_PADDING,
                  from.y + SELECT_BOX_PADDING
                );

              const isBottomLeftCorner =
                within(
                  x,
                  from.x - SELECT_BOX_PADDING,
                  from.x + SELECT_BOX_PADDING
                ) &&
                within(y, to.y - SELECT_BOX_PADDING, to.y + SELECT_BOX_PADDING);

              const isBottomRightCorner =
                within(
                  x,
                  to.x - SELECT_BOX_PADDING,
                  to.x + SELECT_BOX_PADDING
                ) &&
                within(y, to.y - SELECT_BOX_PADDING, to.y + SELECT_BOX_PADDING);

              if (isTopLeftCorner) {
                canvas.style.cursor = Cursors.NWSE_RESIZE;
                resizeDirection.current = ShapeResizeDirections.TOP_LEFT;
              } else if (isBottomRightCorner) {
                canvas.style.cursor = Cursors.NWSE_RESIZE;
                resizeDirection.current = ShapeResizeDirections.BOTTOM_RIGHT;
              } else if (isTopRightCorner) {
                canvas.style.cursor = Cursors.NESW_RESIZE;
                resizeDirection.current = ShapeResizeDirections.TOP_RIGHT;
              } else if (isBottomLeftCorner) {
                canvas.style.cursor = Cursors.NESW_RESIZE;
                resizeDirection.current = ShapeResizeDirections.BOTTOM_LEFT;
              } else if (
                isLeftEdge &&
                !SYMMETRICAL_SHAPES.includes(selectedShape.toolType)
              ) {
                canvas.style.cursor = Cursors.EW_RESIZE;
                resizeDirection.current = ShapeResizeDirections.LEFT;
              } else if (
                isRightEdge &&
                !SYMMETRICAL_SHAPES.includes(selectedShape.toolType)
              ) {
                canvas.style.cursor = Cursors.EW_RESIZE;
                resizeDirection.current = ShapeResizeDirections.RIGHT;
              } else if (
                isTopEdge &&
                !SYMMETRICAL_SHAPES.includes(selectedShape.toolType)
              ) {
                canvas.style.cursor = Cursors.NS_RESIZE;
                resizeDirection.current = ShapeResizeDirections.TOP;
              } else if (
                isBottomEdge &&
                !SYMMETRICAL_SHAPES.includes(selectedShape.toolType)
              ) {
                canvas.style.cursor = Cursors.NS_RESIZE;
                resizeDirection.current = ShapeResizeDirections.BOTTOM;
              } else {
                canvas.style.cursor = Cursors.DEFAULT;
                resizeDirection.current = null;
              }
            } else {
              canvas.style.cursor = Cursors.DEFAULT;
              resizeDirection.current = null;
            }
            break;

          default:
            canvas.style.cursor = Cursors.CROSSHAIR;
            break;
        }
      }
    },
    [selectedTool]
  );

  const drawBorderAroundShape = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    borderFrom.current = null;
    borderTo.current = null;

    if (selectedShape?.data[0]) {
      canvasContext.strokeStyle = Colors.BLACK;
      canvasContext.lineWidth = SELECT_BORDER_LINE_WIDTH;
      canvasContext.setLineDash(SELECT_BORDER_LINE_DASH);

      const x =
        Math.min(selectedShape.data[0].from.x, selectedShape.data[0].to.x) -
        SELECT_BOX_PADDING;
      const y =
        Math.min(selectedShape.data[0].from.y, selectedShape.data[0].to.y) -
        SELECT_BOX_PADDING;
      const width =
        Math.abs(selectedShape.data[0].to.x - selectedShape.data[0].from.x) +
        2 * SELECT_BOX_PADDING;
      const height =
        Math.abs(selectedShape.data[0].to.y - selectedShape.data[0].from.y) +
        2 * SELECT_BOX_PADDING;

      borderFrom.current = { x, y };
      borderTo.current = { x: x + width, y: y + height };

      canvasContext.strokeRect(x, y, width, height);
    }
  }, [selectedShape]);

  const handleZoom = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const direction = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;

    setCanvasConfig({
      type: HomeStateActionTypes.SET_ZOOM,
      payload: zoom.current + direction,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentMouseCoords = getCanvasMouseCoords(
      e,
      canvas,
      panCoords.current,
      zoom.current
    );

    if (selectedTool === ToolTypes.PAN) {
      isDragging.current = true;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      lastMouseCoords.current = { x, y };
      lastPanCoords.current = { ...panCoords.current };
    } else if (selectedTool === ToolTypes.SELECT && selectedShape) {
      if (isCoordOnShape(currentMouseCoords, selectedShape)) {
        isMoving.current = true;
      } else if (resizeDirection.current !== null) {
        isResizing.current = true;
      }

      lastMouseCoords.current = currentMouseCoords;
      setCursorStyles(currentMouseCoords, selectedShape);
    } else if (
      selectedTool !== ToolTypes.SELECT &&
      selectedTool !== ToolTypes.FILL
    ) {
      isDrawing.current = true;
      lastMouseCoords.current = currentMouseCoords;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentMouseCoords = getCanvasMouseCoords(
      e,
      canvas,
      panCoords.current,
      zoom.current
    );

    setCursorStyles(currentMouseCoords, selectedShape);

    if (
      !isDragging.current &&
      !isDrawing.current &&
      !isMoving.current &&
      !isResizing.current
    )
      return;

    switch (selectedTool) {
      case ToolTypes.PAN:
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - lastMouseCoords.current.x;
        const dy = y - lastMouseCoords.current.y;

        panCoords.current = {
          x: lastPanCoords.current.x + dx,
          y: lastPanCoords.current.y + dy,
        };

        setupCanvas(
          canvasRef.current,
          panCoords.current,
          zoom.current,
          history
        );
        break;

      case ToolTypes.SELECT:
        if (selectedShape) {
          const dx = currentMouseCoords.x - lastMouseCoords.current.x;
          const dy = currentMouseCoords.y - lastMouseCoords.current.y;
          const { x: xFrom, y: yFrom } = selectedShape.data[0].from;
          const { x: xTo, y: yTo } = selectedShape.data[0].to;

          if (isMoving.current) {
            shapeFrom.current = {
              x: xFrom + dx,
              y: yFrom + dy,
            };

            shapeTo.current = {
              x: xTo + dx,
              y: yTo + dy,
            };
          } else if (isResizing.current) {
            shapeFrom.current = {
              x: xFrom,
              y: yFrom,
            };

            shapeTo.current = {
              x: xTo,
              y: yTo,
            };

            if (SYMMETRICAL_SHAPES.includes(selectedShape.toolType)) {
              switch (resizeDirection.current) {
                case ShapeResizeDirections.TOP_RIGHT:
                  if (shapeTo.current.y > shapeFrom.current.y) {
                    shapeFrom.current.y += dy;
                  } else {
                    shapeTo.current.y += dy;
                  }
                  if (shapeTo.current.x > shapeFrom.current.x) {
                    shapeTo.current.x += dx;
                  } else {
                    shapeFrom.current.x += dx;
                  }
                  break;

                case ShapeResizeDirections.TOP_LEFT:
                  if (shapeTo.current.y > shapeFrom.current.y) {
                    shapeFrom.current.y += dy;
                  } else {
                    shapeTo.current.y += dy;
                  }
                  if (shapeTo.current.x > shapeFrom.current.x) {
                    shapeFrom.current.x += dx;
                  } else {
                    shapeTo.current.x += dx;
                  }
                  break;

                case ShapeResizeDirections.BOTTOM_RIGHT:
                  if (shapeTo.current.y > shapeFrom.current.y) {
                    shapeTo.current.y += dy;
                  } else {
                    shapeFrom.current.y += dy;
                  }
                  if (shapeTo.current.x > shapeFrom.current.x) {
                    shapeTo.current.x += dx;
                  } else {
                    shapeFrom.current.x += dx;
                  }
                  break;

                case ShapeResizeDirections.BOTTOM_LEFT:
                  if (shapeTo.current.y > shapeFrom.current.y) {
                    shapeTo.current.y += dy;
                  } else {
                    shapeFrom.current.y += dy;
                  }
                  if (shapeTo.current.x > shapeFrom.current.x) {
                    shapeFrom.current.x += dx;
                  } else {
                    shapeTo.current.x += dx;
                  }
              }

              shapeTo.current = getNormalizedEndPointForSymmetricalShapes(
                shapeFrom.current,
                shapeTo.current
              );
            } else {
              switch (resizeDirection.current) {
                case ShapeResizeDirections.TOP:
                  if (shapeTo.current.y > shapeFrom.current.y) {
                    shapeFrom.current.y += dy;
                  } else {
                    shapeTo.current.y += dy;
                  }
                  break;

                case ShapeResizeDirections.BOTTOM:
                  if (shapeTo.current.y > shapeFrom.current.y) {
                    shapeTo.current.y += dy;
                  } else {
                    shapeFrom.current.y += dy;
                  }
                  break;

                case ShapeResizeDirections.RIGHT:
                  if (shapeTo.current.x > shapeFrom.current.x) {
                    shapeTo.current.x += dx;
                  } else {
                    shapeFrom.current.x += dx;
                  }
                  break;

                case ShapeResizeDirections.LEFT:
                  if (shapeTo.current.x > shapeFrom.current.x) {
                    shapeFrom.current.x += dx;
                  } else {
                    shapeTo.current.x += dx;
                  }
                  break;

                case ShapeResizeDirections.TOP_RIGHT:
                  if (shapeTo.current.y > shapeFrom.current.y) {
                    shapeFrom.current.y += dy;
                  } else {
                    shapeTo.current.y += dy;
                  }
                  if (shapeTo.current.x > shapeFrom.current.x) {
                    shapeTo.current.x += dx;
                  } else {
                    shapeFrom.current.x += dx;
                  }
                  break;

                case ShapeResizeDirections.TOP_LEFT:
                  if (shapeTo.current.y > shapeFrom.current.y) {
                    shapeFrom.current.y += dy;
                  } else {
                    shapeTo.current.y += dy;
                  }
                  if (shapeTo.current.x > shapeFrom.current.x) {
                    shapeFrom.current.x += dx;
                  } else {
                    shapeTo.current.x += dx;
                  }
                  break;

                case ShapeResizeDirections.BOTTOM_RIGHT:
                  if (shapeTo.current.y > shapeFrom.current.y) {
                    shapeTo.current.y += dy;
                  } else {
                    shapeFrom.current.y += dy;
                  }
                  if (shapeTo.current.x > shapeFrom.current.x) {
                    shapeTo.current.x += dx;
                  } else {
                    shapeFrom.current.x += dx;
                  }
                  break;

                case ShapeResizeDirections.BOTTOM_LEFT:
                  if (shapeTo.current.y > shapeFrom.current.y) {
                    shapeTo.current.y += dy;
                  } else {
                    shapeFrom.current.y += dy;
                  }
                  if (shapeTo.current.x > shapeFrom.current.x) {
                    shapeFrom.current.x += dx;
                  } else {
                    shapeTo.current.x += dx;
                  }
                  break;

                default:
                  break;
              }
            }
          }

          if (shapeFrom.current && shapeTo.current) {
            setupCanvas(canvasRef.current, panCoords.current, zoom.current, [
              ...history.filter((shape) => selectedShape.id !== shape.id),
              {
                ...selectedShape,
                data: [{ from: shapeFrom.current, to: shapeTo.current }],
              },
            ]);
          }
        }
        break;

      case ToolTypes.DRAW:
      case ToolTypes.ERASER:
        const drawColor =
          selectedTool === ToolTypes.ERASER ? Colors.WHITE : strokeColor;
        const colorFill =
          selectedTool === ToolTypes.ERASER ? Colors.WHITE : fillColor;

        drawOnCanvas(
          lastMouseCoords.current,
          currentMouseCoords,
          canvas,
          selectedTool,
          drawColor,
          colorFill,
          strokeSize
        );

        strokesData.current.push({
          from: { ...lastMouseCoords.current },
          to: { ...currentMouseCoords },
        });

        lastMouseCoords.current = currentMouseCoords;
        break;

      default:
        setupCanvas(
          canvasRef.current,
          panCoords.current,
          zoom.current,
          history
        );

        drawOnCanvas(
          lastMouseCoords.current,
          currentMouseCoords,
          canvas,
          selectedTool,
          strokeColor,
          fillColor,
          strokeSize
        );

        shapeTo.current = getNormalizedEndPointForSymmetricalShapes(
          lastMouseCoords.current,
          currentMouseCoords
        );
        break;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentMouseCoords = getCanvasMouseCoords(
      e,
      canvas,
      panCoords.current,
      zoom.current
    );

    let strokeHistorySlice: StrokeHistory = {
      id: nanoid(),
      toolType: selectedTool,
      strokeColor,
      fillColor,
      strokeSize,
      zIndex: zIndex.current,
      data: [],
    };

    switch (selectedTool) {
      case ToolTypes.PAN:
        break;

      case ToolTypes.FILL: {
        const clickedElement = getShapeAtPosition(currentMouseCoords, history);
        if (!clickedElement || clickedElement?.toolType === ToolTypes.LINE) {
          toast.warn("Please click on a drawn shape to apply the fill color.");
        } else if (clickedElement.fillColor !== fillColor) {
          strokeHistorySlice = {
            ...clickedElement,
            fillColor,
            data: structuredClone(clickedElement.data),
          };
        }
        break;
      }

      case ToolTypes.SELECT: {
        if (isMoving.current || isResizing.current) {
          isMoving.current = false;
          isResizing.current = false;
          resizeDirection.current = null;

          if (selectedShape && shapeFrom.current && shapeTo.current) {
            strokeHistorySlice = {
              ...selectedShape,
              data: [{ from: shapeFrom.current, to: shapeTo.current }],
            };

            setCursorStyles(currentMouseCoords, strokeHistorySlice);

            setCanvasConfig({
              type: HomeStateActionTypes.SET_SELECTED_SHAPE,
              payload: strokeHistorySlice,
            });
          } else {
            setCursorStyles(currentMouseCoords, selectedShape);
          }
        } else {
          const clickedShape = getShapeAtPosition(currentMouseCoords, history);

          if (clickedShape) {
            setCursorStyles(currentMouseCoords, clickedShape);
          }

          setCanvasConfig({
            type: HomeStateActionTypes.SET_SELECTED_SHAPE,
            payload: clickedShape ?? null,
          });
        }

        break;
      }

      case ToolTypes.DRAW:
        strokeHistorySlice.data = strokesData.current;
        break;

      case ToolTypes.ERASER:
        strokeHistorySlice.data = strokesData.current;
        strokeHistorySlice.strokeColor = Colors.WHITE;
        strokeHistorySlice.fillColor = Colors.WHITE;
        break;

      default:
        if (shapeTo.current) {
          strokeHistorySlice.data.push({
            from: { ...lastMouseCoords.current },
            to: { ...shapeTo.current },
          });
        }
        break;
    }

    if (strokeHistorySlice.data.length > 0) {
      setCanvasConfig({
        type: HomeStateActionTypes.ADD_HISTORY,
        payload: strokeHistorySlice,
      });

      if (selectedTool !== ToolTypes.FILL) {
        zIndex.current += 1;
      }
    }

    isDragging.current = false;
    isDrawing.current = false;
    lastMouseCoords.current = { x: 0, y: 0 };
    lastPanCoords.current = { x: 0, y: 0 };
    shapeTo.current = null;
    shapeFrom.current = null;
    strokesData.current = [];
  };

  useEffect(() => {
    const handleResize = () => {
      setupCanvas(canvasRef.current, panCoords.current, zoom.current, history);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setupCanvas(canvasRef.current, panCoords.current, zoom.current, history);
    drawBorderAroundShape();
    setCursorStyles();
  }, [history, redoHistory, drawBorderAroundShape, setCursorStyles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas.getBoundingClientRect();
    const centerX = width / 2;
    const centerY = height / 2;

    const scaleRatio = zoom.current / zoom.last;

    panCoords.current.x =
      Math.round(
        (centerX - (centerX - panCoords.current.x) * scaleRatio) * 1000
      ) / 1000;
    panCoords.current.y =
      Math.round(
        (centerY - (centerY - panCoords.current.y) * scaleRatio) * 1000
      ) / 1000;

    setupCanvas(canvasRef.current, panCoords.current, zoom.current, history);
  }, [zoom.current]);

  return (
    <>
      <canvas
        className={styles.canvas}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleZoom}
      />
      <CanvasOverlay
        canvasRef={canvasRef}
        zoom={zoom.current}
        selectedTool={selectedTool}
      />
    </>
  );
};
