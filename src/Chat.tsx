import { useEffect, useState } from "react";
import { socket } from "./socket";
import CryptoJS from "crypto-js";
interface EncMsg {
  chat: string;
  time?: string;
  msg: string;
  dMsg?: string | null;
  dMem?: string | null;
  mem: string;
  enc: boolean;
  _id: string;
  chat_name?: string;
}
function decrypt(m: EncMsg[], p: string) {
  try {
    m = m.map((e) => {
      if (e.enc) {
        return {
          ...e,
          dMsg: CryptoJS.AES.decrypt(e.msg, p).toString(CryptoJS.enc.Utf8),
          dMem: CryptoJS.AES.decrypt(e.mem, p).toString(CryptoJS.enc.Utf8),
          enc: false,
        };
      } else {
        return {
          ...e,
          dMsg: e.msg,
          dMem: e.mem,
          enc: false,
        };
      }
    });
  } catch (e) {
    console.error(e);

    return { y: false, m };
  }

  return { y: true, m };
}
function encrypt(m: EncMsg[]): EncMsg[] {
  return m.map((e) => {
    return {
      ...e,
      enc: true,
      dMem: null,
      dMsg: null,
    };
  });
}
function Chat({ chatId }: { chatId: string }) {
  const [name, setN] = useState("Chat");
  const [password, setP] = useState(
    sessionStorage.getItem(`password-${chatId}`) ?? ""
  );
  const [decrypted, setD] = useState(
    !!sessionStorage.getItem(`password-${chatId}`)
  );
  const [member, setM] = useState("");
  const [content, setC] = useState("");
  const [msgs, setMsgs] = useState([] as EncMsg[]);

  const sendMsg = (e: any) => {
    e.preventDefault();
    // console.log("sendMsg", password);

    if (password)
      socket.emit("chat message", {
        chat: chatId,
        msg: CryptoJS.AES.encrypt(content, password).toString(),
        mem: CryptoJS.AES.encrypt(member, password).toString(),
        enc: true,
      });
  };
  function onChatMessage(msg: EncMsg) {
    // console.log(msg,msgs);
    setMsgs((prev) => {
      if (!msgs.find((e) => e._id === msg._id)) {
        let d = prev.concat([msg]);
        // console.log("msg", password);

        if (password) d = decrypt(d, password).m;
        if (msg.chat_name) {
          setN(msg.chat_name);
        }
        return d;
      }
      return prev;
    });
  }

  useEffect(() => {
    console.log(msgs.at(-1));
    socket.emit("chat join", {
      chatId: chatId,
      lastMsgTime: msgs.at(-1)?.time,
    });
    socket.on("chat message", onChatMessage);
    return () => {
      socket.emit("chat leave", { chatId: chatId });
      socket.off("chat message", onChatMessage);
    };
    //eslint-disable-next-line
  }, [chatId]);
  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <div className="col-6">
            <h1 className="card-title">{name}</h1>
          </div>
          <div className="col-6">
            <div className="input-group">
              <input
                className="form-control"
                id="f-pwd"
                placeholder="Password,type it here"
                onChange={(e) => setP(e.target.value)}
                name="pwd"
                type="text"
                value={password}
              />

              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!decrypted) {
                    let d = decrypt(msgs, password);
                    if (d.y) {
                      setMsgs(d.m);
                      setD(true);
                      sessionStorage.setItem(`password-${chatId}`, password);
                    } else {
                      setD(false);
                      sessionStorage.removeItem(`password-${chatId}`);
                    }
                  } else {
                    sessionStorage.removeItem(`password-${chatId}`);
                    setP("");
                    setMsgs(encrypt(msgs));
                    setD(false);
                  }
                }}
                value=""
              >
                {decrypted ? "Encrypt" : "Decrypt"}
              </button>
            </div>
          </div>
        </div>
        <div
          className="alert alert-danger"
          role="alert"
          id="d-n"
          style={{ display: decrypted ? "none" : "block" }}
        >
          Please enter password! or Decrypt failed!
        </div>
        <div className="table-responsive h-100">
          <table className="table table-primary table-sm table-bordered table-striped">
            <thead>
              <tr>
                <th scope="col-2">Member</th>
                <th scope="col">Message</th>
              </tr>
            </thead>
            <tbody id="tbody">
              {msgs.map((msg) => {
                return (
                  <tr key={`chat-${msg._id}`}>
                    <td style={{ width: "30%" }}>{msg.dMem ?? "encrypted"}</td>
                    <td style={{ width: "70%" }}>{msg.dMsg ?? "encrypted"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div id="spacer"></div>
        <div id="send">
          <form
            onSubmit={sendMsg}
            className="w-100 row row-cols-lg-auto g-3 align-items-center"
            id="form"
          >
            <div className="col-3">
              <input
                className="form-control"
                id="f-member"
                placeholder="Member name,type it here"
                name="member"
                type="text"
                onChange={(e) => setM(e.target.value)}
                required
              />
            </div>
            <div className="col-9">
              <div className="input-group">
                <input
                  className="form-control"
                  id="f-content"
                  placeholder="Message,type it here"
                  name="msg"
                  type="text"
                  onChange={(e) => setC(e.target.value)}
                  required
                />
                <input className="btn btn-primary" type="submit" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
