import type { SQLiteDatabase } from "expo-sqlite";

import { videoRepository } from "./video-repository";

// expo-file-system'e bağımlı olmadan URI çözümlemesini taklit et.
jest.mock("@/utils/file", () => ({
  resolveVideoUri: (path: string) => `file:///docs/${path}`,
}));

/** En yeniden eskiye sıralı n satır: id n..1 */
const makeRows = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const id = n - i;
    return {
      id,
      name: `video ${id}`,
      description: "",
      uri: `videos/${id}.mp4`,
      duration: 5,
      created_at: 1000 + id,
    };
  });

const makeDb = (rows: ReturnType<typeof makeRows>) => {
  const getAllAsync = jest.fn().mockResolvedValue(rows);
  return { db: { getAllAsync } as unknown as SQLiteDatabase, getAllAsync };
};

describe("videoRepository.getPage", () => {
  it("returns no cursor when there are fewer rows than the limit", async () => {
    const { db } = makeDb(makeRows(2));
    const page = await videoRepository.getPage(db, null, 3);

    expect(page.items).toHaveLength(2);
    expect(page.nextCursor).toBeNull();
  });

  it("returns no cursor when rows exactly match the limit", async () => {
    const { db } = makeDb(makeRows(3));
    const page = await videoRepository.getPage(db, null, 3);

    expect(page.items).toHaveLength(3);
    expect(page.nextCursor).toBeNull();
  });

  it("trims the extra row and returns a cursor when more pages exist", async () => {
    const { db } = makeDb(makeRows(3)); // limit 2 -> 3 satır gelir
    const page = await videoRepository.getPage(db, null, 2);

    expect(page.items.map((v) => v.id)).toEqual([3, 2]);
    expect(page.nextCursor).toEqual({ createdAt: 1002, id: 2 });
  });

  it("requests limit + 1 rows without a cursor", async () => {
    const { db, getAllAsync } = makeDb([]);
    await videoRepository.getPage(db, null, 2);

    expect(getAllAsync).toHaveBeenCalledWith(expect.any(String), 3);
  });

  it("passes the cursor values when continuing", async () => {
    const { db, getAllAsync } = makeDb([]);
    await videoRepository.getPage(db, { createdAt: 1002, id: 2 }, 2);

    expect(getAllAsync).toHaveBeenCalledWith(expect.any(String), 1002, 2, 3);
  });

  it("maps rows to the app model with a resolved uri", async () => {
    const { db } = makeDb(makeRows(1));
    const page = await videoRepository.getPage(db, null, 5);

    expect(page.items[0]).toMatchObject({
      id: 1,
      createdAt: 1001,
      uri: "file:///docs/videos/1.mp4",
    });
  });
});