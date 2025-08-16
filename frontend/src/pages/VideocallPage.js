// VideoCallPage.jsx
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const VideoCallPage = () => {
  const { roomId } = useParams();
  const videoContainerRef = useRef(null); // 👈 this will point to the container div

  useEffect(() => {
    const appID = 615991400;
    const serverSecret = "a074bb14cd58ffba12e179054c99341b";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      Date.now().toString(), // userID
      "Testing" // userName
    );

    const zc = ZegoUIKitPrebuilt.create(kitToken);

    zc.joinRoom({
      container: videoContainerRef.current, // 👈 pass the actual DOM node
      sharedLinks: [
        {
            name: "Copy Link",
            url: `http://localhost:3000/video-call/${roomId}`,
        }
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
    });
  }, [roomId]);

  return (
    <div>
      <div ref={videoContainerRef} style={{ width: '100vw', height: '100vh' }} />
    </div>
  );
};

export default VideoCallPage;
