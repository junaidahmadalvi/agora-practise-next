import React, { useEffect, useRef } from "react";
import "../index.css";
import { Button, Col, Row } from "antd";
import {
  AudioMutedOutlined,
  AudioOutlined,
  PhoneOutlined,
  VideoCameraAddOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

const VideoComponent = ({ user, mute, leave }) => {
  const vidDiv = useRef(null);

  useEffect(() => {
    playVideo();

    return () => {
      stopVideo();
    };
  }, []);

  const playVideo = () => {
    user.videoTrack.play(vidDiv.current);
  };

  const stopVideo = () => {
    user.videoTrack.stop();
  };

  const handleMuteAudio = () => {
    mute("audio", user.uid);
  };

  const handleMuteVideo = () => {
    mute("video", user.uid);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
        width: "100%",
        // margin: "0 auto",
      }}
    >
      <div
        ref={vidDiv}
        style={{
          width: "100%",
          height: "300px",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Video Placeholder */}
      </div>
      <Row className="bottomRowButtons">
        <Button onClick={() => handleMuteAudio()} className="actionButton">
          {" "}
          {user.audio ? (
            <AudioMutedOutlined className="actionIcon" />
          ) : (
            <AudioOutlined className="actionIcon" />
          )}{" "}
        </Button>
        <Button onClick={() => handleMuteVideo()} className="actionButton">
          {" "}
          {user.video ? (
            <VideoCameraOutlined className="actionIcon" />
          ) : (
            <VideoCameraAddOutlined className="actionIcon" />
          )}
        </Button>
        <Button onClick={() => leave(user)} className="endCallButton">
          <PhoneOutlined
            fill="#EA2122"
            className="phoneIcon"
            style={{ marginLeft: "6px", transform: "rotate(225deg)" }}
          />{" "}
        </Button>
      </Row>
    </div>
  );
};

export default VideoComponent;
