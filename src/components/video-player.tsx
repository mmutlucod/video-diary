import { VideoView, type VideoPlayer as ExpoVideoPlayer } from "expo-video";
import { View } from "react-native";

type Props = {
  player: ExpoVideoPlayer;
  nativeControls?: boolean;
  rounded?: boolean;
};

export function VideoPlayer({
  player,
  nativeControls = false,
  rounded = false,
}: Props) {
  return (
    <View
      className={`aspect-video w-full overflow-hidden bg-black ${
        rounded ? "rounded-2xl" : ""
      }`}
    >
      <VideoView
        player={player}
        style={{ flex: 1 }}
        contentFit="contain"
        nativeControls={nativeControls}
      />
    </View>
  );
}