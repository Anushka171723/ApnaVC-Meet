import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'

export default function LandingPage() {

    const router = useNavigate();

    return (
        <div className='landingPageContainer'>
            {/* Navigation */}
            <nav>
                <div className='navHeader'>
                    <div className="logoContainer">
                        <div className="logoIcon">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <circle cx="20" cy="20" r="20" fill="#FF9839"/>
                                <path d="M12 16C12 14.8954 12.8954 14 14 14H18C18.5523 14 19 14.4477 19 15V25C19 25.5523 18.5523 26 18 26H14C12.8954 26 12 25.1046 12 24V16Z" fill="white"/>
                                <path d="M21 19L27 15V25L21 21V19Z" fill="white"/>
                            </svg>
                        </div>
                        <div className="logoText">
                            <span className="logoApna">Apna</span>
                            <span className="logoVC">VC</span>
                        </div>
                    </div>
                    <p className="logoTagline">Connect. Collaborate. Anywhere.</p>
                </div>
                <div className='navlist'>
                    <p onClick={() => {
                        router("/aljk23")
                    }}>Join as Guest</p>
                    <p onClick={() => {
                        router("/auth")
                    }}>Register</p>
                    <div onClick={() => {
                        router("/auth")
                    }} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="landingMainContainer">
                <div className="heroContent">
                    <h1>
                        <span style={{ color: "#FF9839" }}>Connect Instantly</span> with HD Video Meetings
                    </h1>

                    <p>Experience crystal-clear video calls with secure, real-time communication</p>
                    
                    <div className="heroButtons">
                        <div className='primaryButton' role='button'>
                            <Link to={"/auth"}>Start Meeting</Link>
                        </div>
                        <div className='secondaryButton' role='button' onClick={() => router("/auth")}>
                            <p>Join Meeting</p>
                        </div>
                    </div>
                </div>
                <div className="heroImage">
                    <img src="/mobile.png" alt="Video Call Interface" />
                </div>
            </div>

            {/* Feature Cards Section */}
            <div className="featuresSection">
                <div className="featureCard">
                    <div className="featureIcon">📹</div>
                    <h3>HD Video Calls</h3>
                    <p>Crystal-clear video quality with smooth, lag-free communication</p>
                </div>
                
                <div className="featureCard">
                    <div className="featureIcon">💬</div>
                    <h3>Live Chat</h3>
                    <p>Instant messaging during video calls for seamless collaboration</p>
                </div>
                
                <div className="featureCard">
                    <div className="featureIcon">🔒</div>
                    <h3>Secure Authentication</h3>
                    <p>End-to-end encrypted meetings with password protection</p>
                </div>
            </div>

            {/* Footer */}
            <footer className="landingFooter">
                <div className="footerContent">
                    <div className="footerBrand">
                        <div className="footerLogo">
                            <div className="logoIcon">
                                <svg width="35" height="35" viewBox="0 0 40 40" fill="none">
                                    <circle cx="20" cy="20" r="20" fill="#FF9839"/>
                                    <path d="M12 16C12 14.8954 12.8954 14 14 14H18C18.5523 14 19 14.4477 19 15V25C19 25.5523 18.5523 26 18 26H14C12.8954 26 12 25.1046 12 24V16Z" fill="white"/>
                                    <path d="M21 19L27 15V25L21 21V19Z" fill="white"/>
                                </svg>
                            </div>
                            <div className="logoText">
                                <span className="logoApna">Apna</span>
                                <span className="logoVC">VC</span>
                            </div>
                        </div>
                        <p className="footerTagline">Connect. Collaborate. Anywhere.</p>
                        <p className="footerDescription">Built for everyone, everywhere.</p>
                    </div>
                    
                    <div className="footerSection">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/auth">Join as Guest</Link></li>
                            <li><Link to="/auth">Login</Link></li>
                            <li><Link to="/auth">Register</Link></li>
                        </ul>
                    </div>
                    
                    <div className="footerSection">
                        <h4>Features</h4>
                        <ul>
                            <li>HD Video Calls</li>
                            <li>Screen Sharing</li>
                            <li>Live Chat</li>
                            <li>Meeting History</li>
                        </ul>
                    </div>
                    
                    <div className="footerSection">
                        <h4>Support</h4>
                        <ul>
                            <li>Help Center</li>
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                            <li>Contact Us</li>
                        </ul>
                    </div>

                    <div className="footerSection">
                        <h4>Follow Us</h4>
                        <div className="socialIcons">
                            <a href="/github" className="socialIcon" aria-label="GitHub">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </a>
                            <a href="/in" className="socialIcon" aria-label="LinkedIn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                            </a>
                            <a href="/twitter" className="socialIcon" aria-label="Twitter">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                </svg>
                            </a>
                            <a href="/mail" className="socialIcon" aria-label="Email">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="footerBottom">
                    <p>ApnaVC. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}