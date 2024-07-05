import { create } from "zustand";

const socketStore = create((set) => ({
  socket: null,
  setSocket: (state) => set({ socket: state }),
}));

export default socketStore;
