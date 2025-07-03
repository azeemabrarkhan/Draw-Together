export const downloadFile = (href: string, filename: string) => {
  const createEl = document.createElement("a");
  createEl.href = href;

  createEl.download = filename;

  createEl.click();
  createEl.remove();
};
