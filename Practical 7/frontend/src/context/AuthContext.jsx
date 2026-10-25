import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("authToken") || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch current user when token exists
    useEffect(() => {
        if (token) {
            fetchCurrentUser();
        }
    }, [token]);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch("/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                // Token is invalid, clear it
                logout();
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            logout();
        }
    };

    const register = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Registration failed");
            }

            const data = await response.json();
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Login failed");
            }

            const data = await response.json();
            const newToken = data.token;
            setToken(newToken);
            setUser(data.user);
            localStorage.setItem("authToken", newToken);
            return { success: true, message: "Login successful" };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
    };

    const value = {
        token,
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!token
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
