export const getCanvasMouseCoords = (
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  pan: { x: number; y: number },
  zoom: number
) => {
  const rect = canvas.getBoundingClientRect();

  const rawX = e.clientX - rect.left;
  const rawY = e.clientY - rect.top;

  return {
    x: (rawX - pan.x) / zoom,
    y: (rawY - pan.y) / zoom,
  };
};
