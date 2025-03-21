import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore"; 
import { db } from "./services/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./services/firebase";
import { checkUserApproval } from "./services/firestore";
import Login from "./components/Login";
import ChatComponent from "./components/ChatComponent";
import AdminPanel from "./components/AdminPanel";
import "./App.css";

const App = () => {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<"approved" | "pending" | "none">("none");
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    useEffect(() => {
      setLoading(true);
    
      // Subscribe to Firebase Auth state
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        console.log("🔄 Auth state changed:", user);
        setUser(user);
    
        // We'll create this variable so we can unsubscribe from user doc snapshot later:
        let unsubscribeUserDoc: (() => void) | null = null;
    
        if (user?.email) {
          // 1️⃣ Do the initial check
          console.log("🔍 Checking approval for:", user.email);
          const result = await checkUserApproval(user.email);
          console.log("✅ Approval check result:", result);
    
          setStatus(result.status);
          setIsAdmin(result.isAdmin || false);
    
          // 2️⃣ Set up real-time listener (onSnapshot) for the user's doc
          const userRef = doc(db, "users", user.email);
          unsubscribeUserDoc = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              // Update status & admin in real time
              setStatus(data.status);
              setIsAdmin(data.isAdmin || false);
            }
          });
        } else {
          // User is null or no email → no doc to monitor
          setStatus("none");
          setIsAdmin(false);
        }
    
        setLoading(false);
        console.log("🚀 App loading complete");
    
        // Clean up the user doc snapshot if user logs out or changes
        return () => {
          if (unsubscribeUserDoc) {
            unsubscribeUserDoc();
          }
        };
      });
    
      // Cleanup the Auth state listener
      return () => {
        unsubscribeAuth();
      };
    }, []);
    
  

    if (loading) return <p>Loading...</p>;

    return (
        <div className="main-app-container">
            {user ? (
                <>
                    <div className="header">
                        <h2>Welcome, {user.displayName || "User"}</h2>

                        <div>
                          {isAdmin && (
                            <button onClick={() => setShowAdminPanel(!showAdminPanel)}>
                              ⚙️ Admin Panel
                            </button>
                          )}
                          <button onClick={() => signOut(auth)}>Logout</button>
                        </div>
                    </div>

                    <div className="content">
                        {/* Portfolio Section (Visible to all) */}
                        <div className="portfolio">
                          <h2 className="portfolio-name">Chris Satterfield</h2>
                          
                          <div className="portfolio-pic-container">
                            {/* Example local image in /public folder */}
                            <img
                              src="/chris_pic.jpg"
                              alt="Chris Profile"
                              className="profile-pic"
                            />
                          </div>

                          <div className="portfolio-links">
                            <h3>Links</h3>
                            <ul>
                            <li>💼 <a href="https://www.linkedin.com/in/chris-satterfield/" target="_blank">LinkedIn</a></li>
                            <li>🐙 <a href="https://github.com/crispchris33" target="_blank">GitHub</a></li>
                            <li>📄 <a href="https://drive.google.com/file/d/179XkwKNqBXAtaIToHzAV-MUSq-jIqVAk/view?usp=sharing" target="_blank">Resume</a></li>
                            <li>🧩 <a href="https://leetcode.com/u/crispchris33/" target="_blank">LeetCode</a></li>
                            <li>✉️ <a href="mailto:chrissatterfield@live.com" target="_blank">Email</a> / <a href="https://wa.me/+16789360425" target="_blank">WhatsApp</a></li>
                            </ul>
                          </div>
                        </div>

                        {/* Chat Section (Only for Approved Users) */}
                        <div className="chat">
                            <ChatComponent status={status} />
                        </div>
                    </div>

                    {/* 🔹 Admin Panel Modal (Properly Positioned) */}
                    {showAdminPanel && (
                        <div className="modal-overlay">
                            <div className="admin-modal-content">
                              <div className="admin-modal-container">
                                <button className="close-btn" onClick={() => setShowAdminPanel(false)}>❌ Close</button>
                                <AdminPanel />
                            </div>
                          </div>
                        </div>
                    )}
                </>
            ) : (
                <Login />
            )}
        </div>
    );
};

export default App;
