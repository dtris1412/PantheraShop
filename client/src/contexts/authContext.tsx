import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  role_id: number;
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<User | null>;
  updateProfile: (data: {
    user_name: string;
    user_email: string;
    user_phone?: string;
    user_address?: string;
  }) => Promise<void>;
  updatePassword: (
    current_password: string,
    new_password: string
  ) => Promise<any>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;

  // load token & user từ localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // login
  const login = async (email: string, password: string) => {
    const res = await fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: email, user_password: password }),
    });

    const data = await res.json();
    if (!res.ok || data.mess)
      throw new Error(data.mess || data.message || "Login failed");

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  // register
  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const res = await fetch("http://localhost:8080/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_name: username,
        user_email: email,
        user_password: password,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success)
      throw new Error(data.message || "Register failed");

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  // logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // fetch profile từ backend
  const fetchProfile = async (): Promise<User | null> => {
    if (!token) return null;

    const res = await fetch("http://localhost:8080/api/user/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch profile");

    const data = await res.json();
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  };

  const updateProfile = async (data: {
    user_name: string;
    user_email: string;
    user_phone?: string;
    user_address?: string;
  }) => {
    if (!token) return;
    const res = await fetch("http://localhost:8080/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Update failed");
    const updated = await res.json();
    setUser(updated.user); // hoặc setUser(updated) tùy backend trả về
    localStorage.setItem("user", JSON.stringify(updated.user));
  };

  const updatePassword = async (
    current_password: string,
    new_password: string
  ) => {
    if (!token) return;
    const res = await fetch("http://localhost:8080/api/user/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password, // Đảm bảo tên trường đúng với backend
        new_password,
      }),
    });
    if (!res.ok) throw new Error("Update failed");
    const result = await res.json();
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        fetchProfile,
        updateProfile,
        updatePassword,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
