import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import '../styles/authentication.css';

export default function Authentication() {
    const navigate = useNavigate();
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [formState, setFormState] = React.useState(0); // 0: login, 1: signup
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const handleAuth = async () => {
        setError("");
        setLoading(true);
        
        try {
            if (formState === 0) {
                // Login
                if (!username || !password) {
                    setError("Please enter both username and password");
                    setLoading(false);
                    return;
                }
                await handleLogin(username, password);
            } else {
                // Register
                if (!name || !username || !password) {
                    setError("Please fill in all fields");
                    setLoading(false);
                    return;
                }
                if (password.length < 6) {
                    setError("Password must be at least 6 characters");
                    setLoading(false);
                    return;
                }
                let result = await handleRegister(name, username, password);
                
                setUsername("");
                setName("");
                setPassword("");
                setMessage(result || "Registration successful! Please login.");
                setShowSuccess(true);
                setError("");
                setFormState(0);
                
                setTimeout(() => setShowSuccess(false), 4000);
            }
        } catch (err) {
            console.error("Authentication error:", err);
            let errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAuth();
        }
    };

    return (
        <div className="authContainer">
            {/* Left Side - Branding */}
            <div className="authLeft">
                <div className="authBranding">
                    <div className="authLogo">
                        <div className="logoIcon">
                            <svg width="50" height="50" viewBox="0 0 40 40" fill="none">
                                <circle cx="20" cy="20" r="20" fill="#FF9839"/>
                                <path d="M12 16C12 14.8954 12.8954 14 14 14H18C18.5523 14 19 14.4477 19 15V25C19 25.5523 18.5523 26 18 26H14C12.8954 26 12 25.1046 12 24V16Z" fill="white"/>
                                <path d="M21 19L27 15V25L21 21V19Z" fill="white"/>
                            </svg>
                        </div>
                        <div className="authLogoText">
                            <span className="logoApna">Apna</span>
                            <span className="logoVC">VC</span>
                        </div>
                    </div>
                    
                    <p className="authLogoTagline">Connect. Collaborate. Anywhere.</p>
                    
                    <h1 className="authHeading">
                        Connect Instantly with HD Video Meetings
                    </h1>
                    
                    <p className="authSubheading">
                        Experience seamless video calls with secure, real-time communication
                    </p>

                    {/* Floating Feature Cards */}
                    <div className="floatingCards">
                        <div className="floatingCard card1">
                            <span className="cardIcon">🔒</span>
                            <div className="cardContent">
                                <h4>Secure Authentication</h4>
                                <p>Protected User Accounts</p>
                            </div>
                        </div>
                        
                        <div className="floatingCard card2">
                            <span className="cardIcon">⚡</span>
                            <div className="cardContent">
                                <h4>WebRTC Powered</h4>
                                <p>Ultra-low latency calls</p>
                            </div>
                        </div>
                        
                        <div className="floatingCard card3">
                            <span className="cardIcon">💬</span>
                            <div className="cardContent">
                                <h4>Real-Time Communication</h4>
                                <p>Instant messaging & video</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="authRight">
                <div className="authFormContainer">
                    {/* Back to Home Button */}
                    <button 
                        className="backButton" 
                        onClick={() => navigate('/')}
                        aria-label="Back to home"
                    >
                        ← Back to Home
                    </button>

                    {/* Form Card */}
                    <div className="authCard">
                        {/* Tab Switcher */}
                        <div className="authTabs">
                            <button 
                                className={`authTab ${formState === 0 ? 'active' : ''}`}
                                onClick={() => { 
                                    setFormState(0); 
                                    setError('');
                                }}
                            >
                                Sign In
                            </button>
                            <button 
                                className={`authTab ${formState === 1 ? 'active' : ''}`}
                                onClick={() => { 
                                    setFormState(1); 
                                    setError('');
                                }}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Form Title */}
                        <h2 className="formTitle">
                            {formState === 0 ? 'Welcome Back 👋' : 'Create Account'}
                        </h2>
                        <p className="formSubtitle">
                            {formState === 0 
                                ? 'Sign in to continue to your meetings' 
                                : 'Sign up to start your first meeting'}
                        </p>

                        {/* Success Message */}
                        {showSuccess && (
                            <div className="successAlert">
                                <span className="successIcon">✓</span>
                                {message}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="errorAlert">
                                <span className="errorIcon">✕</span>
                                {error}
                            </div>
                        )}

                        {/* Form Fields */}
                        <div className="formFields">
                            {formState === 1 && (
                                <div className="inputGroup">
                                    <label htmlFor="fullname">Full Name</label>
                                    <input
                                        type="text"
                                        id="fullname"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            <div className="inputGroup">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={loading}
                                    autoFocus={formState === 0}
                                />
                            </div>

                            <div className="inputGroup">
                                <label htmlFor="password">Password</label>
                                <div className="passwordWrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="passwordToggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </button>
                                </div>
                            </div>

                            {formState === 0 && (
                                <div className="formExtras">
                                    <label className="rememberMe">
                                        <input type="checkbox" />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="forgotPassword">Forgot password?</a>
                                </div>
                            )}

                            <button 
                                className="submitButton"
                                onClick={handleAuth}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Processing...
                                    </>
                                ) : (
                                    formState === 0 ? 'Sign In' : 'Create Account'
                                )}
                            </button>
                        </div>

                        {/* Alternative Options */}
                        <div className="authAlternative">
                            <div className="divider">
                                <span>or</span>
                            </div>
                            <button 
                                className="guestButton"
                                onClick={() => navigate('/home')}
                            >
                                Join as Guest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}