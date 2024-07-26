import { create } from "zustand";

const initialStates = {
  selectedGroup: null,
  //   conversations: null,
};

const groupStore = create((set) => ({
  ...initialStates,
  setSelectedGroup: (state) => set({ selectedGroup: state }),
  //   setConversations: (state) => set({ conversations: state }),
  //   setNewConversation: (newConversation) =>
  //     set((state) => ({
  //       conversations: [...state.conversations, newConversation],
  //     })),
  //   updateConversation: (conversation) =>
  //     set((state) => {
  //       return {
  //         conversations: state.conversations.map((item) => {
  //           if (item.conversation && item.conversation._id === conversation._id) {
  //             return {
  //               ...item,
  //               conversation: {
  //                 _id: conversation._id,
  //                 lastMessage: conversation.lastMessage,
  //                 lastMessageTimestamp: conversation.lastMessageTimestamp,
  //               },
  //             };
  //           } else {
  //             return item;
  //           }
  //         }),
  //       };
  //     }),
  resetGroups: () => set(initialStates),
}));

export default groupStore;