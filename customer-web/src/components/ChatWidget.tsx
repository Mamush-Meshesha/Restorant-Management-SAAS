import { useState, useEffect, useRef } from "react";
import { 
  Box, Fab, Paper, Typography, IconButton, TextField, 
  InputAdornment, Stack, Avatar, alpha 
} from "@mui/material";
import { 
  IconMessage, IconX, IconSend, IconMinus 
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../redux/hooks";
import { 
  getConversationsApi, startConversationApi, 
  getMessagesApi, sendMessageApi, ChatMessage, Conversation
} from "../api/messages";

export default function ChatWidget() {
  const { token, profile } = useAppSelector(state => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Load or Create Conversation when opened
  useEffect(() => {
    if (!token) return;
    
    const initChat = async () => {
      try {
        setLoading(true);
        let convs = await getConversationsApi();
        if (convs.length > 0) {
          setConversation(convs[0]);
        } else {
          const newConv = await startConversationApi();
          setConversation(newConv);
        }
      } catch (e) {
        console.error("Failed to init chat", e);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && !conversation) {
      initChat();
    }
  }, [isOpen, conversation, token]);

  // Polling for messages
  useEffect(() => {
    if (!conversation?.id || !isOpen || isMinimized) return;

    const fetchMsgs = async () => {
      try {
        const msgs = await getMessagesApi(conversation.id);
        setMessages(msgs);
      } catch (e) {
        console.error("Failed to fetch messages", e);
      }
    };

    fetchMsgs(); // Initial fetch
    const interval = setInterval(fetchMsgs, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [conversation?.id, isOpen, isMinimized]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !conversation?.id) return;

    const text = input.trim();
    setInput("");

    // Optimistic UI update
    const tempMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: profile?.id || "me",
      text,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await sendMessageApi(conversation.id, text);
      // It will be re-fetched by polling, but we can also manually trigger a fetch here if needed
    } catch (e) {
      console.error("Failed to send message", e);
      // Remove optimistic message on fail
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  if (!token) return null; // Don't show chat if not logged in

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}
          >
            <Fab 
              color="primary" 
              onClick={() => setIsOpen(true)}
              sx={{ 
                width: 64, height: 64, 
                boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                "&:hover": { transform: "scale(1.05)", transition: "0.2s" }
              }}
            >
              <IconMessage size={32} />
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ 
              y: isMinimized ? 420 : 0, 
              opacity: 1, 
              scale: 1 
            }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ 
              position: "fixed", 
              bottom: 24, 
              right: 24, 
              zIndex: 9999,
              transformOrigin: "bottom right"
            }}
          >
            <Paper 
              elevation={24}
              sx={{ 
                width: { xs: "calc(100vw - 48px)", sm: 380 }, 
                height: 520, 
                display: "flex", 
                flexDirection: "column",
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
              }}
            >
              {/* Header */}
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: "primary.main", 
                  color: "white", 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer"
                }}
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha("#fff", 0.2) }}>
                    S
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                      Support Team
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Usually replies in a few minutes
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row">
                  <IconButton size="small" sx={{ color: "white" }}>
                    <IconMinus size={20} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ color: "white" }} 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  >
                    <IconX size={20} />
                  </IconButton>
                </Stack>
              </Box>

              {/* Messages Area */}
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  bgcolor: "grey.50", 
                  p: 2, 
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
                }}
              >
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Conversation Started
                  </Typography>
                </Box>

                {loading ? (
                  <Typography textAlign="center" color="text.secondary">Loading...</Typography>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === profile?.id;
                    return (
                      <Box 
                        key={msg.id} 
                        sx={{ 
                          alignSelf: isMe ? "flex-end" : "flex-start",
                          maxWidth: "85%" 
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{ 
                            p: 1.5, 
                            px: 2,
                            bgcolor: isMe ? "secondary.main" : "white",
                            color: isMe ? "white" : "text.primary",
                            borderRadius: 3,
                            borderBottomRightRadius: isMe ? 4 : 12,
                            borderBottomLeftRadius: !isMe ? 4 : 12,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                          }}
                        >
                          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                            {msg.text}
                          </Typography>
                        </Paper>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: "block", 
                            mt: 0.5, 
                            color: "text.secondary",
                            textAlign: isMe ? "right" : "left",
                            px: 1
                          }}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box 
                component="form" 
                onSubmit={handleSend}
                sx={{ 
                  p: 2, 
                  bgcolor: "white", 
                  borderTop: "1px solid", 
                  borderColor: "divider" 
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  sx={{ 
                    "& .MuiOutlinedInput-root": { borderRadius: 8, pr: 0.5 }
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            type="submit" 
                            color="primary" 
                            disabled={!input.trim()}
                            sx={{ mr: 0.5 }}
                          >
                            <IconSend size={20} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
