import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import app from "../../firebaseConfig"; // Ensure firebaseConfig initializes Firebase

// Create the Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>; // Add logout to the context type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Create an AuthProvider to wrap around your application
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth(app); // Pass the Firebase app instance to `getAuth`
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const logout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      setUser(null); // Clear user state after logout
    } catch (error) {
      console.error("Error logging out:", error);
      throw error; // Re-throw error for any handling by the caller
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
