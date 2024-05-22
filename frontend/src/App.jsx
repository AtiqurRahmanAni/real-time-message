import Login from "./components/Login";
import useLocalStorage from "./hooks/useLocalStorage";
import Dashboard from "./components/Dashboard";
import { ContactsProvider } from "./context/ContactsContext";
import { ConversationProvider } from "./context/ConversationContext";

const App = () => {
  const [id, setId] = useLocalStorage("id");
  return (
    <div className="font-roboto">
      {id ? (
        <ContactsProvider>
          <ConversationProvider>
            <Dashboard id={id} />
          </ConversationProvider>
        </ContactsProvider>
      ) : (
        <Login onIdSubmit={setId} />
      )}
    </div>
  );
};

export default App;
