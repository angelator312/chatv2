import { io } from 'socket.io-client';
export const socket=io({
    extraHeaders: {
        "chat-id":"426d403f-dd2d-4dc7-bab3-685c10ebd919"
    }
});