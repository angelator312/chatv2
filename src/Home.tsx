import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket";
import { ChatDescription } from "./interfaces";
import CryptoJS from "crypto-js";
function Home() {
  const navigate = useNavigate();
  const [PcName, setPcN] = useState("😆:?UNNAMED?:😆");
  const [PrName, setPvN] = useState("");
  const [PcDescription, setCPcD] = useState("");
  const [PrDescription, setCPrD] = useState("");
  const [pass, setP] = useState("");
  const [game, setG] = useState(false);
  function newChat(e: any) {
    e.preventDefault();
    function onF(e: any) {
      navigate(`/chats/${e.uuid}`);
    }
    const msg: ChatDescription = {
      publicName: PcName,
      privateName: CryptoJS.AES.encrypt(PrName, pass).toString(),
      pcDescription: PcDescription,
      prDescription: CryptoJS.AES.encrypt(PrDescription, pass).toString(),
      game,
      type: "chat",
    };
    socket.emit("newChat", msg);
    socket.once(`chatCreate`, onF);
  }
  return (
    <div className="card mt-5 mx-5" id="index">
      <div className="card-body">
        <h1>This is AES encrypted chat!</h1>
        <form
          onSubmit={newChat}
          className="w-100 row row-cols-lg-auto g-3 align-items-center"
          id="form"
        >
          <div className="form-group">
            <input
              name="publicName"
              className="form-control"
              placeholder="Enter public chat name"
              onChange={(e) => setPcN(e.target.value)}
            />
            <br />
            <input
              name="privateName"
              className="form-control"
              placeholder="Enter private chat name"
              onChange={(e) => setPvN(e.target.value)}
              required
            />
            <br />
            <input
              name="pcDescription"
              className="form-control"
              placeholder="Enter public description for your chat"
              onChange={(e) => setCPcD(e.target.value)}
            />
            <br />
            <input
              name="prDescription"
              className="form-control"
              placeholder="Enter private description for your chat"
              onChange={(e) => setCPrD(e.target.value)}
            />
            <br />
            <input
              name="password"
              className="form-control"
              placeholder="Enter password for your chat"
              onChange={(e) => setP(e.target.value)}
              required
            />
            <br />
            <input
              className="form-check-input"
              type="checkbox"
              id="isGameChat"
              checked={game}
              onChange={(e) => setG(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="isGameChat">
              It's game chat
            </label>
            <br />
            <input
              type="submit"
              className="btn btn-primary"
              value="Click here for new chat in chat space!"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;
