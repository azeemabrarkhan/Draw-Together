export const getCanvasMouseCoords = (
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  pan: { x: number; y: number },
  zoom: number,
  dpr: number
) => {
  const rect = canvas.getBoundingClientRect();
  const scale = zoom * dpr;

  const rawX = e.clientX - rect.left;
  const rawY = e.clientY - rect.top;

  return {
    x: (rawX - pan.x) / scale,
    y: (rawY - pan.y) / scale,
  };
};
