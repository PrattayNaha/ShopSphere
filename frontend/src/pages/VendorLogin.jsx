import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/VendorLogin.css";

const VendorLogin = () =>{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("")

        try{
            const response = await api.post("/login/",{
                email:email,
                password:password
            });

            console.log("LOGIN RESPONSE:", response.data);

            const userRole = response.data.role //decode backend response

            if (userRole!=="VENDOR"){
                setError("Access denied. Vendor Only");
                return;
            }
            
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("role", response.data.role);

            navigate("/vendor/dashboard");
        }catch(err){
            setError("Invalid vendor credentials");
        }
    };
    return (
        <div className="vendor-login-page">

            <div className="vendor-login-container">

                {/* Left Branding */}
                <div className="vendor-left">
                    <h1>Vendor Portal</h1>
                    <p>Manage your products, orders & revenue</p>
                </div>

                {/* Right Form */}
                <div className="vendor-right">
                    <form className="vendor-login-form" onSubmit={handleLogin}>

                        <h2>Vendor Login</h2>

                        {error && <p className="error-text">{error}</p>}

                        <input
                        type="email"
                        placeholder="Vendor Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />

                        <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />

                        <button type="submit">Login</button>

                    </form>
                    <p>
                        {" "}
                        <span
                        style={{padding:"20px", color: "#4f46e5", cursor: "pointer" }}
                        onClick={() => navigate("/")}
                        >
                        Return To homepage
                        </span>
                    </p>
                </div>
                

            </div>
        </div>
    );

}

export default VendorLogin;