// Login.tsx
import React, { useState, useEffect } from "react";
import { auth, googleProvider, githubProvider } from "../services/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { checkUserApproval } from "../services/firestore";
import "./Login.css"; 

const Login = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"approved" | "pending" | "none">("none");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user && user.email) {
        const result = await checkUserApproval(user.email);
        setStatus(result.status as "approved" | "pending" | "none");
      } else {
        setStatus("none");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (provider: any) => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setStatus("none");
  };

  if (loading) return <p>Loading...</p>;

  if (user) {
    // If user is already logged in:
    return (
      <div className="login-container">
        <h2>Welcome, {user.displayName || "User"}</h2>
        <button onClick={handleLogout}>Logout</button>
        {status === "approved" ? (
          <div>✅ Full Access: You can use the chat.</div>
        ) : status === "pending" ? (
          <div>⏳ Pending Approval: You can view the portfolio, but chat is locked.</div>
        ) : (
          <div>❌ You are not logged in.</div>
        )}
      </div>
    );
  }

  // Otherwise, show the improved login screen:
  return (
    <div className="login-container">
      <div className="login-heading">
        <h1 className="login-title">Chris.</h1>
        <h2 className="login-subtitle">Security Chatbot Application &amp; Portfolio</h2>
      </div>
      <div className="login-description-container">
          <div className="login-description">
            <p>
              Login to access:
            </p>
            <ul>
              <li>Portfolio</li>
              <li>Personal Links</li>
              <li>Security Advisor Chatbot</li>
              <li>Contact Chris</li>
            </ul>
          </div>
      </div>

      <div className="login-buttons">
        <button onClick={() => handleLogin(googleProvider)}>Login with Google</button>
        <button onClick={() => handleLogin(githubProvider)}>Login with GitHub</button>
      </div>

      <div className="login-disclaimer">
        <p>
          This site uses third-party authentication. <br />
          We do not store any personal credentials.
        </p>
        <p>
          &copy; {new Date().getFullYear()} Chris S. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
