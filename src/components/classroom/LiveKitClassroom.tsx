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
import {
  ArrowLeft,
  Circle,
  Clock,
  DoorOpen,
  EyeOff,
  Loader2,
  PenSquare,
  PhoneOff,
  ShieldAlert,
  Video as VideoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastError } from "@/components/ui/custom/toast";
import { useUser } from "@/contexts/user-context";
import { useLiveClassSocket } from "@/hooks/use-live-class-socket";
import { EndLiveClassAction, JoinLiveClassAction, RoamBreakoutAction } from "@/server/live-class";
import type { JoinInfo } from "@/types/live-class";
import AnnotatedScreenShare from "./AnnotatedScreenShare";
import BreakoutPanel from "./BreakoutPanel";
import { BackgroundBlurToggle, useNoiseSuppression } from "./LocalMediaEffects";
import ReactionsBar from "./ReactionsBar";
import ReportIssueButton from "./ReportIssueButton";
import SelfConnectionQuality from "./SelfConnectionQuality";
import WaitingRoomPanel from "./WaitingRoomPanel";
import WhiteboardPanel from "./WhiteboardPanel";

type Phase = "loading" | "waiting" | "prejoin" | "live" | "left" | "ended" | "error";

// Which LiveKit room this device is actually connected to right now - always
// the main room, unless a breakout session has either assigned this LEARNER
// into a group (moved by the tutor) or the TUTOR/an OBSERVER is roaming in to
// visit one. See LiveKitClassroom's roam handlers and BreakoutPanel.
type RoomContext = { kind: "main" } | { kind: "assigned"; roomId: string; label: string } | { kind: "visiting"; roomId: string; label: string };

interface RoomConnection {
  url: string;
  token: string;
  context: RoomContext;
}

// Everything inside <LiveKitRoom> that needs room context via hooks - kept as
// its own component so it can call useNoiseSuppression/useLocalParticipant
// etc., which only work inside the room provider.
function RoomExtras({
  lessonId,
  lessonTitle,
  isTutor,
  isMainRoom,
  onVisit,
}: {
  lessonId: string;
  lessonTitle: string;
  isTutor: boolean;
  isMainRoom: boolean;
  onVisit: (roomId: string, label: string) => void;
}) {
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
        <AnnotatedScreenShare />
      </div>
      <div className="absolute bottom-20 right-3 z-10">
        <SelfConnectionQuality />
      </div>
      {isTutor && <WaitingRoomPanel lessonId={lessonId} />}
      {/* Only shown from the main room - visiting a group is its own simple
          "Back to main room" button at the top level, not this panel. */}
      {isTutor && isMainRoom && <BreakoutPanel lessonId={lessonId} onVisit={onVisit} />}
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
  // The video room stays connected underneath (audio keeps playing) while the
  // whiteboard is open - this only toggles which one is VISIBLE, never
  // unmounts <LiveKitRoom>, so switching tabs never drops the call.
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  // Which actual LiveKit room <LiveKitRoom> below is pointed at - starts null
  // until the main room's own url/token are known (see the prejoin/observer
  // transitions below), then changes only via a breakout move/roam/return.
  const [connection, setConnection] = useState<RoomConnection | null>(null);

  // A LEARNER has no roam button of their own - the tutor moves them, and
  // moves them back, over the socket. Always listening while this component
  // is mounted (same as the waiting-room admit/deny listeners elsewhere) so
  // a move lands even if they're mid-prejoin.
  useLiveClassSocket({
    onBreakoutMove: (payload) => {
      if (payload.lessonId !== lessonId || join?.role !== "LEARNER") return;
      setConnection({ url: payload.url, token: payload.token, context: { kind: "assigned", roomId: payload.roomId, label: payload.label } });
    },
    onBreakoutEnded: (payload) => {
      if (payload.lessonId !== lessonId || join?.role !== "LEARNER") return;
      setConnection({ url: payload.url, token: payload.token, context: { kind: "main" } });
    },
  });

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
    if (res.data.role === "OBSERVER") {
      setConnection({ url: res.data.url, token: res.data.token, context: { kind: "main" } });
      setPhase("live");
    } else {
      setPhase("prejoin");
    }
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
      if (res.data.role === "OBSERVER") {
        setConnection({ url: res.data.url, token: res.data.token, context: { kind: "main" } });
        setPhase("live");
      } else {
        setPhase("prejoin");
      }
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

  // The tutor (or an observing admin/HOD) dropping in on a group - this
  // changes which LiveKit room THIS device is connected to; it never alters
  // who's actually assigned to the group.
  const visitRoom = async (roomId: string, label: string) => {
    const [res, err] = await RoamBreakoutAction(lessonId, roomId);
    if (err || !res?.data) return ToastError(err || "Couldn't switch rooms");
    setConnection({ url: res.data.url, token: res.data.token, context: { kind: "visiting", roomId, label } });
  };

  const backToMainRoom = async () => {
    const [res, err] = await RoamBreakoutAction(lessonId, "main");
    if (err || !res?.data) return ToastError(err || "Couldn't return to the main room");
    setConnection({ url: res.data.url, token: res.data.token, context: { kind: "main" } });
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
            setConnection({ url: join.url, token: join.token, context: { kind: "main" } });
            setPhase("live");
          }}
        />
      </div>
    );
  }

  if (!connection) return null;

  const isObserver = join.role === "OBSERVER";
  const isTutor = join.role === "TUTOR";
  const isMainRoom = connection.context.kind === "main";
  // Visiting a breakout group (tutor/observer dropping in) uses an OBSERVER
  // grant on that room regardless of this person's role in the main room -
  // same silent, watch-only view either way.
  const isObserverView = isObserver || connection.context.kind === "visiting";

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-black" data-lk-theme="default" style={{ height: "78dvh" }}>
      <LiveKitRoom
        key={connection.token}
        serverUrl={connection.url}
        token={connection.token}
        connect
        video={isObserverView ? false : (choices?.videoEnabled ?? true)}
        audio={isObserverView ? false : (choices?.audioEnabled ?? true)}
        options={{ adaptiveStream: true, dynacast: true }}
        onDisconnected={(reason) => {
          // Visiting a breakout room that the tutor then closed from
          // elsewhere isn't "the class ended" - fall back to the main room.
          if (connection.context.kind === "visiting") {
            void backToMainRoom();
            return;
          }
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
        {isObserverView ? <ObserverView /> : <VideoConference />}
        <RoomAudioRenderer />
        {!isObserverView && (
          <RoomExtras lessonId={lessonId} lessonTitle={join.lesson.title} isTutor={isTutor} isMainRoom={isMainRoom} onVisit={visitRoom} />
        )}
      </LiveKitRoom>

      {/* Overlaid on top of (never replacing) <LiveKitRoom> above, so toggling
          this never disconnects the call - audio keeps playing underneath
          even while the whiteboard covers the screen. */}
      {whiteboardOpen && (
        <div className="absolute inset-0 z-20 bg-white">
          <WhiteboardPanel lessonId={lessonId} />
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
        {join.recording && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1 text-xs font-medium text-white">
            <Circle className="h-2.5 w-2.5 animate-pulse fill-current" />
            Recording
          </span>
        )}
        {isObserverView && (
          <span className="flex items-center gap-1.5 rounded-full bg-gray-800/90 px-3 py-1 text-xs font-medium text-white">
            <EyeOff className="h-3 w-3" />
            Observing - nobody can see you
          </span>
        )}
        {connection.context.kind !== "main" && (
          <span className="flex items-center gap-1.5 rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-medium text-white">
            {connection.context.kind === "visiting" ? "Visiting" : "Breakout"}: {connection.context.label}
          </span>
        )}
      </div>

      <div className="absolute right-3 top-3 z-30 flex items-center gap-2">
        {connection.context.kind === "visiting" && (
          <Button size="sm" variant="secondary" onClick={backToMainRoom}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to main room
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => setWhiteboardOpen((open) => !open)}>
          {whiteboardOpen ? (
            <>
              <VideoIcon className="mr-2 h-4 w-4" />
              Back to video
            </>
          ) : (
            <>
              <PenSquare className="mr-2 h-4 w-4" />
              Whiteboard
            </>
          )}
        </Button>
        {isTutor && (
          <Button size="sm" variant="destructive" disabled={ending} onClick={endForEveryone}>
            {ending ? "Ending..." : "End class for everyone"}
          </Button>
        )}
      </div>
    </div>
  );
}
