export const downloadFile = (href: string, filename: string) => {
  const createEl = document.createElement("a");
  createEl.href = href;

  createEl.download = filename;

  createEl.click();
  createEl.remove();
};

export const uploadFile = (type: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type;

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          resolve(json);
        } catch (err) {
          reject(new Error("Failed to parse JSON"));
        }
      };

      reader.onerror = () => reject(new Error("File reading error"));

      reader.readAsText(file);
    };

    input.click();
  });
};
