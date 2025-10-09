import React, { useState } from "react";
import axios from "axios";
import "./ChatBot.css";

function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! 👋 I’m your assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // User message
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input,
      });

      const botMsg = { sender: "bot", text: res.data.reply || "Sorry, I didn't get that." };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const botMsg = { sender: "bot", text: "⚠️ Error connecting to server." };
      setMessages((prev) => [...prev, botMsg]);
    }

    setInput("");
  };

  return (
    <div className="chatbot-container">
      {!isOpen ? (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      ) : (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <h4>TNR Assistant</h4>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBot;
