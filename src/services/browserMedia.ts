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

export const audioCache = new Map<string, HTMLAudioElement>();

export async function playAudio(source: string, volume = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    let audio = audioCache.get(source);
    if (!audio) {
      audio = new Audio(source);
      audio.preload = "auto";
      audioCache.set(source, audio);
    }

    audio.volume = volume;
    audio.currentTime = 0.1; // Trim 100ms at start of audio. @TODO -- lets make this configurable per track.

    const cleanup = () => {
      audio!.ontimeupdate = null;
      audio!.onerror = null;
    };

    const paddingBuffer = 0.15; // 150ms tail cut-off threshold. @TODO -- lets make this configurable per track.

    audio.ontimeupdate = () => {
      if (audio.duration && audio.currentTime >= audio.duration - paddingBuffer) {
        cleanup();
        resolve();
      }
    };

    audio.onerror = (error) => {
      cleanup();
      reject(error);
    };

    // Trigger instant playback
    audio.play().catch((error) => {
      cleanup();
      reject(error);
    });
  });
}
