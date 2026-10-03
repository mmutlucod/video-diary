# Video Diary

A React Native (Expo) app to import a video, crop a 5-second segment, add a name and description, and keep the result in a persistent list.

## Features

- Import a video from the device gallery
- Select a 5-second segment with a draggable scrubber and a looping live preview
- Add a name and description (validated with Zod)
- Crop natively with `expo-trim-video`, executed through a TanStack Query mutation
- Persistent list of clips backed by SQLite
- Detail page with playback, metadata and delete

## Tech stack

Expo (SDK 56) · Expo Router · Zustand · TanStack Query · expo-trim-video · NativeWind · expo-video · expo-sqlite · React Native Reanimated + Gesture Handler · Zod

## Getting started

`expo-trim-video` is a native module, so the app does **not** run in Expo Go. A development build is required.

```bash
npm install
npx expo prebuild
npx expo run:ios       # macOS only
npx expo run:android
```

Afterwards, `npx expo start --dev-client` is enough.

Requirements: Node LTS, Xcode 26.5+ for iOS (older versions fail to compile `expo-modules-jsi`), Android Studio with an emulator or device.

## Usage

1. Tap **+** on the home screen.
2. Pick a video (at least 5 seconds long).
3. Drag the window on the scrubber to choose the segment, then continue.
4. Enter a name (required) and an optional description, then tap **Crop and save**.
5. Tap a card on the home screen to open its detail page; use **Delete** to remove it.

## Architecture

| Concern | Tool | Notes |
|---|---|---|
| Persistent data | SQLite (`expo-sqlite`) | Versioned migrations via `PRAGMA user_version` |
| Server/async state | TanStack Query | Reads, writes and the trim operation |
| Wizard state | Zustand | Source video, duration and start time only |
| Validation | Zod | Shared limits from `constants/app.ts` |
| Navigation | Expo Router | Crop flow is a modal stack |

```
src/
  app/            routes only (index, video/[id], crop/select|trim|details)
  components/     VideoCard, Scrubber, FormField
  constants/      clip duration, DB name, field limits
  db/             migrations, schema/mappers, video repository
  hooks/          useVideos, useVideo, useDeleteVideo, useCreateVideo
  schemas/        Zod form schema
  store/          crop wizard store
  utils/          file helpers, time formatting, trim error mapping
```

Save flow (`useCreateVideo`): `trimVideo` → move output to `documentDirectory/videos` → insert row → invalidate the list query. If the insert fails, the moved file is removed so no orphan files remain.

## Key decisions

- **SQLite for the list, Zustand only for the wizard.** Persistent, queryable data lives in a database; Zustand holds short-lived UI state that is reset when the modal closes.
- **Relative file paths in the DB.** The iOS app container path can change between installs/updates, so the DB stores `videos/<timestamp>.mp4` and the absolute URI is resolved on read.
- **Trim output is moved out of the cache** into the document directory, because the OS may purge cache files.
- **Repository functions take `db` as an argument**, keeping the data layer independent of React and easy to test.
- **Scrubber uses a fixed-width window** (clip length / video length) so the selection is always exactly 5 seconds; the preview loops only that range.
- **Memoized list items** with stable callbacks and `keyExtractor` for smooth `FlatList` scrolling.

## Known limitations

- On Android, `expo-trim-video` copies samples without re-encoding, so the cut snaps to the nearest keyframe and the real duration may differ slightly from 5.00 s.
- No list thumbnails: `expo-video-thumbnails` is deprecated and removed in SDK 56, and `expo-video`'s `generateThumbnailsAsync` requires a player instance per video. A saved-at-creation thumbnail would be the next improvement.
- Light theme only.

## Possible next steps

- Persist thumbnails generated at save time
- Dark mode
- Unit tests for the repository and Zod schema