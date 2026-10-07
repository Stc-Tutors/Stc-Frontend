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
import { Circle, Clock, DoorOpen, EyeOff, Loader2, PhoneOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastError } from "@/components/ui/custom/toast";
import { useUser } from "@/contexts/user-context";
import { useLiveClassSocket } from "@/hooks/use-live-class-socket";
import { EndLiveClassAction, JoinLiveClassAction } from "@/server/live-class";
import type { JoinInfo } from "@/types/live-class";
import { BackgroundBlurToggle, useNoiseSuppression } from "./LocalMediaEffects";
import ReactionsBar from "./ReactionsBar";
import ReportIssueButton from "./ReportIssueButton";
import SelfConnectionQuality from "./SelfConnectionQuality";
import WaitingRoomPanel from "./WaitingRoomPanel";

type Phase = "loading" | "waiting" | "prejoin" | "live" | "left" | "ended" | "error";

// Everything inside <LiveKitRoom> that needs room context via hooks - kept as
// its own component so it can call useNoiseSuppression/useLocalParticipant
// etc., which only work inside the room provider.
function RoomExtras({ lessonId, lessonTitle, isTutor }: { lessonId: string; lessonTitle: string; isTutor: boolean }) {
  useNoiseSuppression();
  return (
    <>
      {/* Docked above VideoConference's own built-in control bar (mute/camera/
          screen-share/leave), not on top of it - these are extra controls, not
          a replacement for the built-in ones. */}
      <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        <ReactionsBar />
        <BackgroundBlurToggle />
        <ReportIssueButton lessonId={lessonId} lessonTitle={lessonTitle} />
      </div>
      <div className="absolute bottom-20 right-3 z-10">
        <SelfConnectionQuality />
      </div>
      {isTutor && <WaitingRoomPanel lessonId={lessonId} />}
    </>
  );
}

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

// Shown to a LEARNER on a waiting-room-enabled lesson until the tutor (or an
// admin/HOD) admits them. Listens live for that - no polling needed.
function WaitingScreen({ lessonId, onAdmitted, onExit }: { lessonId: string; onAdmitted: () => void; onExit: () => void }) {
  const [denied, setDenied] = useState(false);
  useLiveClassSocket({
    onAdmitted: (payload) => {
      if (payload.lessonId === lessonId) onAdmitted();
    },
    onDenied: (payload) => {
      if (payload.lessonId === lessonId) setDenied(true);
    },
  });

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 py-16 text-center">
      <Clock className="h-8 w-8 text-gray-400" />
      {denied ? (
        <p className="max-w-sm text-sm text-gray-700">
          The tutor hasn&apos;t let you in yet. You can try again, or come back closer to the class start time.
        </p>
      ) : (
        <p className="max-w-sm text-sm text-gray-700">You&apos;re in the waiting room - the tutor will let you in shortly.</p>
      )}
      <Button variant="outline" onClick={onExit}>
        Back to my schedule
      </Button>
    </div>
  );
}

export default function LiveKitClassroom({ lessonId, onExit }: LiveKitClassroomProps) {
  const { user } = useUser();
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
    if (res.data.status === "waiting") {
      setPhase("waiting");
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
      if (res.data.status === "waiting") {
        setPhase("waiting");
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

  if (phase === "waiting") {
    return <WaitingScreen lessonId={lessonId} onAdmitted={requestJoin} onExit={onExit} />;
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
          defaults={{ username: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "", videoEnabled: true, audioEnabled: true }}
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
        {!isObserver && <RoomExtras lessonId={lessonId} lessonTitle={join.lesson.title} isTutor={isTutor} />}
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
