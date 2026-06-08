import type { AxiosResponse } from "axios";
import api from ".";

export interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export const getConversations = (): Promise<AxiosResponse<{ data: Conversation[] }>> =>
  api.get("/message/conversations");

export const getMessages = (conversationId: string): Promise<AxiosResponse<{ data: Message[] }>> =>
  api.get(`/message/${conversationId}`);

export const sendMessage = (conversationId: string, content: string): Promise<AxiosResponse<{ data: Message }>> =>
  api.post(`/message/${conversationId}`, { content });

export const startConversation = (targetUserId: string): Promise<AxiosResponse<{ data: Conversation }>> =>
  api.post("/message/start", { targetUserId });
