import { create } from "zustand";

const conversationStore = create((set) => ({
  conversations: [],
  setConversations: (state) => set({ conversations: state }),
}));

export default conversationStore;
