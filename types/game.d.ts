import { Socket } from "socket.io-client";
import { DataItem } from "./types";

export interface CardData extends DataItem {
  guessedFrom: number;
  selected: boolean;
}

export interface Player {
  username: string;
  score: number;
  user_id: number;
}

export type GameContexType = {
  gameState: ClientGameState;
};

export type SocketContextType = {
  socket: ClientGameState;
};

export type ServerGameState = {
  turn: number;
  cardDeck: CardData[];
};

export type ServerLobby = {
  name: string;
  owner: number; // User_id
  players: Set<Player>;
  gameState: ServerGameState;
};

export interface ClientGameState extends ServerGameState {
  username: string;
  user_id: number;
}
