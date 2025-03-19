import React, { useState, useEffect } from "react";
import { auth, googleProvider, githubProvider } from "../services/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { checkUserApproval } from "../services/firestore";

const Login = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"approved" | "pending" | "none">("none");

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth state changed:", user);
            setUser(user);

            if (user) {
                console.log(`Checking approval for: ${user.email}`);
                const result = await checkUserApproval(user.email);
                const newStatus = result.status as "approved" | "pending" | "none";
                console.log("Approval check result:", newStatus);
                setStatus(newStatus);
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

    return (
        <div>
            {user ? (
                <>
                    <h2>Welcome, {user.displayName || "User"}</h2>
                    <button onClick={handleLogout}>Logout</button>

                    {status === "approved" ? (
                        <div>✅ Full Access: You can use the chat.</div>
                    ) : status === "pending" ? (
                        <div>⏳ Pending Approval: You can view the portfolio, but chat is locked.</div>
                    ) : (
                        <div>❌ You are not logged in.</div>
                    )}
                </>
            ) : (
                <>
                    <h2>Login</h2>
                    <button onClick={() => handleLogin(googleProvider)}>Login with Google</button>
                    <button onClick={() => handleLogin(githubProvider)}>Login with GitHub</button>
                </>
            )}
        </div>
    );
};

export default Login;
