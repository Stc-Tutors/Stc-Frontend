"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { isEqualTrackRef, isTrackReference, type TrackReferenceOrPlaceholder, type WidgetState } from "@livekit/components-core";
import {
  CarouselLayout,
  Chat,
  ConnectionStateToast,
  ControlBar,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  ParticipantTile,
  RoomAudioRenderer,
  useCreateLayoutContext,
  usePinnedTracks,
  useSpeakingParticipants,
  useTracks,
} from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";

// LiveKit's own ready-made <VideoConference/> (its source explicitly invites
// forking this exact composition for customization) auto-focuses a SCREEN
// SHARE full-size with everyone else as small thumbnails - but falls back to
// an equal grid the rest of the time, even while one person is talking. That
// isn't the Zoom/Google Meet "speaker view" people expect: whoever's talking
// should be the big tile, not an equal square among everyone else. This
// keeps the screen-share behavior as-is and adds one rule: with no screen
// share and nobody's deliberately pinned a tile by clicking it, automatically
// focus whoever is currently speaking.
export default function ClassroomVideoLayout() {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  });
  const lastAutoFocusedScreenShareTrack = useRef<TrackReferenceOrPlaceholder | null>(null);
  // Identity of whoever OUR speaker-view logic (not a manual click) last
  // pinned - so it only ever releases/replaces its OWN pin, never a tile
  // someone chose by hand.
  const autoPinnedIdentityRef = useRef<string | null>(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false }
  );

  const layoutContext = useCreateLayoutContext();
  const speakingParticipants = useSpeakingParticipants();

  const screenShareTracks = tracks.filter(isTrackReference).filter((t) => t.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter((t) => !isEqualTrackRef(t, focusTrack));

  // Same screen-share auto-focus rule as the stock VideoConference.
  useEffect(() => {
    if (screenShareTracks.some((t) => t.publication.isSubscribed) && lastAutoFocusedScreenShareTrack.current === null) {
      layoutContext.pin.dispatch?.({ msg: "set_pin", trackReference: screenShareTracks[0] });
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
      autoPinnedIdentityRef.current = null;
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some((t) => t.publication.trackSid === lastAutoFocusedScreenShareTrack.current?.publication?.trackSid)
    ) {
      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
      lastAutoFocusedScreenShareTrack.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenShareTracks.map((t) => `${t.publication.trackSid}_${t.publication.isSubscribed}`).join()]);

  // Speaker view: only kicks in when nothing else has claimed the focus slot
  // (no screen share, no manual pin) - never fights either of those.
  useEffect(() => {
    if (focusTrack || screenShareTracks.length > 0) return;
    const speaker = speakingParticipants[0];
    if (!speaker) return;
    if (autoPinnedIdentityRef.current === speaker.identity) return;
    const cameraTrack = tracks.find((t) => t.participant.identity === speaker.identity && t.source === Track.Source.Camera);
    if (cameraTrack && isTrackReference(cameraTrack)) {
      layoutContext.pin.dispatch?.({ msg: "set_pin", trackReference: cameraTrack });
      autoPinnedIdentityRef.current = speaker.identity;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakingParticipants, focusTrack, screenShareTracks.length, tracks]);

  // Once the person WE auto-pinned stops being an active speaker, let go of
  // the pin - back to grid, or the next speaker picks it up on the next tick.
  useEffect(() => {
    if (!autoPinnedIdentityRef.current || screenShareTracks.length > 0) return;
    const stillSpeaking = speakingParticipants.some((p) => p.identity === autoPinnedIdentityRef.current);
    if (!stillSpeaking) {
      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
      autoPinnedIdentityRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakingParticipants, screenShareTracks.length]);

  return (
    <div className="lk-video-conference">
      <LayoutContextProvider value={layoutContext} onWidgetChange={setWidgetState}>
        <div className="lk-video-conference-inner">
          {!focusTrack ? (
            <div className="lk-grid-layout-wrapper">
              <GridLayout tracks={tracks}>
                <ParticipantTile />
              </GridLayout>
            </div>
          ) : (
            <div className="lk-focus-layout-wrapper">
              <FocusLayoutContainer>
                <CarouselLayout tracks={carouselTracks}>
                  <ParticipantTile />
                </CarouselLayout>
                <FocusLayout trackRef={focusTrack} />
              </FocusLayoutContainer>
            </div>
          )}
          <ControlBar controls={{ chat: true, settings: false }} />
        </div>
        <Chat style={{ display: widgetState.showChat ? "grid" : "none" }} />
      </LayoutContextProvider>
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}
