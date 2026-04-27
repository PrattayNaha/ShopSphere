import { useState } from "react"; //useState is used to store form input vlaue
import api from "../services/api"; //Import our axios API service
import {useNavigate} from "react-router-dom"; //Used to redirect user after successful registration
import "../styles/Register.css";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const Register = () =>{
    const[name, setName] = useState(""); //state to store name input
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = useNavigate(); //Hook for page redirection

    const handleRegister = async(e) =>{ //Function that runs when form is submitted
       
        e.preventDefault(); //Prevents page refres on form submit

        try{        //Send Post request to backend register API
            await api.post("/register/",{
                username:name, //name field = username
                email:email, //email input
                password:password, //password input
            });

            navigate("/login"); //If successful reidrect user to login page.

        }catch(err){
            setError("Registration failed, Please Try again.");
        }
    };

    return (
        <>

            <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <div className="register-page">
                {/* Main container */}
                <div className="register-container">

                {/* Left side */}
                <div className="register-left">
                    <h1>ShopSphere</h1>
                    <p>Your one-stop modern ecommerce platform</p>
                </div>

                {/* Right side */}
                <div className="register-right">
                    <form className="register-form" onSubmit={handleRegister}>

                    <h2>Create Account</h2>

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
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

                    <button type="submit">Register</button>

                    <p>
                        Already have an account?{" "}
                        <span
                        style={{ color: "#4f46e5", cursor: "pointer" }}
                        onClick={() => navigate("/login")}
                        >
                        Login
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

export default Register;