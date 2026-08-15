export function readFileAsDataUrl(file: File, acceptedDataUrl: RegExp): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !acceptedDataUrl.test(result)) {
        reject(new Error(`The selected file type is not supported: ${file.name}`));
        return;
      }
      resolve(result);
    };
    reader.onerror = () =>
      reject(new Error(`Could not read ${file.name}.`, { cause: reader.error }));
    reader.readAsDataURL(file);
  });
}

export async function playAudio(source: string, volume = 1): Promise<void> {
  const audio = new Audio(source);
  audio.volume = volume;
  await audio.play();
}
