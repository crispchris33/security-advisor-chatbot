import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserStatus,
  setAdminRole,
  deleteUser,
} from "../services/firestore";
import "./AdminPanel.css";
import ChatManagementModal from "./ChatManagementModal"; 


interface User {
  email: string;
  status: "pending" | "approved" | "disabled";
  isAdmin: boolean;
  chatAllowance: number;
  dateCreated?: any; 
  lastAccessed?: any;  
}

const AdminPanel: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // For searching, sorting, and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<keyof User>("email");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; 

  // Chat Management Modal states
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [tempChatAllowance, setTempChatAllowance] = useState<number>(0);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const userList = await getAllUsers();
      setAllUsers(userList);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Filter by Search
  const filtered = allUsers.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(term) ||
      user.status.toLowerCase().includes(term)
    );
  });

  // Sorting Algos
  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (sortKey === "dateCreated" || sortKey === "lastAccessed") {
      const aSec = aVal ? aVal.seconds : 0;
      const bSec = bVal ? bVal.seconds : 0;
      return sortAsc ? aSec - bSec : bSec - aSec;
    }
    // For string/bool fields
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    if (aStr < bStr) return sortAsc ? -1 : 1;
    if (aStr > bStr) return sortAsc ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentUsers = sorted.slice(startIndex, startIndex + pageSize);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handleSort = (key: keyof User) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleStatusChange = async (email: string, newStatus: User["status"]) => {
    await updateUserStatus(email, newStatus);
    setAllUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, status: newStatus } : u))
    );
    window.dispatchEvent(new Event("refreshApp")); 
  };

  const handleAdminToggle = async (email: string, isAdmin: boolean) => {
    await setAdminRole(email, isAdmin);
    setAllUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, isAdmin } : u))
    );
    window.dispatchEvent(new Event("refreshApp"));
  };

  const handleDeleteUser = async (email: string) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      await deleteUser(email);
      setAllUsers((prev) => prev.filter((u) => u.email !== email));
    }
  };

  //Chat management
  const handleChatManagement = (email: string) => {
    const user = allUsers.find((u) => u.email === email);
    if (!user) return;
    setSelectedEmail(user.email);
    setTempChatAllowance(user.chatAllowance || 0);
    setShowChatModal(true);
  };

  // Close Chat Modal w/out Save
  const closeChatModal = () => {
    setShowChatModal(false);
  };
    
 
  if (loading) return <p>Loading users...</p>;

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      {/* 🔹 Search bar */}
      <div className="admin-search-bar">
        <input
          type="text"
          placeholder="Search email or status..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("email")}>Email</th>
            <th onClick={() => handleSort("status")}>Status</th>
            <th onClick={() => handleSort("isAdmin")}>Admin</th>
            <th>Chat Management</th>
            <th onClick={() => handleSort("dateCreated")}>Date Created</th>
            <th onClick={() => handleSort("lastAccessed")}>Last Accessed</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => {
            const dateCreatedStr = user.dateCreated
              ? new Date(user.dateCreated.seconds * 1000).toLocaleString()
              : "";
            const lastAccessedStr = user.lastAccessed
              ? new Date(user.lastAccessed.seconds * 1000).toLocaleString()
              : "";

            return (
              <tr key={user.email}>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.status}
                    onChange={(e) =>
                      handleStatusChange(user.email, e.target.value as any)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={user.isAdmin}
                    onChange={(e) => handleAdminToggle(user.email, e.target.checked)}
                  />
                </td>
                <td>
                  <button onClick={() => handleChatManagement(user.email)}>
                    ⚙️ Manage
                  </button>
                </td>
                <td>{dateCreatedStr}</td>
                <td>{lastAccessedStr}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user.email)}>
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="admin-pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* RENDER Chat Modal if needed */}
      {showChatModal && (
        <ChatManagementModal
            email={selectedEmail}
            initialChatAllowance={tempChatAllowance}
            onClose={closeChatModal}
            onSaveComplete={(newVal) => {
            // 1) Update the local user state
            setAllUsers((prev) =>
                prev.map((u) =>
                u.email === selectedEmail ? { ...u, chatAllowance: newVal } : u
                )
            );
            // 2) Close the modal
            setShowChatModal(false);
            }}
        />
      )}
    </div>
  );
};

export default AdminPanel;
