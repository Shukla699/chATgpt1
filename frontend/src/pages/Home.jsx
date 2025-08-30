import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  setChats
} from '../store/chatSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  // =======================
  // Create new chat
  // =======================
  const handleNewChat = async (title) => {
    if (!title || typeof title !== 'string') return;

    try {
      const response = await axios.post(
        "https://chatgpt1-tklh.onrender.com/api/chat",
        { title },
        { withCredentials: true }
      );

      const newChat = response.data.chat;
      dispatch(startNewChat(newChat));
      getMessages(newChat._id);   // load messages
      setSidebarOpen(false);
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  // =======================
  // Fetch messages for a chat
  // =======================
  const getMessages = async (chatId) => {
    if (!chatId) return;

    try {
      const response = await axios.get(
        `https://chatgpt1-tklh.onrender.com/api/chat/messages/${chatId}`,
        { withCredentials: true }
      );

      const msgs = response.data.messages.map(m => ({
        type: m.role === 'user' ? 'user' : 'ai',
        content: m.content
      }));

      setMessages(msgs);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // =======================
  // Send user message
  // =======================
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeChatId || isSending) return;

    dispatch(sendingStarted());

    const newMessages = [...messages, { type: 'user', content: trimmed }];
    setMessages(newMessages);
    dispatch(setInput(''));

    socket.emit("ai-message", {
      chat: activeChatId,
      content: trimmed
    });
  };

  // =======================
  // Initialize socket and fetch chats
  // =======================
  useEffect(() => {
    // Fetch all chats
    axios.get("https://chatgpt1-tklh.onrender.com/api/chat", { withCredentials: true })
      .then(res => {
        dispatch(setChats(res.data.chats.reverse()));
      })
      .catch(err => console.error("Error fetching chats:", err));

    // Initialize socket
    const tempSocket = io("https://chatgpt1-tklh.onrender.com", { withCredentials: true });

    tempSocket.on("ai-response", (messagePayload) => {
      setMessages(prev => [...prev, { type: 'ai', content: messagePayload.content }]);
      dispatch(sendingFinished());
    });

    setSocket(tempSocket);

    // Cleanup on unmount
    return () => tempSocket.disconnect();
  }, [dispatch]);

  return (
    <div className="chat-layout minimal">
      <ChatMobileBar
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onNewChat={() => handleNewChat("New Chat")} // default new chat title
      />

      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          dispatch(selectChat(id));
          setSidebarOpen(false);
          getMessages(id);
        }}
        onNewChat={handleNewChat} // pass function that expects string
        open={sidebarOpen}
      />

      <main className="chat-main" role="main">
        {messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="chip">Early Preview</div>
            <h1>ChatGPT Clone</h1>
            <p>
              Ask anything. Paste text, brainstorm ideas, or get quick explanations. 
              Your chats stay in the sidebar so you can pick up where you left off.
            </p>
          </div>
        )}

        <ChatMessages messages={messages} isSending={isSending} />

        {activeChatId && (
          <ChatComposer
            input={input}
            setInput={(v) => dispatch(setInput(v))}
            onSend={sendMessage}
            isSending={isSending}
          />
        )}
      </main>

      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
