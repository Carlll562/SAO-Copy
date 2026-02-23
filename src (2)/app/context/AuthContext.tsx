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
        category: "Auth",
      });

      // Track session start
      const sessionStart = new Date().toISOString();
      localStorage.setItem("sessionStartTime", sessionStart);
      localStorage.setItem("sessionStartUser", foundUser.email);
      addAuditLog({
        action: "Session Start",
        user: foundUser.email,
        status: "Success",
        details: `New session opened for ${foundUser.name} (${foundUser.role})`,
        category: "Session",
      });
      
      return true;
    }

    // Log failed login attempt
    addAuditLog({
      action: "Login Failed",
      user: email,
      status: "Failed",
      details: `Failed login attempt — invalid credentials for "${email}"`,
      category: "Error",
    });

    return false;
  };

  const logout = () => {
    if (user) {
      // Calculate session duration
      const sessionStart = localStorage.getItem("sessionStartTime");
      if (sessionStart) {
        const durationMs = new Date().getTime() - new Date(sessionStart).getTime();
        const durationMins = Math.floor(durationMs / 60000);
        const durationSecs = Math.floor((durationMs % 60000) / 1000);
        addAuditLog({
          action: "Session End",
          user: user.email,
          status: "Success",
          details: `Session closed. Duration: ${durationMins}m ${durationSecs}s`,
          category: "Session",
        });
        localStorage.removeItem("sessionStartTime");
        localStorage.removeItem("sessionStartUser");
      }

      addAuditLog({
        action: "Logout",
        user: user.email,
        status: "Success",
        details: `${user.name} logged out of the system`,
        category: "Auth",
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
export type LogCategory = "API" | "CRUD" | "Auth" | "Session" | "Error" | "Click";

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: "Success" | "Failed" | "Error";
  details: string;
  category: LogCategory;
}

export function addAuditLog(log: Omit<AuditLog, "id" | "timestamp"> & { category?: LogCategory }) {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    category: "CRUD",
    ...log,
  };
  logs.unshift(newLog);
  localStorage.setItem("auditLogs", JSON.stringify(logs));
}

export function getAuditLogs(): AuditLog[] {
  const logs = localStorage.getItem("auditLogs");
  return logs ? JSON.parse(logs) : [];
}