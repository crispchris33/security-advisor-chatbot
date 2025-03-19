import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase"; // Ensure firebase.ts correctly initializes Firebase

// 🔹 Check if user is approved
export const checkUserApproval = async (email: string | null) => {
    if (!email) {
        console.error("No email provided for approval check.");
        return { status: "none" };
    }

    try {
        const approvedRef = doc(db, "approved_users", email);
        const approvedDoc = await getDoc(approvedRef);

        if (approvedDoc.exists()) {
            console.log(`User ${email} is APPROVED.`);
            return { status: "approved" };
        }

        const pendingRef = doc(db, "pending_users", email);
        const pendingDoc = await getDoc(pendingRef);

        if (pendingDoc.exists()) {
            console.log(`User ${email} is PENDING approval.`);
            return { status: "pending" };
        }

        console.warn(`User ${email} is NEW. Adding to pending list.`);
        await setDoc(pendingRef, { email });

        return { status: "pending" };
    } catch (error) {
        console.error(`Error checking user approval: ${error}`);
        return { status: "error" };
    }
};
