import { create } from "zustand";

const conversationStore = create((set) => ({
  conversations: [],
  setConversations: (state) => set({ conversations: state }),
  setConversationSelected: (selectedIdx) =>
    set((state) => ({
      conversations: state.conversations.map((conversation, idx) =>
        idx === selectedIdx
          ? { ...conversation, selected: true }
          : { ...conversation, selected: false }
      ),
    })),
}));

export default conversationStore;
