import React, { useState, useRef, useEffect } from "react";
import {
  Box, Card, Typography, Stack, Divider, Avatar,
  TextField, InputAdornment, IconButton, Chip, List,
  ListItemAvatar, ListItemText, ListItemButton, Badge, alpha,
  Paper, Button, Tooltip, CircularProgress, Dialog, DialogTitle, DialogContent, ListItem,
  Menu, MenuItem, Popover, Grid, ListItemIcon
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  IconSearch, IconSend, IconDotsVertical, IconPaperclip,
  IconMoodSmile, IconMailbox, IconArrowLeft, IconCirclePlus,
  IconMessageCircle, IconUser, IconBellOff, IconTrash
} from "@tabler/icons-react";
import { useAppSelector } from "@/hooks/auth";
import { motion, AnimatePresence } from "framer-motion";

import {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
} from "../../api/_messages";
import type { Conversation, Message } from "../../api/_messages";
import { getUsers } from "../../api/_users";
import type { User } from "@/types/__auth";

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ─── Component ────────────────────────────────────────────────────────────────

const MessagesPage = () => {
  const theme = useTheme();
  const { currentUser } = useAppSelector((s) => s.auth);
  const myId = currentUser?.id ?? "me";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileShowConv, setMobileShowConv] = useState(false);
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgLength = useRef(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [emojiAnchor, setEmojiAnchor] = useState<null | HTMLElement>(null);

  const COMMON_EMOJIS = ["😀", "😂", "🥰", "😎", "🤔", "🥺", "😭", "🔥", "❤️", "👍", "🙏", "🎉", "✨", "💯", "🙌", "👀", "🍕", "🥂", "🎈", "👋", "🥳", "😇", "💡", "✅"];

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data.filter(u => u.id !== myId));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getConversations().then(res => setConversations(res.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (activeId) {
      getMessages(activeId).then(res => setMessages(res.data.data)).catch(console.error);
      const interval = setInterval(() => {
        getMessages(activeId).then(res => setMessages(res.data.data)).catch(console.error);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeId]);

  // Scroll to bottom only when new messages are added
  useEffect(() => {
    if (messages.length > prevMsgLength.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
    prevMsgLength.current = messages.length;
  }, [messages]);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const filtered = conversations.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (id: string) => {
    setActiveId(id);
    setMobileShowConv(true);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeId) return;
    setSending(true);
    try {
      const { data } = await sendMessage(activeId, newMessage.trim());
      setMessages(prev => [...prev, data.data]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, lastMessage: data.data.text, lastTime: data.data.timestamp }
            : c
        )
      );
      setNewMessage("");
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  // Common glassmorphism styles
  const glassStyle = {
    backdropFilter: "blur(20px)",
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.05)}`,
  };

  return (
    <Box 
      sx={{ 
        flex: 1,
        minHeight: 0,
        display: "flex", 
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        overscrollBehavior: "none",
        // Subtle animated mesh background
        "&::before": {
          content: '""',
          position: "absolute",
          top: -100, left: -100, right: -100, bottom: -100,
          background: `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 40%),
                       radial-gradient(circle at 90% 80%, ${alpha(theme.palette.info.main, 0.05)} 0%, transparent 40%)`,
          zIndex: -1,
          animation: "pulse 15s ease-in-out infinite alternate",
        },
        "@keyframes pulse": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.1)" }
        }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3, px: { xs: 1, md: 0 } }}>
        <Box 
          sx={{ 
            p: 1.2, 
            borderRadius: 2, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "white",
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            display: "flex"
          }}
        >
          <IconMessageCircle size={24} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>Messages</Typography>
          <Typography variant="body2" color="text.secondary">Connect with your team and customers</Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        {totalUnread > 0 && (
          <Chip 
            label={`${totalUnread} new`} 
            color="primary" 
            size="small" 
            sx={{ fontWeight: 600, px: 1, borderRadius: 2 }} 
          />
        )}
      </Stack>

      <Box sx={{ flex: 1, display: "flex", gap: 3, overflow: "hidden", minHeight: 0 }}>
        {/* ── Sidebar ── */}
        <Card
          sx={{
            width: { xs: mobileShowConv ? 0 : "100%", md: 360 },
            flexShrink: 0,
            borderRadius: 4,
            overflow: "hidden",
            display: { xs: mobileShowConv ? "none" : "flex", md: "flex" },
            flexDirection: "column",
            ...glassStyle,
          }}
        >
          {/* Search */}
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 3, 
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  "&:hover": { bgcolor: alpha(theme.palette.background.default, 0.8) },
                  "&.Mui-focused": { bgcolor: theme.palette.background.paper, boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}` }
                },
              }}
            />
          </Box>

          {/* Conversation list */}
          <List disablePadding sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
            <AnimatePresence>
              {filtered.map((conv, index) => {
                const isActive = activeId === conv.id;
                return (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <ListItemButton
                      selected={isActive}
                      onClick={() => handleOpen(conv.id)}
                      sx={{
                        borderRadius: 3,
                        mb: 0.5,
                        px: 2, 
                        py: 2,
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0, top: "20%", bottom: "20%", width: 4,
                          bgcolor: theme.palette.primary.main,
                          borderRadius: "0 4px 4px 0",
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? "scaleY(1)" : "scaleY(0)",
                          transition: "all 0.2s ease"
                        },
                        "&.Mui-selected": {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                        },
                        "&:hover": { 
                          bgcolor: alpha(theme.palette.action.hover, 0.5),
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 54 }}>
                        <Badge
                          variant="dot"
                          color="success"
                          invisible={!conv.online}
                          overlap="circular"
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                          sx={{ "& .MuiBadge-badge": { border: `2px solid ${theme.palette.background.paper}`, width: 12, height: 12, borderRadius: "50%" } }}
                        >
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              fontSize: "1rem",
                              background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                              color: "white",
                              fontWeight: 700,
                              boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                          >
                            {getInitials(conv.name)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        disableTypography
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight={isActive ? 700 : 600} noWrap sx={{ maxWidth: 140, color: isActive ? theme.palette.primary.main : "text.primary" }}>
                              {conv.name}
                            </Typography>
                            <Typography variant="caption" fontWeight={conv.unread > 0 ? 700 : 400} color={conv.unread > 0 ? "primary.main" : "text.secondary"} sx={{ flexShrink: 0 }}>
                              {formatTime(conv.lastTime)}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color={conv.unread > 0 ? "text.primary" : "text.secondary"} fontWeight={conv.unread > 0 ? 600 : 400} noWrap sx={{ maxWidth: 150 }}>
                              {conv.lastMessage}
                            </Typography>
                            {conv.unread > 0 && (
                              <Box
                                sx={{
                                  bgcolor: theme.palette.primary.main,
                                  color: "white",
                                  fontSize: "0.65rem",
                                  fontWeight: 800,
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 10,
                                  boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.3)}`
                                }}
                              >
                                {conv.unread}
                              </Box>
                            )}
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </List>

          {/* New conversation button */}
          <Box sx={{ p: 2.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<IconCirclePlus size={18} />}
              sx={{ 
                borderRadius: 3, 
                py: 1.2,
                textTransform: "none", 
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                "&:hover": {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                  transform: "translateY(-1px)"
                }
              }}
              onClick={() => {
                fetchUsers();
                setNewConvOpen(true);
              }}
            >
              Start New Chat
            </Button>
          </Box>
        </Card>

        {/* ── Chat Area ── */}
        {active ? (
          <Card
            sx={{
              flex: 1,
              borderRadius: 4,
              display: "flex",
              flexDirection: "column",
              ...glassStyle,
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            {/* Chat header */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
                zIndex: 10,
              }}
            >
              <IconButton
                sx={{ display: { md: "none" }, mr: -1 }}
                onClick={() => setMobileShowConv(false)}
              >
                <IconArrowLeft size={20} />
              </IconButton>
              <Badge
                variant="dot"
                color="success"
                invisible={!active.online}
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                sx={{ "& .MuiBadge-badge": { border: `2px solid ${theme.palette.background.paper}`, width: 12, height: 12, borderRadius: "50%" } }}
              >
                <Avatar
                  sx={{ 
                    width: 46, height: 46, 
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                    fontSize: "1rem", fontWeight: 700, color: "white",
                    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  {getInitials(active.name)}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>{active.name}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: active.online ? "success.main" : "text.disabled" }} />
                  <Typography variant="caption" fontWeight={500} color={active.online ? "success.main" : "text.secondary"}>
                    {active.online ? "Online now" : "Offline"}
                  </Typography>
                </Stack>
              </Box>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Options">
                  <IconButton 
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5), "&:hover": { bgcolor: alpha(theme.palette.action.hover, 1) } }}
                  >
                    <IconDotsVertical size={20} />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 3,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => setAnchorEl(null)} sx={{ py: 1.5, borderRadius: 2, mx: 1 }}>
                    <ListItemIcon><IconUser size={18} /></ListItemIcon>
                    View Profile
                  </MenuItem>
                  <MenuItem onClick={() => setAnchorEl(null)} sx={{ py: 1.5, borderRadius: 2, mx: 1 }}>
                    <ListItemIcon><IconBellOff size={18} /></ListItemIcon>
                    Mute Notifications
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={() => setAnchorEl(null)} sx={{ py: 1.5, borderRadius: 2, mx: 1, color: "error.main", "& .MuiListItemIcon-root": { color: "error.main" } }}>
                    <ListItemIcon><IconTrash size={18} /></ListItemIcon>
                    Clear Chat
                  </MenuItem>
                </Menu>
              </Stack>
            </Box>

            {/* Messages */}
            <Box
              ref={scrollContainerRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                overscrollBehavior: "contain",
                p: { xs: 2, md: 4 },
                display: "flex",
                flexDirection: "column",
                gap: 2,
                bgcolor: alpha(theme.palette.background.default, 0.4),
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": { bgcolor: alpha(theme.palette.divider, 0.5), borderRadius: 10 },
              }}
            >
              <AnimatePresence>
                {messages.map((msg) => {
                  const isMe = msg.senderId === myId;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        alignItems: "flex-end",
                        gap: 12,
                      }}
                    >
                      {!isMe && (
                        <Avatar sx={{ width: 32, height: 32, background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`, fontSize: "0.75rem", fontWeight: 700, flexShrink: 0, mb: 2 }}>
                          {getInitials(active.name)}
                        </Avatar>
                      )}
                      <Box sx={{ maxWidth: { xs: "85%", md: "70%" } }}>
                        <Paper
                          elevation={0}
                          sx={{
                            px: 2.5,
                            py: 1.5,
                            borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                            background: isMe 
                              ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` 
                              : alpha(theme.palette.background.paper, 0.9),
                            color: isMe ? "white" : "text.primary",
                            border: isMe ? "none" : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            boxShadow: isMe ? `0 4px 15px ${alpha(theme.palette.primary.main, 0.2)}` : `0 4px 15px ${alpha(theme.palette.common.black, 0.02)}`,
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <Typography variant="body1" sx={{ lineHeight: 1.6, wordBreak: "break-word" }}>
                            {msg.text}
                          </Typography>
                        </Paper>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5, textAlign: isMe ? "right" : "left", px: 1, fontWeight: 500 }}
                        >
                          {formatTime(msg.timestamp)}
                        </Typography>
                      </Box>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  pr: 1.5,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.background.default, 0.8),
                  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  transition: "all 0.2s ease",
                  "&:focus-within": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: theme.palette.background.paper,
                  }
                }}
              >
                <Tooltip title="Attach file">
                  <IconButton size="small" sx={{ color: "text.secondary", "&:hover": { color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
                    <IconPaperclip size={20} />
                  </IconButton>
                </Tooltip>
                <TextField
                  fullWidth
                  placeholder={`Message ${active.name}…`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  multiline
                  maxRows={4}
                  variant="standard"
                  InputProps={{ 
                    disableUnderline: true,
                    sx: { py: 1, px: 1, fontSize: "0.95rem" } 
                  }}
                />
                <Tooltip title="Emoji">
                  <IconButton 
                    size="small" 
                    onClick={(e) => setEmojiAnchor(e.currentTarget)}
                    sx={{ color: "text.secondary", "&:hover": { color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                  >
                    <IconMoodSmile size={20} />
                  </IconButton>
                </Tooltip>
                
                {/* Emoji Popover */}
                <Popover
                  open={Boolean(emojiAnchor)}
                  anchorEl={emojiAnchor}
                  onClose={() => setEmojiAnchor(null)}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  PaperProps={{
                    sx: {
                      p: 2,
                      mb: 1,
                      width: 260,
                      borderRadius: 4,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.95),
                      backdropFilter: "blur(20px)"
                    }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: "text.secondary" }}>Common Emojis</Typography>
                  <Grid container spacing={1}>
                    {COMMON_EMOJIS.map(emoji => (
                      <Grid item xs={2} key={emoji} sx={{ display: "flex", justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setNewMessage(prev => prev + emoji);
                            setEmojiAnchor(null);
                          }}
                          sx={{ 
                            fontSize: "1.2rem", 
                            width: 36, height: 36,
                            transition: "all 0.15s ease",
                            "&:hover": { transform: "scale(1.25)", bgcolor: alpha(theme.palette.primary.main, 0.1) }
                          }}
                        >
                          {emoji}
                        </IconButton>
                      </Grid>
                    ))}
                  </Grid>
                </Popover>

                <motion.div whileTap={{ scale: 0.9 }}>
                  <IconButton
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      color: "white",
                      borderRadius: "50%",
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                      "&:hover": { 
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                        boxShadow: `0 6px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                      "&:disabled": { background: theme.palette.divider, boxShadow: "none", color: alpha(theme.palette.common.white, 0.5) },
                      transition: "all 0.2s",
                    }}
                  >
                    {sending ? <CircularProgress size={20} color="inherit" /> : <IconSend size={20} style={{ marginLeft: 2 }} />}
                  </IconButton>
                </motion.div>
              </Paper>
            </Box>
          </Card>
        ) : (
          /* Premium Empty State */
          <Card
            sx={{
              flex: 1,
              borderRadius: 4,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              display: { xs: "none", md: "flex" },
              position: "relative",
              ...glassStyle,
              bgcolor: alpha(theme.palette.background.paper, 0.4),
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}
            >
              <Box sx={{ position: "relative", mb: 4 }}>
                {/* Animated pulsing rings */}
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
                    style={{
                      position: "absolute", top: "50%", left: "50%",
                      width: 100, height: 100, marginLeft: -50, marginTop: -50,
                      borderRadius: "50%",
                      border: `2px solid ${theme.palette.primary.main}`,
                    }}
                  />
                ))}
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <IconMessageCircle size={48} color="white" />
                </Box>
              </Box>
              
              <Typography variant="h5" fontWeight={800} sx={{ mb: 1, color: "text.primary" }}>
                Welcome to Messages
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300, textAlign: "center", lineHeight: 1.6 }}>
                Select a conversation from the sidebar or start a new chat to connect with your team.
              </Typography>
            </motion.div>
          </Card>
        )}
      </Box>

      {/* New Conversation Dialog */}
      <Dialog 
        open={newConvOpen} 
        onClose={() => setNewConvOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: "blur(20px)",
            boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.15)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          }
        }}
      >
        <DialogTitle component="div" sx={{ pb: 1, pt: 3, px: 3 }}>
          <Typography variant="h5" fontWeight={700}>Start New Chat</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Select a team member to begin messaging</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, mt: 1 }}>
          <List disablePadding sx={{ pb: 2 }}>
            {users.length === 0 ? (
              <Box sx={{ p: 5, textAlign: "center" }}>
                <IconMailbox size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <Typography variant="h6" color="text.secondary">No users found</Typography>
              </Box>
            ) : (
              users.map(user => (
                <ListItemButton 
                  key={user.id} 
                  onClick={async () => {
                    setNewConvOpen(false);
                    try {
                      const res = await startConversation(user.id);
                      getConversations().then(r => setConversations(r.data.data)).catch(console.error);
                      setActiveId(res.data.data.id);
                      setMobileShowConv(true);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  sx={{ 
                    px: 3, 
                    py: 2, 
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                    transition: "all 0.2s ease",
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05), paddingLeft: 4 }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`, 
                      width: 44, height: 44, fontSize: "1rem", fontWeight: 700,
                      boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.2)}`
                    }}>
                      {getInitials(`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username}
                    secondary={user.role?.name || "User"}
                    primaryTypographyProps={{ fontWeight: 700, variant: 'subtitle1' }}
                    secondaryTypographyProps={{ mt: 0.25 }}
                  />
                  <IconArrowLeft style={{ transform: "rotate(180deg)", opacity: 0.3 }} />
                </ListItemButton>
              ))
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MessagesPage;
