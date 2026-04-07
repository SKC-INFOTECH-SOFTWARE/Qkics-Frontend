import { useState, useRef, useCallback, useEffect } from "react";
import { Room, RoomEvent, Track, ConnectionState } from "livekit-client";

export function useLiveKit() {
  const roomRef = useRef(null);

  const [connectionState, setConnectionState] = useState("disconnected");
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [screenShareTrack, setScreenShareTrack] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const connect = useCallback(async (sfuUrl, sfuToken) => {
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      stopLocalTrackOnUnpublish: true,
    });

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      setConnectionState(state);
    });

    room.on(RoomEvent.TrackSubscribed, (track, publication) => {
      if (publication.source === Track.Source.Camera) {
        setRemoteVideoTrack(track);
      }
      if (publication.source === Track.Source.ScreenShare) {
        setScreenShareTrack(track);
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
      if (publication.source === Track.Source.Camera) {
        setRemoteVideoTrack(null);
      }
      if (publication.source === Track.Source.ScreenShare) {
        setScreenShareTrack(null);
      }
    });

    await room.connect(sfuUrl, sfuToken);
    await room.localParticipant.enableCameraAndMicrophone();

    const camPub = room.localParticipant.getTrack(Track.Source.Camera);
    if (camPub?.track) {
      setLocalVideoTrack(camPub.track);
    }

    roomRef.current = room;
    setIsMicOn(true);
    setIsCamOn(true);

    return room;
  }, []);

  const toggleMic = useCallback(() => {
    if (!roomRef.current) return;
    const enabled = roomRef.current.localParticipant.isMicrophoneEnabled;
    roomRef.current.localParticipant.setMicrophoneEnabled(!enabled);
    setIsMicOn(!enabled);
  }, []);

  const toggleCamera = useCallback(() => {
    if (!roomRef.current) return;
    const enabled = roomRef.current.localParticipant.isCameraEnabled;
    roomRef.current.localParticipant.setCameraEnabled(!enabled);
    setIsCamOn(!enabled);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (!roomRef.current) return;
    const sharing = roomRef.current.localParticipant.isScreenShareEnabled;
    await roomRef.current.localParticipant.setScreenShareEnabled(!sharing);
    setIsScreenSharing(!sharing);
  }, []);

  const disconnect = useCallback(() => {
    roomRef.current?.disconnect();
    roomRef.current = null;
    setConnectionState("disconnected");
    setLocalVideoTrack(null);
    setRemoteVideoTrack(null);
    setScreenShareTrack(null);
  }, []);

  useEffect(() => {
    return () => roomRef.current?.disconnect();
  }, []);

  return {
    connect,
    disconnect,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    connectionState,
    localVideoTrack,
    remoteVideoTrack,
    screenShareTrack,
    isMicOn,
    isCamOn,
    isScreenSharing,
    isConnected: connectionState === ConnectionState.Connected,
  };
}
