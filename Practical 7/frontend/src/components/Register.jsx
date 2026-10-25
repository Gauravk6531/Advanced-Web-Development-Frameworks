import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please fill in all fields"
            });
            return;
        }

        if (password.length < 6) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Password must be at least 6 characters long"
            });
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Passwords do not match"
            });
            return;
        }

        const result = await register(email, password);

        if (result.success) {
            Swal.fire({
                icon: "success",
                title: "Registration Successful",
                text: "Account created! Please login with your credentials.",
                timer: 1500,
                showConfirmButton: false
            });
            navigate("/login");
        } else {
            Swal.fire({
                icon: "error",
                title: "Registration Failed",
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
            <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Register</h1>

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
                        Password (minimum 6 characters)
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

                <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
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
                        backgroundColor: "#28a745",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
                    Already have an account?{" "}
                    <a href="/login" style={{ color: "#007bff", textDecoration: "none", fontWeight: "bold" }}>
                        Login here
                    </a>
                </p>
            </form>
        </div>
    );
}

export default Register;
