import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket";
function Home() {
  const navigate = useNavigate();
  const [cName, setN] = useState("");
  function newChat(e: any) {
    e.preventDefault();
    function onF(e: any) {
      navigate(`/chats/${e.uuid}`);
    }
    socket.emit("newChat", { name: cName });
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
              name="name"
              className="form-control"
              placeholder="Enter chat name"
              onChange={(e) => setN(e.target.value)}
            />
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
