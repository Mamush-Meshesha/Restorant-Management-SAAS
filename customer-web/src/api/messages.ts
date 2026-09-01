import api from "./client";

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
}

export const getConversationsApi = async (): Promise<Conversation[]> => {
  const { data } = await api.get("/message/conversations");
  return data?.data || [];
};

export const startConversationApi = async (targetUserId?: string): Promise<any> => {
  const { data } = await api.post("/message/start", { targetUserId });
  return data?.data;
};

export const getMessagesApi = async (conversationId: string): Promise<ChatMessage[]> => {
  const { data } = await api.get(`/message/${conversationId}`);
  return data?.data || [];
};

export const sendMessageApi = async (conversationId: string, content: string): Promise<ChatMessage> => {
  const { data } = await api.post(`/message/${conversationId}`, { content });
  return data?.data;
};
