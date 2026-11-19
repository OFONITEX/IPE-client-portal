"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PortalUser, StoredUser } from "./types";

interface SignupParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: PortalUser;
}

interface AuthContextType {
  user: PortalUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (params: SignupParams) => Promise<AuthResponse>;
  login: (params: LoginParams) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = "identity_portal_registered_users";
const ACTIVE_USER_STORAGE_KEY = "identity_portal_active_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from local storage or server session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn("Failed to read active user from localStorage", e);
    } finally {
      setLoading(false);
    }

    // Attempt to verify with backend if available
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
          localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Dev server or static export offline fallback
      });
  }, []);

  const getStoredUsers = (): StoredUser[] => {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to read registered users", e);
    }
    return [];
  };

  const saveStoredUsers = (users: StoredUser[]) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn("Failed to save registered users", e);
    }
  };

  const signup = async ({
    firstName,
    lastName,
    email,
    password,
  }: SignupParams): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (!cleanFirst || !cleanLast) {
      return { success: false, message: "First name and last name are required." };
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, message: "A valid email address is required." };
    }
    if (!password || password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters long." };
    }

    // Try backend API first
    try {
      const apiRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: cleanFirst,
          lastName: cleanLast,
          email: cleanEmail,
          password,
        }),
      });

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.success && apiData.user) {
          setUser(apiData.user);
          localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(apiData.user));

          // Also mirror in local storage
          const users = getStoredUsers();
          if (!users.some((u) => u.email === cleanEmail)) {
            users.push({ ...apiData.user, password });
            saveStoredUsers(users);
          }

          return { success: true, user: apiData.user };
        }
      }
    } catch {
      // Backend not running / static export fallback
    }

    // Local storage fallback
    const users = getStoredUsers();
    const existing = users.find((u) => u.email === cleanEmail);
    if (existing) {
      return {
        success: false,
        message: "An account with this email address already exists. Please log in instead.",
      };
    }

    const newUser: StoredUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 10),
      firstName: cleanFirst,
      lastName: cleanLast,
      email: cleanEmail,
      password: password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    const safeUser: PortalUser = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };

    setUser(safeUser);
    localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(safeUser));

    return { success: true, user: safeUser };
  };

  const login = async ({ email, password }: LoginParams): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, message: "Email address is required." };
    }
    if (!password) {
      return { success: false, message: "Password is required." };
    }

    // Try backend API first
    try {
      const apiRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.success && apiData.user) {
          setUser(apiData.user);
          localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(apiData.user));
          return { success: true, user: apiData.user };
        }
      }
    } catch {
      // Backend not running / static export fallback
    }

    // Local storage fallback
    const users = getStoredUsers();
    const matched = users.find(
      (u) => u.email === cleanEmail && u.password === password
    );

    if (!matched) {
      return {
        success: false,
        message: "Invalid email or password. Please verify your credentials or sign up.",
      };
    }

    const safeUser: PortalUser = {
      id: matched.id,
      firstName: matched.firstName,
      lastName: matched.lastName,
      email: matched.email,
      createdAt: matched.createdAt,
    };

    setUser(safeUser);
    localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(safeUser));

    return { success: true, user: safeUser };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to remove active user", e);
    }

    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
