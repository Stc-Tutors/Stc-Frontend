"use client";

import "@livekit/components-styles";
import { useCallback, useEffect, useState } from "react";
import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  PreJoin,
  RoomAudioRenderer,
  VideoConference,
  useTracks,
  type LocalUserChoices,
} from "@livekit/components-react";
import { DisconnectReason, Track } from "livekit-client";
import { Circle, DoorOpen, EyeOff, Loader2, PhoneOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastError } from "@/components/ui/custom/toast";
import { EndLiveClassAction, JoinLiveClassAction } from "@/server/live-class";
import type { JoinInfo } from "@/types/live-class";

type Phase = "loading" | "prejoin" | "live" | "left" | "ended" | "error";

interface LiveKitClassroomProps {
  lessonId: string;
  onExit: () => void;
}

// A silent, invisible view for an admin/HOD sitting in on a class: they can
// watch and listen, they aren't shown to anyone else, and they can't speak,
// share video or type (the token itself forbids it - this just doesn't offer
// controls that would fail).
function ObserverView() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout tracks={tracks} style={{ height: "100%" }}>
      <ParticipantTile />
    </GridLayout>
  );
}

export default function LiveKitClassroom({ lessonId, onExit }: LiveKitClassroomProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [join, setJoin] = useState<JoinInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [ending, setEnding] = useState(false);

  // Asks the server for a token and moves to the right phase. State is only
  // touched after the request returns, so it's safe to call from an effect.
  const loadJoin = useCallback(async () => {
    const [res, err] = await JoinLiveClassAction(lessonId);
    if (err || !res?.data) {
      setError(err || "Couldn't open the classroom");
      setPhase("error");
      return;
    }
    setJoin(res.data);
    // Observers have no camera/mic to set up.
    setPhase(res.data.role === "OBSERVER" ? "live" : "prejoin");
  }, [lessonId]);

  // For the buttons (try again / rejoin): show the spinner, then load.
  const requestJoin = useCallback(() => {
    setPhase("loading");
    setError(null);
    void loadJoin();
  }, [loadJoin]);

  // The initial phase is already "loading", so the first load needs no reset.
  // Inlined (with a cancel flag) rather than calling loadJoin so nothing sets
  // state synchronously inside the effect.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [res, err] = await JoinLiveClassAction(lessonId);
      if (cancelled) return;
      if (err || !res?.data) {
        setError(err || "Couldn't open the classroom");
        setPhase("error");
        return;
      }
      setJoin(res.data);
      setPhase(res.data.role === "OBSERVER" ? "live" : "prejoin");
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const endForEveryone = async () => {
    setEnding(true);
    const [, err] = await EndLiveClassAction(lessonId);
    setEnding(false);
    if (err) ToastError(err);
  };

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Opening your classroom...</span>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
        <ShieldAlert className="h-8 w-8 text-amber-500" />
        <p className="max-w-md text-sm text-gray-700">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExit}>
            Back
          </Button>
          <Button onClick={requestJoin}>Try again</Button>
        </div>
      </div>
    );
  }

  if (phase === "left" || phase === "ended") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 py-16 text-center">
        <PhoneOff className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-700">
          {phase === "ended" ? "This class has ended." : "You left the class."}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExit}>
            Back to my schedule
          </Button>
          {phase === "left" && (
            <Button
              onClick={() => {
                setChoices(null);
                void requestJoin();
              }}
            >
              <DoorOpen className="mr-2 h-4 w-4" />
              Rejoin
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!join) return null;

  if (phase === "prejoin") {
    return (
      <div className="mx-auto max-w-2xl" data-lk-theme="default">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-800">{join.lesson.title}</h2>
          <p className="text-sm text-gray-500">Check your camera and microphone, then join.</p>
        </div>
        {join.recording && (
          <p className="mb-3 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            <Circle className="h-3 w-3 fill-current" />
            This class will be recorded.
          </p>
        )}
        <PreJoin
          defaults={{ username: "", videoEnabled: true, audioEnabled: true }}
          joinLabel="Join class"
          persistUserChoices={false}
          onError={(e) => ToastError(e.message || "Couldn't access your camera or microphone")}
          onSubmit={(values) => {
            setChoices(values);
            setPhase("live");
          }}
        />
      </div>
    );
  }

  const isObserver = join.role === "OBSERVER";
  const isTutor = join.role === "TUTOR";

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-black" data-lk-theme="default" style={{ height: "78dvh" }}>
      <LiveKitRoom
        serverUrl={join.url}
        token={join.token}
        connect
        video={isObserver ? false : (choices?.videoEnabled ?? true)}
        audio={isObserver ? false : (choices?.audioEnabled ?? true)}
        options={{ adaptiveStream: true, dynacast: true }}
        onDisconnected={(reason) => {
          // The room was closed by the tutor/admin/timeout vs. this person
          // simply dropping or leaving.
          setPhase(reason === DisconnectReason.ROOM_DELETED ? "ended" : "left");
        }}
        onMediaDeviceFailure={() =>
          ToastError("We couldn't use your camera or microphone. Check your browser's permissions and try again.")
        }
        onError={(e) => ToastError(e.message || "Something went wrong in the classroom")}
        style={{ height: "100%" }}
      >
        {isObserver ? <ObserverView /> : <VideoConference />}
        <RoomAudioRenderer />
      </LiveKitRoom>

      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
        {join.recording && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1 text-xs font-medium text-white">
            <Circle className="h-2.5 w-2.5 animate-pulse fill-current" />
            Recording
          </span>
        )}
        {isObserver && (
          <span className="flex items-center gap-1.5 rounded-full bg-gray-800/90 px-3 py-1 text-xs font-medium text-white">
            <EyeOff className="h-3 w-3" />
            Observing - nobody can see you
          </span>
        )}
      </div>

      {isTutor && (
        <div className="absolute right-3 top-3">
          <Button size="sm" variant="destructive" disabled={ending} onClick={endForEveryone}>
            {ending ? "Ending..." : "End class for everyone"}
          </Button>
        </div>
      )}
    </div>
  );
}
