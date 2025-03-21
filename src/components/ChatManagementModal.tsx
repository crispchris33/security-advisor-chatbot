import React, { useState } from "react";
import { updateChatAllowance } from "../services/firestore";
import "./ChatManagementModal.css";

interface ChatManagementModalProps {
  email: string;
  initialChatAllowance: number;
  onClose: () => void;
  onSaveComplete: (newVal: number) => void;
}

const ChatManagementModal: React.FC<ChatManagementModalProps> = ({
  email,
  initialChatAllowance,
  onClose,
  onSaveComplete,
}) => {
  const [tempChatAllowance, setTempChatAllowance] = useState(initialChatAllowance);

  // Handle saving to Firestore + local parent
  const handleSave = async () => {
    await updateChatAllowance(email, tempChatAllowance);
    onSaveComplete(tempChatAllowance);
  };

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal-content">
        <h2>Chat Management</h2>
        <p>
          Email: <strong>{email}</strong>
        </p>

        <label htmlFor="chatAllowanceInput">Chat Allowance: </label>
        <input
          id="chatAllowanceInput"
          type="number"
          value={tempChatAllowance}
          onChange={(e) => setTempChatAllowance(Number(e.target.value))}
        />

        <div className="chat-modal-buttons">
          <button onClick={onClose}>Close</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ChatManagementModal;
