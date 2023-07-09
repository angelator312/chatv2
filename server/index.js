require("dotenv").config();
const uuid = require("uuid");
const { Mongostore } = require("./mongostore");
const express = require("express");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const chats = new Mongostore("chats");
const port = process.env.PORT ?? 8080;
const location = port === 8080 ? "localhost:8080" : "chat.angelator312.top";
// свързваме монгото-акаунти
chats.conect(process.env.MONGO_URL);
// конфигурации
app.use(express.static(path.join(__dirname, "..", "build")));

// край на конфигурациите

// -----------------io on--------------------------
io.on("connection", async (socket) => {
  socket.on("chat message", async (msg) => {
    const msg2 = await chats.addMsg(msg.chat, msg.mem, msg.msg, true);
    io.to(msg.chat).emit("chat message", msg2);
  });
  socket.on("chat join", async (msg) => {
    const CID = msg.chatId;
    socket.join(CID);
    let msgs = await chats.getMsgs(CID);
    if (msgs) {
      for (let i of msgs) {
        if (i.time > msg.lastMsgTime || !msg.lastMsgTime) {
          console.log(i.time, "Message is sent", msg.lastMsgTime);
          socket.emit("chat message", i);
        }
      }
    }
    console.log("Join", CID);
  });
  socket.on("chat leave", async (msg) => {
    socket.leave(msg.chatId);
    console.log("leave");
  });
  socket.on("newChat", async (extra = {}) => {
    const newChat = uuid.v4();
    await chats.addMsg(newChat, "System-Owner-Chats", "Hello members!", false, {
      chat_name: extra.name||"😆:?UNNAMED?:😆",
    });
    socket.emit(`uuid-${extra.date}`,{uuid: newChat});
  });
});
// ---------------- finish io ---------------------

// ----------------app.gets------------------------
app.get("/", async function (req, res) {
  res.render("index", {});
});
app.get("/newChat", async function (req, res) {
  console.log("New chat");
  const newChat = uuid.v4();
  await chats.addMsg(newChat, "System-Owner-Chats", "Hello members!", false, {
    chat_name: req.query.name,
  });
  res.redirect(`http://${location}/chats/${newChat}`);
});
// app.get("/chats/:chatId", async function (req, res) {
//   const chat = await chats.getMsgs(req.params.chatId);
//   if (chat) {
//     console.log(chat);
//     res.render("chat", {
//       chat,
//     });
//   } else {
//     res.writeHead(404, { "Content-Type": `text/html; charset=utf-8` });
//     res.write("<h1>404</h1>");
//     res.write("Няма такъв чат, no such Chat");
//     res.end();
//   }
// });
//app.listen--------------------------------------------------
http.listen(port, () => {
  console.log("Express server listening in port %s", port);
});
//------------------------finish(stop)----------------------------------------

// comments------------------------------------------------
// app.get("/chats/:chatId/msgs", async function (req, res) {
//   const chat = await chats.getMsgs(req.params.chatId);
//   if (chat) {
//     res.writeHead(200, { "Content-Type": `application/json` });
//     res.write(JSON.stringify(chat));
//     res.end();
//   } else {
//     res.writeHead(404, { "Content-Type": `application/json` });
//     res.write(' { "error":"Няма такъв чат, no such Chat"}');
//     res.end();
//   }
// });
// app.get("/newMsg/:chatId", async function (req, res) {
//   const id = req.params.chatId;
//   const chat = await chats.getMsgs(id);
//   if (chat) {
//     // const k=AES.generateKey(req.query.pwd);
//     //chat.msgs.push({content:AES.encrypt(k,req.query.msg),member:AES.encrypt(k,req.query.member)});
//     await chats.addMsg(id, req.query.member, req.query.msg, true);
//     res.redirect(`//${location}/chats/${chat[0].chat}`);
//   } else {
//     res.writeHead(404, { "Content-Type": `text/html; charset=utf-8` });
//     res.write("<h1>404</h1>");
//     res.write("Няма такъв чат, no such Chat");
//     res.end();
//   }
// });
