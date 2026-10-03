import { create } from "zustand";

type CropState = {
  sourceUri: string | null;
  /** Saniye */
  sourceDuration: number;
  /** Klibin başladığı an, saniye */
  startTime: number;
  setSource: (uri: string, duration: number) => void;
  setStartTime: (time: number) => void;
  reset: () => void;
};

const initialState = {
  sourceUri: null,
  sourceDuration: 0,
  startTime: 0,
};

export const useCropStore = create<CropState>()((set) => ({
  ...initialState,
  setSource: (sourceUri, sourceDuration) =>
    set({ sourceUri, sourceDuration, startTime: 0 }),
  setStartTime: (startTime) => set({ startTime }),
  reset: () => set(initialState),
}));