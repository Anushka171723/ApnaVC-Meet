import React, { useCallback, useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { TextField } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import PeopleIcon from '@mui/icons-material/People'
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import server from '../environment';
import { useLocation, useNavigate } from 'react-router-dom';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

const RemoteParticipantVideo = React.memo(function RemoteParticipantVideo({ video, index, isPinned, onPin, onFullscreen }) {
    const tileRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (remoteVideoRef.current && video.stream && remoteVideoRef.current.srcObject !== video.stream) {
            remoteVideoRef.current.srcObject = video.stream;
        }
    }, [video.stream]);

    return (
        <div
            ref={tileRef}
            className={`${styles.videoWrapper} ${styles.participantJoin} ${isPinned ? styles.pinnedVideoWrapper : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <video
                className={styles.remoteVideo}
                data-socket={video.socketId}
                ref={remoteVideoRef}
                autoPlay
                playsInline
            />
            <div className={styles.tileActions}>
                <button
                    type="button"
                    onClick={() => onPin(video.socketId)}
                    title={isPinned ? "Unpin participant" : "Pin participant"}
                >
                    {isPinned ? <PushPinIcon style={{ fontSize: "1.05rem" }} /> : <PushPinOutlinedIcon style={{ fontSize: "1.05rem" }} />}
                </button>
                <button
                    type="button"
                    onClick={() => onFullscreen(tileRef.current)}
                    title="Fullscreen participant"
                >
                    <FullscreenIcon style={{ fontSize: "1.2rem" }} />
                </button>
            </div>
            <div className={styles.participantName}>
                <span className={styles.nameText}>
                    {video.username || 'Anonymous'}
                </span>
            </div>
        </div>
    );
});

export default function VideoMeetComponent() {

    const navigate = useNavigate();
    const location = useLocation();
    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState(false);

    let [audio, setAudio] = useState(false);

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])
    let [pinnedVideoId, setPinnedVideoId] = useState(null)
    
    let [participantCount, setParticipantCount] = useState(1);
    
    const [meetingCode, setMeetingCode] = useState("");
    
    const chatDisplayRef = useRef(null);
    const localTileRef = useRef(null);

    const attachLocalStreamToVideo = useCallback((videoElement) => {
        localVideoref.current = videoElement;

        if (videoElement && window.localStream) {
            if (videoElement.srcObject !== window.localStream) {
                videoElement.srcObject = window.localStream;
            }

            if (videoElement.paused) {
                const playPromise = videoElement.play?.();
                if (playPromise) {
                    playPromise.catch(() => {});
                }
            }
        }
    }, []);

    const setLocalStream = (stream) => {
        window.localStream = stream;

        if (localVideoref.current) {
            if (localVideoref.current.srcObject !== stream) {
                localVideoref.current.srcObject = stream;
            }

            if (localVideoref.current.paused) {
                const playPromise = localVideoref.current.play?.();
                if (playPromise) {
                    playPromise.catch(() => {});
                }
            }
        }
    };

    const isUsableTrack = (track) => {
        return track && track.readyState === "live" && !track.__apnaVCFallback;
    };

    const removeDeadLocalTracks = (kind) => {
        if (!window.localStream) return;

        window.localStream.getTracks()
            .filter(track => track.kind === kind && !isUsableTrack(track))
            .forEach(track => {
                window.localStream.removeTrack(track);
                try {
                    track.stop();
                } catch (e) { }
            });
    };

    const updatePeerConnections = () => {
        if (!window.localStream || !socketRef.current) return;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            try {
                if (connections[id].getSenders && connections[id].addTrack) {
                    const senders = connections[id].getSenders();

                    window.localStream.getTracks().forEach(track => {
                        const sender = senders.find(sender => sender.track && sender.track.kind === track.kind);
                        if (sender) {
                            sender.replaceTrack(track).catch(e => console.log(e));
                        } else {
                            connections[id].addTrack(track, window.localStream);
                        }
                    });
                } else {
                    connections[id].addStream(window.localStream);
                }

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                }).catch(e => console.log(e))
            } catch (e) {
                console.log(e);
            }
        }
    };

    const ensureLocalMedia = async ({ nextVideo, nextAudio }) => {
        let currentStream = window.localStream || new MediaStream();
        setLocalStream(currentStream);

        removeDeadLocalTracks("video");
        removeDeadLocalTracks("audio");

        let videoTrack = currentStream.getVideoTracks().find(isUsableTrack);
        let audioTrack = currentStream.getAudioTracks().find(isUsableTrack);

        if (nextVideo && !videoTrack) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoTrack = stream.getVideoTracks()[0];
                if (videoTrack) {
                    currentStream.addTrack(videoTrack);
                    setVideoAvailable(true);
                }
            } catch (e) {
                console.log(e);
                setVideoAvailable(false);
            }
        }

        if (nextAudio && !audioTrack) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioTrack = stream.getAudioTracks()[0];
                if (audioTrack) {
                    currentStream.addTrack(audioTrack);
                    setAudioAvailable(true);
                }
            } catch (e) {
                console.log(e);
                setAudioAvailable(false);
            }
        }

        currentStream.getVideoTracks().forEach(track => {
            track.enabled = Boolean(nextVideo && isUsableTrack(track));
        });

        currentStream.getAudioTracks().forEach(track => {
            track.enabled = Boolean(nextAudio && isUsableTrack(track));
        });

        setLocalStream(currentStream);
        updatePeerConnections();

        return {
            videoReady: !nextVideo || Boolean(currentStream.getVideoTracks().find(isUsableTrack)),
            audioReady: !nextAudio || Boolean(currentStream.getAudioTracks().find(isUsableTrack))
        };
    };

    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const code = pathParts[pathParts.length - 1];
        setMeetingCode(code);
        setMessages([]);
        setMessage("");
        setNewMessages(0);
        setPinnedVideoId(null);
    }, [location.pathname]);

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        console.log("HELLO")
        getPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Run only once on mount - NOT on every render

    let getDislayMedia = () => {
        if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then(getDislayMediaSuccess)
                .catch((e) => {
                    console.log(e);
                    setScreen(false);
                })
        }
    }

    const getPermissions = async () => {
        try {
            const localStream = new MediaStream();
            let hasVideo = false;
            let hasAudio = false;

            try {
                const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
                const videoTrack = videoPermission.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.enabled = true;
                    localStream.addTrack(videoTrack);
                    hasVideo = true;
                }
                setVideoAvailable(true);
                console.log('Video permission granted');
            } catch (error) {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            try {
                const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioTrack = audioPermission.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = false;
                    localStream.addTrack(audioTrack);
                    hasAudio = true;
                }
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } catch (error) {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (hasVideo || hasAudio) {
                setLocalStream(localStream);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Don't call getUserMedia on mount - it's already handled in getPermissions
    // useEffect removed to prevent stream recreation
    let getMedia = async () => {
        const hasVideoTrack = Boolean(window.localStream?.getVideoTracks().find(isUsableTrack));
        const hasAudioTrack = Boolean(window.localStream?.getAudioTracks().find(isUsableTrack));
        const nextVideo = videoAvailable || hasVideoTrack;
        const nextAudio = audioAvailable || hasAudioTrack;
        const mediaStatus = await ensureLocalMedia({ nextVideo, nextAudio });

        setVideo(nextVideo && mediaStatus.videoReady);
        setAudio(nextAudio && mediaStatus.audioReady);
        connectToSocketServer();
    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        setLocalStream(stream)

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            setLocalStream(window.localStream)

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        setScreen(true)
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        setLocalStream(stream)

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            setLocalStream(window.localStream)

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href, username)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                setPinnedVideoId((currentPinnedId) => currentPinnedId === id ? null : currentPinnedId)
                setParticipantCount(prev => Math.max(1, prev - 1));
            })

            socketRef.current.on('user-joined', (id, clients, usernames) => {
                setParticipantCount(clients.length);
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { 
                                        ...video, 
                                        stream: event.stream,
                                        username: usernames[socketListId] || 'Anonymous'
                                    } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true,
                                username: usernames[socketListId] || 'Anonymous'
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false, __apnaVCFallback: true })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false, __apnaVCFallback: true })
    }

let handleVideo = async () => {
    const newState = !video;

    if (!newState) {
        window.localStream?.getVideoTracks().forEach(track => {
            if (isUsableTrack(track)) track.enabled = false;
        });
        setVideo(false);
        updatePeerConnections();
        return;
    }

    const mediaStatus = await ensureLocalMedia({ nextVideo: true, nextAudio: audio });
    setVideo(mediaStatus.videoReady);
};

let handleAudio = async () => {
    const newState = !audio;

    if (!newState) {
        window.localStream?.getAudioTracks().forEach(track => {
            if (isUsableTrack(track)) track.enabled = false;
        });
        setAudio(false);
        updatePeerConnections();
        return;
    }

    const mediaStatus = await ensureLocalMedia({ nextVideo: video, nextAudio: true });
    setAudio(mediaStatus.audioReady);
}
    let handleScreen = () => {
        if (screen) {
            setScreen(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }

            getUserMedia();
            return;
        }

        getDislayMedia();
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }

        try {
            socketRef.current?.disconnect();
        } catch (e) { }

        navigate("/home");
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const handlePinVideo = (tileId) => {
        setPinnedVideoId((currentPinnedId) => currentPinnedId === tileId ? null : tileId);
    }

    const handleFullscreenTile = (tileElement) => {
        if (!tileElement) return;

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(e => console.log(e));
            return;
        }

        tileElement.requestFullscreen?.().catch(e => console.log(e));
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => {
            const newMessages = [
                ...prevMessages,
                { sender: sender, data: data, isOwn: socketIdSender === socketIdRef.current }
            ];
            
            // Auto-scroll to bottom after state update
            setTimeout(() => {
                if (chatDisplayRef.current) {
                    chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
                }
            }, 0);
            
            return newMessages;
        });
        
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    let connect = async () => {
        setMessages([]);
        setMessage("");
        setNewMessages(0);
        setAskForUsername(false);
        await getMedia();
    }


    return (
        <div className={styles.videoMeetPage}>
            {/* Navbar */}
            {!askForUsername && (
                <div className={styles.navbar}>
                    <div className={styles.navbarBrand}>
                        <div className={styles.logoIcon}>
                            <svg width="35" height="35" viewBox="0 0 40 40" fill="none">
                                <circle cx="20" cy="20" r="20" fill="#FF9F43"/>
                                <path d="M12 16C12 14.8954 12.8954 14 14 14H18C18.5523 14 19 14.4477 19 15V25C19 25.5523 18.5523 26 18 26H14C12.8954 26 12 25.1046 12 24V16Z" fill="white"/>
                                <path d="M21 19L27 15V25L21 21V19Z" fill="white"/>
                            </svg>
                        </div>
                        <div className={styles.logoText}>
                            <span className={styles.logoApna}>Apna</span>
                            <span className={styles.logoVC}>VC</span>
                        </div>
                    </div>

                    <div className={styles.navbarInfo}>
                        <div className={styles.navbarItem}>
                            <span className={styles.navbarLabel}>Meeting ID:</span>
                            <span className={styles.navbarValue}>{meetingCode}</span>
                        </div>
                        <div className={styles.participantCount}>
                            <PeopleIcon style={{ fontSize: '1.1rem' }} />
                            <span>{participantCount}</span>
                        </div>
                        <button 
                            className={styles.leaveButton}
                            onClick={handleEndCall}
                        >
                            Leave
                        </button>
                    </div>
                </div>
            )}

            {askForUsername ? (
                <div className={styles.lobbyContainer}>
                    <div className={styles.lobbyCard}>
                        <h2 className={styles.lobbyTitle}>
                            <span className={styles.lobbyEmoji}>👋</span> Join Meeting
                        </h2>
                        
                        <div className={styles.lobbyInfo}>
                            <span className={styles.lobbyLabel}>Meeting ID:</span>
                            <span className={styles.lobbyMeetingCode}>{meetingCode}</span>
                        </div>

                        <div className={styles.lobbyForm}>
                            <label className={styles.inputLabel}>Display Name</label>
                            <input 
                                type="text"
                                className={styles.lobbyInput}
                                placeholder="Enter your name" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && username && connect()}
                            />
                            
                            <button 
                                className={styles.joinButton}
                                onClick={connect}
                                disabled={!username}
                            >
                                Join Meeting
                            </button>
                        </div>

                        <div className={styles.previewCard}>
                            <div className={styles.previewHeader}>
                                <VideocamIcon style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} />
                                <span>Camera Preview</span>
                            </div>
                            <div className={styles.previewVideoWrapper}>
                                <video 
                                    ref={attachLocalStreamToVideo} 
                                    autoPlay 
                                    muted 
                                    playsInline
                                    className={styles.previewVideo}
                                    style={{ display: videoAvailable ? 'block' : 'none' }}
                                />
                                {!videoAvailable && (
                                    <div className={styles.previewPlaceholder}>
                                        <VideocamOffIcon style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                                        <p>Your camera will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.meetVideoContainer}>

                    {showModal ? <div className={styles.chatRoom}>
                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>

                            <div className={styles.chattingDisplay} ref={chatDisplayRef}>
                                {messages.length !== 0 ? messages.map((item, index) => {
                                    return (
                                        <div 
                                            className={`${styles.chatMessage} ${item.isOwn ? styles.ownMessage : styles.otherMessage}`} 
                                            key={index}
                                        >
                                            <p className={styles.chatSender}>{item.isOwn ? "Me" : item.sender}</p>
                                            <p className={styles.chatText}>{item.data}</p>
                                        </div>
                                    )
                                }) : (
                                    <div className={styles.emptyChat}>
                                        <ChatIcon style={{ fontSize: '3rem', opacity: 0.3 }} />
                                        <p>No messages yet</p>
                                        <span>Start the conversation!</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.chattingArea}>
                                <input 
                                    type="text"
                                    className={styles.chatInput}
                                    placeholder="Enter message..."
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && message && sendMessage()}
                                />
                                <button 
                                    className={styles.sendButtonChat} 
                                    onClick={sendMessage}
                                    disabled={!message}
                                >
                                    ➤
                                </button>
                            </div>
                        </div>
                    </div> : <></>}


                    <div className={styles.buttonContainers}>
                        <button 
                            onClick={handleVideo} 
                            className={video ? styles.activeButton : styles.inactiveButton}
                            title={video ? "Turn off camera" : "Turn on camera"}
                        >
                            {video ? <VideocamIcon style={{ color: "white", fontSize: "1.8rem" }} /> : <VideocamOffIcon style={{ color: "white", fontSize: "1.8rem" }} />}
                        </button>
                        
                        <button 
                            onClick={handleEndCall}
                            className={styles.endCallButton}
                            title="Leave meeting"
                        >
                            <CallEndIcon style={{ color: "white", fontSize: "1.8rem" }} />
                        </button>
                        
                        <button 
                            onClick={handleAudio}
                            className={audio ? styles.activeButton : styles.inactiveButton}
                            title={audio ? "Mute microphone" : "Unmute microphone"}
                        >
                            {audio ? <MicIcon style={{ color: "white", fontSize: "1.8rem" }} /> : <MicOffIcon style={{ color: "white", fontSize: "1.8rem" }} />}
                        </button>

                        {screenAvailable && (
                            <button 
                                onClick={handleScreen}
                                className={screen ? styles.activeButton : styles.inactiveButton}
                                title={screen ? "Stop sharing" : "Share screen"}
                            >
                                {screen ? <StopScreenShareIcon style={{ color: "white", fontSize: "1.8rem" }} /> : <ScreenShareIcon style={{ color: "white", fontSize: "1.8rem" }} />}
                            </button>
                        )}

                        <button 
                            onClick={() => {
                                setModal(!showModal);
                                setNewMessages(0);
                            }}
                            title="Toggle chat"
                            className={showModal ? styles.activeButton : ''}
                        >
                            <ChatIcon style={{ color: "white", fontSize: "1.8rem" }} />
                        </button>
                    </div>


                    <div 
                        ref={localTileRef}
                        className={`${styles.localVideoWrapper} ${pinnedVideoId === "local" ? styles.pinnedLocalVideoWrapper : ''}`}
                    >
                        <video className={styles.meetUserVideo} ref={attachLocalStreamToVideo} autoPlay muted playsInline></video>
                        <div className={styles.tileActions}>
                            <button
                                type="button"
                                onClick={() => handlePinVideo("local")}
                                title={pinnedVideoId === "local" ? "Unpin your video" : "Pin your video"}
                            >
                                {pinnedVideoId === "local" ? <PushPinIcon style={{ fontSize: "1.05rem" }} /> : <PushPinOutlinedIcon style={{ fontSize: "1.05rem" }} />}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFullscreenTile(localTileRef.current)}
                                title="Fullscreen your video"
                            >
                                <FullscreenIcon style={{ fontSize: "1.2rem" }} />
                            </button>
                        </div>
                        <div className={styles.localVideoName}>
                            <span className={styles.nameText}>{username || "You"}</span>
                        </div>
                    </div>

                    <div className={`${styles.conferenceView} ${pinnedVideoId ? styles.hasPinnedVideo : ''}`}>
                        {videos.map((video, index) => (
                            <RemoteParticipantVideo
                                key={video.socketId}
                                video={video}
                                index={index}
                                isPinned={pinnedVideoId === video.socketId}
                                onPin={handlePinVideo}
                                onFullscreen={handleFullscreenTile}
                            />
                        ))}
                    </div>

                </div>
            )}
        </div>
    )
}
