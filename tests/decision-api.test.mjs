import test from "node:test";
import assert from "node:assert/strict";
const base = process.env.FYM_TEST_URL;
const options = { skip: !base, timeout: 30000 };

test(
  "decision API rejects malformed and oversized preferences",
  options,
  async () => {
    for (const body of [
      "{broken",
      JSON.stringify({ yearFrom: 2020, yearTo: 1990 }),
      JSON.stringify({ cast: ["31&api_key=bad"] }),
    ]) {
      const response = await fetch(`${base}/api/decide`, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      });
      assert.equal(response.status, 400);
      assert.equal(typeof (await response.json()).error, "string");
    }
    const large = await fetch(`${base}/api/decide`, {
      method: "POST",
      body: "a".repeat(9000),
    });
    assert.equal(large.status, 413);
  },
);
test(
  "server selection respects actor, year, genre and runtime filters",
  options,
  async () => {
    const response = await fetch(`${base}/api/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        genres: [18],
        cast: [31],
        yearFrom: 1994,
        yearTo: 1994,
        minRating: 7,
        maxRuntime: 180,
        count: 6,
      }),
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.ok(result.movies.length > 0 && result.movies.length <= 6);
    assert.ok(result.sampled <= 100 && result.total >= result.sampled);
    for (const movie of result.movies) {
      assert.equal(movie.media_type, "movie");
      assert.equal(movie.release_date.slice(0, 4), "1994");
      assert.ok(movie.genre_ids.includes(18));
      assert.ok(movie.vote_average >= 7);
      assert.ok(movie.vote_count >= 100);
      const detail = await (
        await fetch(`${base}/api/tmdb/movie/${movie.id}`)
      ).json();
      assert.ok(detail.runtime > 0 && detail.runtime <= 180);
      const credits = await (
        await fetch(`${base}/api/tmdb/movie/${movie.id}/credits`)
      ).json();
      assert.ok(credits.cast.some((person) => person.id === 31));
    }
    assert.doesNotMatch(
      JSON.stringify(result),
      /api_key|access_token|TMDB_API_KEY/,
    );
  },
);
test(
  "actor lookup returns only the public picker contract",
  options,
  async () => {
    const response = await fetch(`${base}/api/people?q=Tom%20Hanks`);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.ok(result.results.some((person) => person.id === 31));
    for (const person of result.results)
      assert.deepEqual(Object.keys(person).sort(), [
        "id",
        "known_for",
        "name",
        "profile_path",
      ]);
    assert.equal(
      (await fetch(`${base}/api/people?q=${"a".repeat(101)}`)).status,
      400,
    );
  },
);
