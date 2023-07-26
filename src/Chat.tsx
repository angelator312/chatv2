import { useEffect, useState } from "react";
import { socket } from "./socket";
import CryptoJS from "crypto-js";
import ReactMarkdown from "react-markdown";
import { EncMsg, ChatDescription } from "./interfaces";

function decryptMsgs(m: EncMsg[], p: string) {
  try {
    m = m.map((e) => {
      if (e.cEnc) {
        const out = {
          ...e,
          dMsg: CryptoJS.AES.decrypt(e.msg, p).toString(CryptoJS.enc.Utf8),
          dMem: CryptoJS.AES.decrypt(e.mem, p).toString(CryptoJS.enc.Utf8),
          cEnc: false,
        };
        // console.log("decrypt1", out);

        return out;
      } else {
        const out = {
          ...e,
          dMsg: e.msg,
          dMem: e.mem,
        };
        // console.log("decrypt0", out);
        return out;
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
    if (e.enc) {
      return {
        ...e,
        cEnc: e.enc,
        dMem: null,
        dMsg: null,
      };
    }
    return e;
  });
}
function Chat({ chatId }: { chatId: string }) {
  const [chatD, setCD] = useState<ChatDescription>();
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

    if (password) {
      socket.emit("chat message", {
        chat: chatId,
        msg: CryptoJS.AES.encrypt(content, password).toString(),
        mem: CryptoJS.AES.encrypt(member, password).toString(),
        enc: true,
      });
      setC("");
    }
  };
  function onChatDescription(msg: ChatDescription) {
    decryptChatD(msg);
  }

  function decryptChatD(msg: ChatDescription) {
    let prName: string | null = null;
    let prD: string | null = null;
    if (msg) {
      try {
        if (password) {
          prName = CryptoJS.AES.decrypt(msg.privateName, password).toString(
            CryptoJS.enc.Utf8
          );
          if (msg.prDescription) {
            prD = CryptoJS.AES.decrypt(msg.prDescription, password).toString(
              CryptoJS.enc.Utf8
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    setCD({
      ...msg,
      prDescription: prD ?? msg.prDescription,
      privateName: prName ?? msg.privateName,
    });
    setN(prName ?? name);
  }

  function onChatMessage(msg: EncMsg) {
    // console.log(msg,msgs);
    setMsgs((prev) => {
      if (!prev.find((e) => e._id === msg._id)) {
        // console.log("newMsg:",msg);
        const p = sessionStorage.getItem(`password-${chatId}`);
        let d = [msg];
        console.log("msg", p);
        d[0].cEnc = d[0].enc;
        if (p) d = decryptMsgs(d, p).m;
        // if (msg.chat_name) {
        //   setN(msg.chat_name);
        // }
        return prev.concat(d);
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
    socket.on("chat description", onChatDescription);
    return () => {
      socket.emit("chat leave", { chatId: chatId });
      socket.off("chat message", onChatMessage);
      socket.off("chat description", onChatDescription);
    };
    // eslint-disable-next-line
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
                type="password"
                value={password}
              />

              <button
                disabled={!password}
                className="btn btn-primary"
                onClick={() => {
                  if (!decrypted) {
                    let d = decryptMsgs(msgs, password);
                    if (d.y) {
                      if (chatD) decryptChatD(chatD);
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
                if (msg.enc) {
                  return (
                    <tr key={`chat-${msg._id}`}>
                      <td style={{ width: "30%" }}>
                        <ReactMarkdown>{msg.dMem ?? "encrypted"}</ReactMarkdown>
                      </td>
                      <td style={{ width: "70%" }}>
                        <ReactMarkdown>{msg.dMsg ?? "encrypted"}</ReactMarkdown>
                      </td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={`chat-${msg._id}`}>
                      <td style={{ width: "30%" }}>
                        <ReactMarkdown>{msg.mem}</ReactMarkdown>
                      </td>
                      <td style={{ width: "70%" }}>
                        <ReactMarkdown>{msg.msg}</ReactMarkdown>
                      </td>
                    </tr>
                  );
                }
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
                  value={content}
                  required
                />
                <input
                  disabled={!(!!content && !!password && decrypted && !!member)}
                  className="btn btn-primary"
                  type="submit"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
