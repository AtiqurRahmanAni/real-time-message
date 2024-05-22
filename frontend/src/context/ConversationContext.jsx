import { createContext, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const ConversationContext = createContext();

export const useConversation = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }) => {
  const [conversations, setConversations] = useLocalStorage(
    "conversations",
    []
  );

  const createConversation = (recipients) => {
    setConversations((prev) => [...prev, { recipients, selected: false }]);
  };

  const setSelected = (conversationIdx) => {
    setConversations((prev) =>
      prev.map((item, idx) => ({
        ...item,
        selected: conversationIdx === idx,
      }))
    );
  };

  const deleteConversation = (conversationIdx) => {
    setConversations((prev) =>
      prev.filter((item, idx) => idx !== conversationIdx)
    );
  };

  const value = {
    conversations,
    setConversations,
    createConversation,
    setSelected,
    deleteConversation,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
