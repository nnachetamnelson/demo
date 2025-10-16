import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (t: string | null) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  logout: () => void; // ✅ add this
};

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  userId: null,
  setUserId: () => {},
  logout: () => {}, // ✅ placeholder
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );
  const [userId, setUserId] = useState<string | null>(() =>
    localStorage.getItem("userId")
  );

  useEffect(() => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    else localStorage.removeItem("accessToken");
  }, [accessToken]);

  useEffect(() => {
    if (userId) localStorage.setItem("userId", userId);
    else localStorage.removeItem("userId");
  }, [userId]);

  // ✅ Proper logout function
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setAccessToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, userId, setUserId, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
