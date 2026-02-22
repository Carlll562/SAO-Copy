import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin account
const DEFAULT_ADMIN = {
  id: 1,
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
  role: "Admin" as const,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Get all users from localStorage
    const usersData = localStorage.getItem("users");
    const users = usersData ? JSON.parse(usersData) : [DEFAULT_ADMIN];

    // Find matching user
    const foundUser = users.find(
      (u: typeof DEFAULT_ADMIN) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
      
      // Log the login action
      addAuditLog({
        action: "Login",
        user: foundUser.email,
        status: "Success",
        details: "User logged in successfully",
      });
      
      return true;
    }

    // Log failed login attempt
    addAuditLog({
      action: "Login",
      user: email,
      status: "Failed",
      details: "Invalid credentials",
    });

    return false;
  };

  const logout = () => {
    if (user) {
      addAuditLog({
        action: "Logout",
        user: user.email,
        status: "Success",
        details: "User logged out",
      });
    }
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const isAdmin = user?.role === "Admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Audit log helper function
export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: "Success" | "Failed" | "Error";
  details: string;
}

export function addAuditLog(log: Omit<AuditLog, "id" | "timestamp">) {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...log,
  };
  logs.unshift(newLog);
  localStorage.setItem("auditLogs", JSON.stringify(logs));
}

export function getAuditLogs(): AuditLog[] {
  const logs = localStorage.getItem("auditLogs");
  return logs ? JSON.parse(logs) : [];
}
