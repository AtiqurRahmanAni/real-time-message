import { create } from "zustand";

const conversationStore = create((set) => ({
  conversations: [],
  onlineUsers: new Set(),
  setConversations: (state) => set({ conversations: state }),
  setNewConversation: (newConversation) =>
    set((state) => ({
      conversations: [...state.conversations, newConversation],
    })),
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
