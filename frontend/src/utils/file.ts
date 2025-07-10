export const downloadObjAsEncodedFile = (obj: object, filename: string) => {
  const jsonString = JSON.stringify(obj);
  const encodedString = btoa(jsonString);
  const blob = new Blob([encodedString], { type: "application/octet-stream" });
  downloadFile(URL.createObjectURL(blob), filename);
};

export const downloadFile = (href: string, filename: string) => {
  const createEl = document.createElement("a");
  createEl.href = href;

  createEl.download = filename;

  createEl.click();
  createEl.remove();
};

export const uploadFile = (type?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type ?? "";

    const timeout = setTimeout(
      () => reject(new Error("A timeout occurred. Please try again.")),
      2000
    );

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error("No file selected."));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const decodedString = atob(e.target?.result as string);
          const json = JSON.parse(decodedString);
          clearTimeout(timeout);
          resolve(json);
        } catch (err) {
          reject(new Error("Unable to parse JSON data."));
        }
      };

      reader.onerror = () => reject(new Error("Error reading the file."));

      reader.readAsText(file);
    };

    input.click();
  });
};
