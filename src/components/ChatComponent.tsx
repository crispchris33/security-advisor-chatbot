import React from "react";

interface ChatComponentProps {
  status: "approved" | "pending" | "none";
}

const ChatComponent: React.FC<ChatComponentProps> = ({ status }) => {
  return (
    <div className="chat-box">
      <h2>Chat Section</h2>
      {status === "approved" ? (
        <p>✅ Welcome! You now have access to the chat.</p>
      ) : status === "pending" ? (
        <p>🚫 Chat is locked. Please contact an admin to request access.</p>
      ) : (
        <p>⚠️ No chat access. Please log in.</p>
      )}
    </div>
  );
};

export default ChatComponent;
