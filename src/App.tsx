import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./services/firebase";
import { checkUserApproval } from "./services/firestore";
import Login from "./components/Login";
import ChatComponent from "./components/ChatComponent"; // Ensure correct path
import "./App.css";

const App = () => {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<"approved" | "pending" | "none">("none");
    const [loading, setLoading] = useState(true); // ✅ Ensure loading is set properly

    useEffect(() => {
        setLoading(true); // ✅ Ensure loading is set before checking
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth state changed:", user);
            setUser(user);

            if (user) {
                console.log(`Checking approval for: ${user.email}`);
                const result = await checkUserApproval(user.email);
                const newStatus = result.status as "approved" | "pending" | "none";
                console.log("✅ Approval check result:", newStatus);
                setStatus(newStatus);
            } else {
                setStatus("none");
            }
            setLoading(false); // ✅ Loading should stop after state update
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="container">
            {user ? (
                <>
                    <div className="header">
                        <h2>Welcome, {user.displayName || "User"}</h2>
                        <button onClick={() => signOut(auth)}>Logout</button>
                    </div>

                    <div className="content">
                        {/* Portfolio Section (Visible to all) */}
                        <div className="portfolio">
                            <h2>Portfolio Section</h2>
                            <p>Visible to all users, including unapproved users.</p>
                        </div>

                        {/* Chat Section (Only for Approved Users) */}
                        <div className="chat">
                            <ChatComponent status={status} />
                        </div>
                    </div>
                </>
            ) : (
                <Login />
            )}
        </div>
    );
};

export default App;
