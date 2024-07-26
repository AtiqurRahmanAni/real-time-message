import { create } from "zustand";

const initialStates = {
  selectedGroup: null,
};

const groupStore = create((set) => ({
  ...initialStates,
  setSelectedGroup: (state) => set({ selectedGroup: state }),

  resetGroups: () => set(initialStates),
}));

export default groupStore;
