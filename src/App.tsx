import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useParams,
} from "react-router-dom";
import { socket } from "./socket";
import "./App.css";
import Chat from "./Chat";
import Home from "./Home";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/chats/:chatId",
      // element: <Chat chatId="426d403f-dd2d-4dc7-bab3-685c10ebd919" />,
      Component: () => {
        let { chatId } = useParams();
        return <Chat chatId={chatId as string} />;
      },
    },
  ]);

  return (
    <div className="App">
      <header className="App-header">
        {isConnected ? <RouterProvider router={router} /> : "Disconnected"}
        {/* <Home /> */}
      </header>
    </div>
  );
}

export default App;
