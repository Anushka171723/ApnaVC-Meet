import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import EventIcon from "@mui/icons-material/Event";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import withAuth from "../utils/withAuth";

function History() {
  const { getHistoryOfUser } = useContext(AuthContext);

  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const routeTo = useNavigate();

  const goToLandingPage = () => {
    routeTo("/");
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch {
        // IMPLEMENT SNACKBAR
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  let formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="historyPageContainer">
      <div className="historyNav">
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
              <circle cx="20" cy="20" r="20" fill="#FF9F43" />
              <path d="M12 16C12 14.8954 12.8954 14 14 14H18C18.5523 14 19 14.4477 19 15V25C19 25.5523 18.5523 26 18 26H14C12.8954 26 12 25.1046 12 24V16Z" fill="white" />
              <path d="M21 19L27 15V25L21 21V19Z" fill="white" />
            </svg>
          </div>
          <div className="logoText">
            <span className="logoApna">Apna</span>
            <span className="logoVC">VC</span>
          </div>
        </div>

        <button className="historyHomeButton" onClick={() => routeTo("/home")}>
          <ArrowBackIcon style={{ fontSize: "1.1rem" }} />
          Home
        </button>
      </div>

      <main className="historyContent">
        <div className="historyHeader">
          <div>
            <p className="historyEyebrow">Your activity</p>
            <h1>Meeting History</h1>
            <p className="historySubtitle">Review the meeting rooms you joined from this account.</p>
          </div>
          <div className="historySummary">
            <HistoryIcon style={{ fontSize: "1.6rem" }} />
            <div>
              <span>{meetings.length}</span>
              <p>Total meetings</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="historyState">Loading your meetings...</div>
        ) : meetings.length !== 0 ? (
          <div className="historyGrid">
            {meetings.map((e, i) => (
              <div className="historyCard" key={`${e.meetingCode}-${i}`}>
                <div className="historyCardIcon">
                  <VideoCallIcon style={{ fontSize: "1.35rem" }} />
                </div>
                <div className="historyCardContent">
                  <p className="historyCardLabel">Meeting code</p>
                  <h2>{e.meetingCode}</h2>
                  <div className="historyMeta">
                    <span>
                      <EventIcon style={{ fontSize: "1rem" }} />
                      {formatDate(e.date)}
                    </span>
                    <span>{formatTime(e.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="historyEmpty">
            <HistoryIcon style={{ fontSize: "3rem" }} />
            <h2>No meeting history yet</h2>
            <p>Your joined meetings will appear here after you start using ApnaVC.</p>
            <button onClick={() => routeTo("/home")}>
              <HomeIcon style={{ fontSize: "1.1rem" }} />
              Go to Home
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(History);
