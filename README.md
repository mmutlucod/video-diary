# Video Diary

A React Native (Expo) app to import a video, crop a 5-second segment, add a name and description, and keep the result in a persistent, paginated list.

## Features

- Import a video from the device gallery (videos shorter than 5 seconds are rejected)
- Select a 5-second segment with a draggable scrubber and a looping live preview
- Add a name and description, validated with Zod
- Crop natively with `expo-trim-video`, executed through a TanStack Query mutation
- Persistent list of clips backed by SQLite, loaded in pages
- Detail page with playback, metadata and delete
- Edit page to update a clip's name and description
- Reanimated animations: staggered list entrance, FAB press feedback, detail entrance

   ## Demo

   **Android**
  
  https://github.com/user-attachments/assets/5e574365-7112-402a-90e3-43ca63d50746

   **iOS**

https://github.com/user-attachments/assets/59e17528-7399-4d08-89b2-d5cf8d62079e



## Tech stack

Expo (SDK 57) · Expo Router · Zustand · TanStack Query · expo-trim-video · NativeWind · expo-video · expo-sqlite · React Native Reanimated + Gesture Handler · Zod · Jest

## Getting started

`expo-trim-video` is a native module, so the app does **not** run in Expo Go. A development build is required.

```bash
npm install
npx expo prebuild
npx expo run:ios       # macOS only
npx expo run:android
```

Afterwards, `npx expo start --dev-client` is enough.

Requirements: Node LTS, Android Studio with an emulator or device, and on macOS an Xcode version supported by Expo SDK 57 (older Xcode versions can fail to compile native modules).

## Usage

1. Tap **+** on the home screen.
2. Pick a video (at least 5 seconds long).
3. Drag the window on the scrubber to choose the segment, then continue.
4. Enter a name (required) and an optional description, then tap **Crop and save**.
5. Tap a card on the home screen to open its detail page. From there you can edit the metadata or delete the clip.

## Tests

```bash
npm test
```

Unit tests cover the pure logic: the Zod form schema, trim error mapping, duration formatting and the repository's cursor pagination (against a stubbed database).

## Architecture

| Concern | Tool | Notes |
|---|---|---|
| Persistent data | SQLite (`expo-sqlite`) | Versioned migrations via `PRAGMA user_version` |
| Async state | TanStack Query | Paginated reads, writes and the trim operation |
| Wizard state | Zustand | Source video, duration and start time only |
| Validation | Zod | Shared limits from `constants/app.ts` |
| Navigation | Expo Router | The crop flow and the edit page are modals |
| Animation | Reanimated | Scrubber, list entrance, FAB |

The code is split by responsibility: `app/` holds routes only, `db/` the migrations and repository, `hooks/` the TanStack Query hooks, and `components/` the reusable UI. `MetadataForm` is shared by the crop flow and the edit page, and `VideoPlayer` by the trim preview and the detail page.

Save flow (`useCreateVideo`): `trimVideo` → move the output to the document directory → insert a row → invalidate queries. If the insert fails, the moved file is removed so no orphan files remain.

## Key decisions

- **SQLite for the list, Zustand only for the wizard.** Persistent, queryable data lives in a database; Zustand holds short-lived UI state that is reset when the modal closes.
- **Keyset pagination.** The list loads 20 clips at a time using a `(created_at, id)` cursor backed by a composite index, so every page costs the same regardless of list size and inserts do not shift pages. A separate `COUNT` query drives the header counter.
- **Relative file paths in the DB.** The iOS app container path can change between installs and updates, so the DB stores `videos/<timestamp>.mp4` and the absolute URI is resolved on read.
- **Trim output is moved out of the cache** into the document directory, because the OS may purge cache files.
- **Repository functions take `db` as an argument**, keeping the data layer independent of React and easy to test.
- **Scrubber uses a fixed-width window** (clip length / video length), so the selection is always exactly 5 seconds. Seeking and store updates are throttled during a drag, and the exact value is committed when the finger lifts.
- **Memoized list items** with stable callbacks and a `keyExtractor` for smooth `FlatList` scrolling.

## Known limitations

- On Android, `expo-trim-video` copies samples without re-encoding, so the cut snaps to the nearest keyframe and the real duration may differ slightly from 5.00 s.
- On iOS, the library re-encodes with `AVAssetExportSession`, so trim time grows with the source resolution and is slower on simulators.
- No list thumbnails: `expo-video-thumbnails` is deprecated, and `expo-video`'s `generateThumbnailsAsync` requires a player instance per video.
- Light theme only.

## Possible next steps

- Persist thumbnails generated at save time
- Dark mode
- Component and end-to-end tests
