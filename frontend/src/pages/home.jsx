import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { TextField } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    const goToLandingPage = () => {
        navigate("/")
    }

    return (
        <div className="homePageContainer">
            <div className="navBar">
                <div
                    className="navBarBrand"
                    role="button"
                    tabIndex={0}
                    onClick={goToLandingPage}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            goToLandingPage();
                        }
                    }}
                    aria-label="Go to landing page"
                >
                    <div className="logoIcon">
                        <svg width="35" height="35" viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="20" fill="#FF9F43"/>
                            <path d="M12 16C12 14.8954 12.8954 14 14 14H18C18.5523 14 19 14.4477 19 15V25C19 25.5523 18.5523 26 18 26H14C12.8954 26 12 25.1046 12 24V16Z" fill="white"/>
                            <path d="M21 19L27 15V25L21 21V19Z" fill="white"/>
                        </svg>
                    </div>
                    <div className="logoText">
                        <span className="logoApna">Apna</span>
                        <span className="logoVC">VC</span>
                    </div>
                </div>

                <div className="navBarActions">
                    <button 
                        className="navButton historyButton"
                        onClick={() => navigate("/history")}
                    >
                        History
                    </button>

                    <button 
                        className="navButton logoutButton"
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/")
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="meetContent">
                    <h1 className="meetHeading">Start or Join a Secure Meeting</h1>
                    <p className="meetSubtext">Enter your meeting code to connect instantly.</p>

                    <div className="joinBox">
                        <TextField 
                            onChange={e => setMeetingCode(e.target.value)} 
                            id="meeting-code" 
                            label="Meeting Code" 
                            variant="outlined"
                            fullWidth
                            className="meetingInput"
                            placeholder="Enter meeting code"
                        />
                        <button 
                            onClick={handleJoinVideoCall} 
                            className="joinButton"
                        >
                            Join Meeting
                        </button>
                    </div>

                    <div className="homeFeatureCards">
                        <div className="homeFeatureItem">
                            <span className="homeFeatureIcon">✓</span>
                            <span>HD Video Calls</span>
                        </div>
                        <div className="homeFeatureItem">
                            <span className="homeFeatureIcon">✓</span>
                            <span>Live Chat</span>
                        </div>
                        <div className="homeFeatureItem">
                            <span className="homeFeatureIcon">✓</span>
                            <span>Screen Sharing</span>
                        </div>
                        <div className="homeFeatureItem">
                            <span className="homeFeatureIcon">✓</span>
                            <span>Secure Meetings</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default withAuth(HomeComponent)
