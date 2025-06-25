// VideoCallPage.jsx
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const VideoCallPage = () => {
  const { roomId } = useParams();
  const videoContainerRef = useRef(null); // 👈 this will point to the container div

  useEffect(() => {
    const appID = 695135268;
    const serverSecret = "c2c58632cab3b8bb2899f0db982efc26";
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
