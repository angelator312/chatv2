export interface ChatDescription {
  type: "chat";
  chatId?: string;
  publicName?: string;
  privateName: string;
  pcDescription: string;
  prDescription?: string;
  _id?: string;
  game: boolean;
  expire?: number;
}
export interface EncMsg {
  chat: string;
  time?: string;
  msg: string;
  dMsg?: string | null;
  dMem?: string | null;
  mem: string;
  cEnc?: boolean;
  enc: boolean;
  _id: string;
  chat_name?: string;
}
