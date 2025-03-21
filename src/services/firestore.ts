import { db } from "./firebase";
import { 
    collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot 
} from "firebase/firestore";

// Firestore user document structure
interface UserDocument {
    email: string;
    isAdmin: boolean;
    chatAllowance: number;
    status: "pending" | "approved" | "disabled";
    dateCreated: any;  
    lastAccessed: any;  
}

// Fetch all users for the Admin Panel
export const getAllUsers = async (): Promise<UserDocument[]> => {
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);

    return usersSnap.docs.map(doc => doc.data() as UserDocument);
};

// Check User Approval (called on login)
export const checkUserApproval = async (email: string): Promise<{ status: "pending" | "approved" | "none"; isAdmin: boolean }> => {
    if (!email) return { status: "none", isAdmin: false };

    const userRef = doc(db, "users", email);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        // Update lastAccessed timestamp
        await updateDoc(userRef, { lastAccessed: serverTimestamp() });

        const userData = userSnap.data() as UserDocument;

        return {
            status: userData.status as "pending" | "approved" | "none" || "pending",
            isAdmin: userData.isAdmin || false,
        };
    } else {
        // New user → Add them as "pending"
        const newUser: UserDocument = {
            email,
            isAdmin: false,
            chatAllowance: 5,
            status: "pending",
            dateCreated: serverTimestamp(),
            lastAccessed: serverTimestamp(),
        };

        await setDoc(userRef, newUser);

        return { status: "pending", isAdmin: false };
    }
};


// Update User Status (Pending, Approved, Disabled)
export const updateUserStatus = async (email: string, newStatus: "pending" | "approved" | "disabled") => {
    const userRef = doc(db, "users", email);
    await updateDoc(userRef, { status: newStatus });
};

// Assign or Remove Admin Role
export const setAdminRole = async (email: string, isAdmin: boolean) => {
    const userRef = doc(db, "users", email);
    await updateDoc(userRef, { isAdmin });
};

// Delete User from Firestore
export const deleteUser = async (email: string) => {
    const userRef = doc(db, "users", email);
    await deleteDoc(userRef);
};

// Update Chat Allowance
export async function updateChatAllowance(email: string, newVal: number) {
    const userRef = doc(db, "users", email);
    await updateDoc(userRef, { chatAllowance: newVal });
  }

// Real-time listener for user updates
export const subscribeToUserUpdates = (email: string, callback: (user: any) => void) => {
    const userRef = doc(db, "users", email);
    
    return onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
            console.log("🔄 User data updated:", snapshot.data());
            callback(snapshot.data());
        }
    });
};