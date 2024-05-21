import Login from "./components/Login";
import useLocalStorage from "./hooks/useLocalStorage";
import Dashboard from "./components/Dashboard";
import { ContactsProvider } from "./context/ContactsContext";

const App = () => {
  const [id, setId] = useLocalStorage("id");
  return (
    <div className="font-roboto">
      {id ? (
        <ContactsProvider>
          <Dashboard id={id} />
        </ContactsProvider>
      ) : (
        <Login onIdSubmit={setId} />
      )}
    </div>
  );
};

export default App;
