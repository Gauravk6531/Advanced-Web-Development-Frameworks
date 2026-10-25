import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please fill in all fields"
            });
            return;
        }

        const result = await login(email, password);

        if (result.success) {
            Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: result.message,
                timer: 1500,
                showConfirmButton: false
            });
            navigate("/tasks");
        } else {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: result.message
            });
        }
    };

    return (
        <div style={{
            maxWidth: "400px",
            margin: "50px auto",
            padding: "30px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
            <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Login</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="email" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box"
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
                    Don't have an account?{" "}
                    <a href="/register" style={{ color: "#007bff", textDecoration: "none", fontWeight: "bold" }}>
                        Register here
                    </a>
                </p>
            </form>
        </div>
    );
}

export default Login;
