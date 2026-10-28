import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PREFERENCES,
  MAX_WHEEL_SIZE,
  parseWheel,
  secureRandomIndex,
  shuffle,
  toDecisionMovie,
  validatePreferences,
  wheelRotation,
} from "../src/lib/decision.ts";

test("preferences are normalized into a strict provider-independent contract", () => {
  const result = validatePreferences({
    genres: [28, 28, 18],
    cast: [31, 31],
    api_key: "must-not-forward",
    url: "https://example.invalid",
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.genres, [28, 18]);
  assert.deepEqual(result.value.cast, [31]);
  assert.equal("api_key" in result.value, false);
  assert.equal("url" in result.value, false);
  assert.deepEqual(DEFAULT_PREFERENCES.genres, []);
});
test("invalid ranges and injected identifiers are rejected rather than ignored", () => {
  for (const value of [
    null,
    [],
    { yearFrom: 2020, yearTo: 2000 },
    { yearFrom: NaN },
    { minRating: 10 },
    { genres: [999999] },
    { cast: ["31&api_key=bad"] },
    { count: 100 },
    { maxRuntime: 1 },
  ])
    assert.equal(validatePreferences(value).ok, false);
});
test("wheel storage survives malformed JSON and excludes series and invalid entries", () => {
  assert.deepEqual(parseWheel("{broken"), []);
  assert.deepEqual(parseWheel("{}"), []);
  const values = [
    { id: 1, title: "A" },
    null,
    { id: 2, name: "Serie", media_type: "tv" },
    { id: 1, title: "A otra vez" },
    { id: -2, title: "Invalid" },
  ];
  assert.deepEqual(
    parseWheel(JSON.stringify(values)).map((v) => v.title),
    ["A"],
  );
});
test("stored wheel is bounded and public movie fields are whitelisted", () => {
  const values = Array.from({ length: 20 }, (_, id) => ({
    id: id + 1,
    title: `Film ${id + 1}`,
    privateToken: "secret",
    poster_path: "https://example.invalid/a.jpg",
  }));
  const result = parseWheel(JSON.stringify(values));
  assert.equal(result.length, MAX_WHEEL_SIZE);
  assert.equal("privateToken" in result[0], false);
  assert.equal(result[0].poster_path, null);
});
test("movie projection preserves real metadata without accepting malformed ratings", () => {
  const movie = toDecisionMovie({
    id: 42,
    title: "Película",
    poster_path: "/poster.jpg",
    vote_average: Infinity,
    vote_count: 123,
    release_date: "2014-11-05",
  });
  assert.equal(movie.poster_path, "/poster.jpg");
  assert.equal(movie.vote_average, 0);
  assert.equal(movie.vote_count, 123);
  assert.equal(movie.media_type, "movie");
});
test("Fisher-Yates selection is immutable and uses each bounded random draw", () => {
  const source = [1, 2, 3, 4];
  const sizes = [];
  const result = shuffle(source, (size) => {
    sizes.push(size);
    return 0;
  });
  assert.deepEqual(source, [1, 2, 3, 4]);
  assert.deepEqual(sizes, [4, 3, 2]);
  assert.deepEqual([...result].sort(), source);
  assert.throws(() => shuffle(source, () => 99), RangeError);
});
test("every winner is geometrically under the wheel pointer after repeated spins", () => {
  let rotation = 137;
  for (let count = 2; count <= 12; count++)
    for (let index = 0; index < count; index++) {
      const next = wheelRotation(rotation, index, count);
      assert.ok(next >= rotation + 1800);
      const center = (next + index * (360 / count)) % 360;
      assert.ok(Math.min(center, 360 - center) < 0.000001);
      rotation = next;
    }
});
test("invalid wheel states cannot produce a misleading winner", () => {
  for (const args of [
    [0, 0, 0],
    [0, 0, 1],
    [0, 3, 3],
    [0, -1, 3],
    [NaN, 0, 3],
  ])
    assert.throws(() => wheelRotation(...args), RangeError);
});
test("cryptographic choices stay within the candidate set", () => {
  for (const count of [1, 2, 3, 7, 12])
    for (let i = 0; i < 30; i++) {
      const index = secureRandomIndex(count);
      assert.ok(index >= 0 && index < count && Number.isInteger(index));
    }
  assert.throws(() => secureRandomIndex(0), RangeError);
});
