declare module "@ffmpeg/ffmpeg" {
  export const createFFmpeg: (options?: { log?: boolean }) => any;
  export const fetchFile: (
    file: string | File | Blob | Buffer,
  ) => Promise<Uint8Array>;
}
