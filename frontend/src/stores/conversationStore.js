import { create } from "zustand";

const initialStates = {
  selectedConversation: null,
  conversations: null,
  onlineUsers: [],
  newMessages: [],
};

const conversationStore = create((set) => ({
  ...initialStates,
  setSelectedConversation: (state) => set({ selectedConversation: state }),
  setConversations: (state) => set({ conversations: state }),
  setNewConversation: (newConversation) =>
    set((state) => ({
      conversations: [...state.conversations, newConversation],
    })),
  updateConversation: (conversation) =>
    set((state) => {
      return {
        conversations: state.conversations.map((item) => {
          if (item.conversation && item.conversation._id === conversation._id) {
            return {
              ...item,
              conversation: {
                _id: conversation._id,
                lastMessage: conversation.lastMessage,
                lastMessageTimestamp: conversation.lastMessageTimestamp,
              },
            };
          } else {
            return item;
          }
        }),
      };
    }),
  setOnlineUsers: (state) => set({ onlineUsers: state }),
  resetConversations: () => set(initialStates),
}));

export default conversationStore;
