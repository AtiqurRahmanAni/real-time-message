import { create } from "zustand";

const conversationStore = create((set) => ({
  selectedConversation: null,
  conversations: null,
  onlineUsers: new Set(),
  setSelectedConversation: (state) => set({ selectedConversation: state }),
  setConversations: (state) => set({ conversations: state }),
  setNewConversation: (newConversation) =>
    set((state) => ({
      conversations: [...state.conversations, newConversation],
    })),
}));

export default conversationStore;
