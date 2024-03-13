import "./App.css";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import VideoComponent from "./component/video";
import { AGORA } from "./utills/constant";

function App() {
  const [user, setUser] = useState([]);
  const [join, setJoin] = useState(false);

  const { APP_ID, CHANNEL, TOKEN } = AGORA;

  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  //join function for user
  const handleJoin = async () => {
    const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);
    setJoin(true);

    initClientEvents();

    const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    const localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    setUser((prevUser) => {
      return [
        ...prevUser,
        {
          uid: uid,
          audio: true,
          video: true,
          client: true,
          audioTrack: localAudioTrack,
          videoTrack: localVideoTrack,
        },
      ];
    });

    //Publishing your Streams
    await client.publish([localAudioTrack, localVideoTrack]);
    // setStart(true);
  };

  const initClientEvents = () => {
    client.on("user-published", async (user, mediaType) => {
      // New User Enters
      await client.subscribe(user, mediaType);

      if (mediaType === "video") {
        const remoteVideoTrack = user.videoTrack;
        setUser((prevUsers) => {
          return [
            ...prevUsers,
            {
              uid: user.uid,
              audio: user.hasAudio,
              video: user.hasVideo,
              client: false,
              videoTrack: remoteVideoTrack,
            },
          ];
        });
      }

      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
        setUser((prevUsers) => {
          return prevUsers.map((User) => {
            if (User.uid === user.uid) {
              return { ...User, audio: user.hasAudio };
            }
            return User;
          });
        });
      }
    });

    client.on("user-unpublished", (user, type) => {
      //User Leaves
      if (type === "audio") {
        setUser((prevUsers) => {
          return prevUsers.map((User) => {
            if (User.uid === user.uid) {
              return { ...User, audio: !User.audio };
            }
            return User;
          });
        });
      }
      if (type === "video") {
        setUser((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      }
    });
  };

  // control functions
  const mute = (type, id) => {
    if (type === "audio") {
      setUser((prevUsers) => {
        return prevUsers?.map((user) => {
          if (user?.uid === id) {
            user?.client && user?.audioTrack.setEnabled(!user?.audio);
            return { ...user, audio: !user?.audio };
          }
          return user;
        });
      });
    } else if (type === "video") {
      setUser((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.uid === id) {
            user.client && user?.videoTrack.setEnabled(!user.video);
            return { ...user, video: !user.video };
          }
          return user;
        });
      });
    }
  };

  const leaveChannel = async (user) => {
    // Destroy the local audio and video tracks.
    user?.audioTrack && (await user?.audioTrack.close());
    user?.videoTrack && (await user?.videoTrack.close());
    await client.leave();
    // setUser([]);
    setUser((prevUsers) => {
      return prevUsers.filter((User) => User.uid !== user.uid);
    });
    // setStart(false);
    setJoin(false);
  };

  return (
    <div>
      <center>
        <h1>Video Call App</h1>
      </center>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "5%",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {join && user?.length ? (
          user.map((user) => (
            <div key={user?.uid}>
              <VideoComponent user={user} mute={mute} leave={leaveChannel} />
            </div>
          ))
        ) : (
          <button
            className="btn"
            style={{
              margin: "10px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={handleJoin}
          >
            Join call
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
