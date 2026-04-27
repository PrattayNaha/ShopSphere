import { useState } from "react"; //Import UseState hook to manage form inputs
import api from "../services/api/";//Import axios instance for API requests
import {useNavigate} from "react-router-dom";//Import navigation hook for redirecting after login
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../styles/Login.css";

const Login = () =>{
    const [email, setEmail] = useState("");//state to store email input
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) =>{ //function run when login form in submitted
        e.preventDefault();

        try{ //send post request to backend login api
            const response = await api.post("/login/", {
                email: email,
                password: password
            });

            //store access and refresh token in localstorage
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            
            //redirect user successul login
            navigate("/", {replace: true});

        }catch(err){
            //set error message if login fails
            setError("Invalid email or password");
        }
    };

    return (
        <>
            <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

            <div className="login-page">
                {/* Main container */}
                <div className="login-container">

                    {/* Left section (branding) */}
                    <div className="login-left">
                        <h1>ShopSphere</h1>
                        <p>Welcome back! Please login to your account</p>
                    </div>

                    {/* Right section (form) */}
                    <div className="login-right">
                        <form className="login-form" onSubmit={handleLogin}>

                            <h2>Login</h2>

                            {/* Error message */}
                            {error && <p className="error-text">{error}</p>}

                            {/* Email input */}
                            <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            />

                            {/* Password input */}
                            <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            />

                            {/* Submit button */}
                            <button type="submit">Login</button>

                            {/* Redirect to register page */}
                            <p>
                            Don’t have an account?{" "}
                            <span
                                className="link-text"
                                onClick={() => navigate("/register")}
                            >
                                Register
                            </span>
                            </p>
                            <p>
                            <span
                                className="link-text"
                                onClick={() => navigate("/forgot-password")}
                            >
                                Forgot Password?
                            </span>
                            </p>

                        </form>
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
};

export default Login;