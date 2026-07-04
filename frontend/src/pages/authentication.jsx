import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import '../styles/authentication.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export default function Authentication() {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [fieldErrors, setFieldErrors] = React.useState({});
    const [message, setMessage] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [formState, setFormState] = React.useState(0); // 0: login, 1: signup
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const validateEmail = (value) => {
        const trimmedEmail = value.trim();

        if (!trimmedEmail) {
            return "email is required.";
        }

        if (!emailPattern.test(trimmedEmail)) {
            return "Please enter a valid email address.";
        }

        return "";
    };

    const validatePassword = (value) => {
        if (!value) {
            return "Password is required.";
        }

        if (value.length < 8) {
            return "Password must be at least 8 characters.";
        }

        if (!strongPasswordPattern.test(value)) {
            return "Password must contain an uppercase letter, lowercase letter, number and special character.";
        }

        return "";
    };

    const validateForm = () => {
        const nextErrors = {};

        if (formState === 1 && !name.trim()) {
            nextErrors.name = "Full name is required.";
        }

        const emailError = validateEmail(email);
        if (emailError) {
            nextErrors.email = emailError;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            nextErrors.password = passwordError;
        }

        if (formState === 1) {
            if (!confirmPassword) {
                nextErrors.confirmPassword = "Confirm password is required.";
            } else if (password !== confirmPassword) {
                nextErrors.confirmPassword = "Passwords do not match.";
            }
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const clearFieldError = (fieldName) => {
        setFieldErrors((currentErrors) => {
            if (!currentErrors[fieldName]) return currentErrors;

            const nextErrors = { ...currentErrors };
            delete nextErrors[fieldName];
            return nextErrors;
        });
    };

    const handleAuth = async () => {
        setError("");
        setShowSuccess(false);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const normalizedEmail = email.trim().toLowerCase();

            if (formState === 0) {
                await handleLogin(normalizedEmail, password);
            } else {
                let result = await handleRegister(name.trim(), normalizedEmail, password);
                
                setEmail("");
                setName("");
                setPassword("");
                setConfirmPassword("");
                setMessage(result || "Registration successful! Please login.");
                setShowSuccess(true);
                setError("");
                setFieldErrors({});
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
                                    setFieldErrors({});
                                    setConfirmPassword('');
                                }}
                            >
                                Sign In
                            </button>
                            <button 
                                className={`authTab ${formState === 1 ? 'active' : ''}`}
                                onClick={() => { 
                                    setFormState(1); 
                                    setError('');
                                    setFieldErrors({});
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
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            clearFieldError("name");
                                        }}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                        aria-invalid={Boolean(fieldErrors.name)}
                                    />
                                    {fieldErrors.name && <p className="fieldError">{fieldErrors.name}</p>}
                                </div>
                            )}

                            <div className="inputGroup">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    autoComplete="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        clearFieldError("email");
                                    }}
                                    onKeyPress={handleKeyPress}
                                    disabled={loading}
                                    autoFocus={formState === 0}
                                    aria-invalid={Boolean(fieldErrors.email)}
                                />
                                {fieldErrors.email && <p className="fieldError">{fieldErrors.email}</p>}
                            </div>

                            <div className="inputGroup">
                                <label htmlFor="password">Password</label>
                                <div className="passwordWrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        autoComplete={formState === 0 ? "current-password" : "new-password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            clearFieldError("password");
                                            clearFieldError("confirmPassword");
                                        }}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                        aria-invalid={Boolean(fieldErrors.password)}
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
                                {fieldErrors.password && <p className="fieldError">{fieldErrors.password}</p>}
                            </div>

                            {formState === 1 && (
                                <div className="inputGroup">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <div className="passwordWrapper">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            autoComplete="new-password"
                                            placeholder="Confirm your password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                clearFieldError("confirmPassword");
                                            }}
                                            onKeyPress={handleKeyPress}
                                            disabled={loading}
                                            aria-invalid={Boolean(fieldErrors.confirmPassword)}
                                        />
                                        <button
                                            type="button"
                                            className="passwordToggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                        >
                                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </button>
                                    </div>
                                    {fieldErrors.confirmPassword && <p className="fieldError">{fieldErrors.confirmPassword}</p>}
                                </div>
                            )}

                            {formState === 0 && (
                                <div className="formExtras">
                                    <label className="rememberMe">
                                        <input type="checkbox" />
                                        <span>Remember me</span>
                                    </label>
                                    <button type="button" className="forgotPassword">Forgot password?</button>
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

                    </div>
                </div>
            </div>
        </div>
    );
}
