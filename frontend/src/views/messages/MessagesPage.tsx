import React, { useState } from "react";
import {
  Box, Card, Typography, Stack, Divider, Avatar,
  TextField, InputAdornment, IconButton, Chip, List,
  ListItemAvatar, ListItemText, ListItemButton, Badge, alpha,
  Paper, Button, Tooltip, CircularProgress, Dialog, DialogTitle, DialogContent, ListItem
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  IconSearch, IconSend, IconDotsVertical, IconPaperclip,
  IconMoodSmile, IconMailbox, IconArrowLeft, IconCirclePlus,
} from "@tabler/icons-react";
import { useAppSelector } from "@/hooks/auth";

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

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data.filter(u => u.id !== myId));
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    getConversations().then(res => setConversations(res.data.data)).catch(console.error);
  }, []);

  React.useEffect(() => {
    if (activeId) {
      getMessages(activeId).then(res => setMessages(res.data.data)).catch(console.error);
      const interval = setInterval(() => {
        getMessages(activeId).then(res => setMessages(res.data.data)).catch(console.error);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeId]);

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

  return (
    <Box sx={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconMailbox size={22} color={theme.palette.primary.main} />
        <Typography variant="h5" fontWeight={700}>Messages</Typography>
        {totalUnread > 0 && (
          <Chip label={`${totalUnread} unread`} color="error" size="small" sx={{ fontWeight: 600 }} />
        )}
      </Stack>

      <Box sx={{ flex: 1, display: "flex", gap: 2, overflow: "hidden", minHeight: 0 }}>
        {/* ── Sidebar ── */}
        <Card
          sx={{
            width: { xs: mobileShowConv ? 0 : "100%", md: 320 },
            flexShrink: 0,
            borderRadius: 3,
            overflow: "hidden",
            display: { xs: mobileShowConv ? "none" : "flex", md: "flex" },
            flexDirection: "column",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Search */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={16} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
            />
          </Box>

          {/* Conversation list */}
          <List disablePadding sx={{ flex: 1, overflowY: "auto" }}>
            {filtered.map((conv) => (
              <React.Fragment key={conv.id}>
                <ListItemButton
                  selected={activeId === conv.id}
                  onClick={() => handleOpen(conv.id)}
                  sx={{
                    px: 2, py: 1.5,
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderRight: `3px solid ${theme.palette.primary.main}`,
                    },
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 48 }}>
                    <Badge
                      variant="dot"
                      color="success"
                      invisible={!conv.online}
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    >
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          fontSize: "0.85rem",
                          bgcolor: theme.palette.primary.main,
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(conv.name)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    disableTypography
                    primary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ maxWidth: 130 }}>
                          {conv.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                          {formatTime(conv.lastTime)}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
                          {conv.lastMessage}
                        </Typography>
                        {conv.unread > 0 && (
                          <Chip
                            label={conv.unread}
                            color="error"
                            size="small"
                            sx={{ height: 18, fontSize: "0.7rem", minWidth: 18, "& .MuiChip-label": { px: 0.75 } }}
                          />
                        )}
                      </Stack>
                    }
                  />
                </ListItemButton>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>

          {/* New conversation button */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<IconCirclePlus size={16} />}
              sx={{ borderRadius: 2, textTransform: "none" }}
              onClick={() => {
                fetchUsers();
                setNewConvOpen(true);
              }}
            >
              New Conversation
            </Button>
          </Box>
        </Card>

        {/* ── Chat Area ── */}
        {active ? (
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            {/* Chat header */}
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <IconButton
                sx={{ display: { md: "none" }, mr: 0.5 }}
                size="small"
                onClick={() => setMobileShowConv(false)}
              >
                <IconArrowLeft size={18} />
              </IconButton>
              <Badge
                variant="dot"
                color="success"
                invisible={!active.online}
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              >
                <Avatar
                  sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, fontSize: "0.8rem", fontWeight: 700 }}
                >
                  {getInitials(active.name)}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>{active.name}</Typography>
                <Typography variant="caption" color={active.online ? "success.main" : "text.secondary"}>
                  {active.online ? "● Online" : "● Offline"}
                </Typography>
              </Box>
              <Tooltip title="Options">
                <IconButton size="small">
                  <IconDotsVertical size={18} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-thumb": { bgcolor: theme.palette.divider, borderRadius: 4 },
              }}
            >
              {messages.map((msg) => {
                const isMe = msg.senderId === myId;
                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      alignItems: "flex-end",
                      gap: 1,
                    }}
                  >
                    {!isMe && (
                      <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main, fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                        {getInitials(active.name)}
                      </Avatar>
                    )}
                    <Box sx={{ maxWidth: "72%" }}>
                      <Paper
                        elevation={0}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          bgcolor: isMe ? theme.palette.primary.main : theme.palette.background.paper,
                          color: isMe ? "white" : "text.primary",
                          border: isMe ? "none" : `1px solid ${theme.palette.divider}`,
                          boxShadow: "none",
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.5, wordBreak: "break-word" }}>
                          {msg.text}
                        </Typography>
                      </Paper>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.25, textAlign: isMe ? "right" : "left", px: 0.5 }}
                      >
                        {formatTime(msg.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Attach file">
                  <IconButton size="small" sx={{ color: "text.secondary" }}>
                    <IconPaperclip size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Emoji">
                  <IconButton size="small" sx={{ color: "text.secondary" }}>
                    <IconMoodSmile size={18} />
                  </IconButton>
                </Tooltip>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Message ${active.name}…`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  multiline
                  maxRows={3}
                  InputProps={{ sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.6) } }}
                />
                <IconButton
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "white",
                    borderRadius: 2,
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    "&:hover": { bgcolor: theme.palette.primary.dark },
                    "&:disabled": { bgcolor: theme.palette.divider },
                    transition: "all 0.2s",
                  }}
                >
                  {sending ? <CircularProgress size={16} color="inherit" /> : <IconSend size={16} />}
                </IconButton>
              </Stack>
            </Box>
          </Card>
        ) : (
          /* Empty state */
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              display: { xs: "none", md: "flex" },
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconMailbox size={36} color={theme.palette.primary.main} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight={700}>Your messages</Typography>
              <Typography variant="body2" color="text.secondary">
                Select a conversation on the left to start chatting.
              </Typography>
            </Box>
          </Card>
        )}
      </Box>

      {/* New Conversation Dialog */}
      <Dialog open={newConvOpen} onClose={() => setNewConvOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <List disablePadding>
            {users.length === 0 ? (
              <ListItem>
                <ListItemText primary="No users found" secondary="Try again later" />
              </ListItem>
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
                  sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36, fontSize: "0.85rem" }}>
                      {getInitials(`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username}
                    secondary={user.role?.name || "User"}
                    primaryTypographyProps={{ fontWeight: 600, variant: 'subtitle2' }}
                  />
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
