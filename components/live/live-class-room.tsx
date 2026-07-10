import { Ionicons } from '@expo/vector-icons';
import {
  LiveKitRoom,
  VideoTrack,
  isTrackReference,
  useLocalParticipant,
  useParticipants,
  useTracks,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import type { StreamRole } from '@/services/api/live-streaming.api';

type LiveClassRoomProps = {
  token: string;
  serverUrl: string;
  role: StreamRole;
  classTitle: string;
  onLeave: () => void;
  onEndForAll?: () => void;
};

function ControlButton({
  icon,
  label,
  active,
  danger,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.controlBtn,
        danger && styles.controlDanger,
        active && styles.controlActive,
        pressed && { opacity: 0.85 },
      ]}>
      <Ionicons name={icon} size={22} color="#fff" />
      <Text style={styles.controlLabel}>{label}</Text>
    </Pressable>
  );
}

function RoomBody({
  role,
  classTitle,
  onLeave,
  onEndForAll,
}: Omit<LiveClassRoomProps, 'token' | 'serverUrl'>) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], {
    onlySubscribed: false,
  });

  const hostTrack = useMemo(() => {
    const publishable = tracks.filter(isTrackReference);
    const host = publishable.find((t) => {
      try {
        const meta = t.participant.metadata ? JSON.parse(t.participant.metadata) : null;
        return meta?.role === 'host';
      } catch {
        return false;
      }
    });
    if (host) return host;
    return publishable.find((t) => t.participant.identity !== localParticipant?.identity) || publishable[0];
  }, [tracks, localParticipant?.identity]);

  const participantCount = participants.length;

  return (
    <View style={[styles.room, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.topBar}>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN VIVO</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {classTitle}
        </Text>
        <View style={styles.countPill}>
          <Ionicons name="people" size={14} color="#fff" />
          <Text style={styles.countText}>{participantCount}</Text>
        </View>
      </View>

      <View style={[styles.stage, { minHeight: Math.min(height * 0.55, width * 1.2) }]}>
        {hostTrack && isTrackReference(hostTrack) ? (
          <VideoTrack trackRef={hostTrack} style={styles.video} objectFit="cover" />
        ) : (
          <View style={styles.waiting}>
            <ActivityIndicator color={FitnexiaColors.primary} size="large" />
            <Text style={styles.waitingText}>
              {role === 'host'
                ? 'Activá la cámara para comenzar'
                : 'Esperando al instructor…'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {role === 'host' ? (
          <>
            <ControlButton
              icon={isMicrophoneEnabled ? 'mic' : 'mic-off'}
              label={isMicrophoneEnabled ? 'Mic' : 'Mute'}
              active={!isMicrophoneEnabled}
              onPress={() => void localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled)}
            />
            <ControlButton
              icon={isCameraEnabled ? 'videocam' : 'videocam-off'}
              label="Cámara"
              active={!isCameraEnabled}
              onPress={() => void localParticipant?.setCameraEnabled(!isCameraEnabled)}
            />
            {onEndForAll ? (
              <ControlButton icon="stop-circle" label="Terminar" danger onPress={onEndForAll} />
            ) : null}
          </>
        ) : null}
        <ControlButton icon="exit-outline" label="Salir" danger onPress={onLeave} />
      </View>

      {role === 'participant' ? (
        <Text style={styles.hint}>
          Estás en modo alumno: ves y escuchás al instructor. No hace falta otra app.
        </Text>
      ) : (
        <Text style={styles.hint}>Sos el anfitrión. Los alumnos con reserva confirmada pueden unirse.</Text>
      )}
    </View>
  );
}

export function LiveClassRoom(props: LiveClassRoomProps) {
  const { token, serverUrl, role, classTitle, onLeave, onEndForAll } = props;
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { AudioSession } = await import('@livekit/react-native');
        await AudioSession.startAudioSession();
        if (!cancelled) setAudioReady(true);
      } catch {
        if (!cancelled) setAudioReady(true);
      }
    })();
    return () => {
      cancelled = true;
      import('@livekit/react-native')
        .then(({ AudioSession }) => AudioSession.stopAudioSession())
        .catch(() => {});
    };
  }, []);

  if (!audioReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect
      audio={role === 'host'}
      video={role === 'host'}
      onDisconnected={onLeave}
      options={{
        adaptiveStream: { pixelDensity: 'screen' },
      }}>
      <RoomBody
        role={role}
        classTitle={classTitle}
        onLeave={onLeave}
        onEndForAll={onEndForAll}
      />
    </LiveKitRoom>
  );
}

const styles = StyleSheet.create({
  room: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  loading: {
    flex: 1,
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  title: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  stage: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  video: { width: '100%', height: '100%' },
  waiting: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  waitingText: { color: '#9ca3af', fontSize: 15, textAlign: 'center' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 72,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  controlActive: { backgroundColor: 'rgba(239,68,68,0.35)' },
  controlDanger: { backgroundColor: '#b91c1c' },
  controlLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },
  hint: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
});
