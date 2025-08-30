import React, { useState } from 'react';
import { Plus, MessageSquare } from "lucide-react"; // icon lib
import './ChatSidebar.css';

const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, open }) => {
  const [newChatTitle, setNewChatTitle] = useState("");

  const handleAddChat = () => {
    const title = newChatTitle.trim();
    if (!title) return; // ignore empty input
    onNewChat(title);    // call parent handler
    setNewChatTitle(""); // clear input
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") handleAddChat();
  };

  return (
    <aside className={"chat-sidebar " + (open ? 'open' : '')} aria-label="Previous chats">
      
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h2>
          <MessageSquare size={18} /> Chats
        </h2>
      </div>

      {/* New Chat Input */}
      <div className="new-chat-input">
        <input
          type="text"
          value={newChatTitle}
          onChange={(e) => setNewChatTitle(e.target.value)}
          onKeyDown={handleEnterKey}
          placeholder="Enter chat title..."
        />
        <button className="small-btn" onClick={handleAddChat}>
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Chat List */}
      <nav className="chat-list" aria-live="polite">
        {chats.map((c) => (
          <button
            key={c._id}
            className={"chat-list-item " + (c._id === activeChatId ? "active" : "")}
            onClick={() => onSelectChat(c._id)}
            aria-current={c._id === activeChatId ? "true" : "false"}
          >
            <span className="title-line">{c.title || "Untitled Chat"}</span>
            {c.lastMessage && (
              <span className="meta-line">
                {c.lastMessage.length > 30 ? c.lastMessage.slice(0,30) + "..." : c.lastMessage}
              </span>
            )}
            {c.updatedAt && (
              <span className="time-line">
                {new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </button>
        ))}

        {/* Empty State */}
        {chats.length === 0 && (
          <p className="empty-hint">
            💬 No chats yet. <br /> Start a new conversation!
          </p>
        )}
      </nav>
    </aside>
  );
};

export default ChatSidebar;
