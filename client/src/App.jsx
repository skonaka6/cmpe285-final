import { useEffect, useState } from "react";
import { getItems, getResults, postVote } from "./api/client.js";

export default function App() {
  const [status, setStatus] = useState("Loading API stubs…");

  useEffect(() => {
    async function probeApi() {
      try {
        const [{ items }, { results }] = await Promise.all([
          getItems(),
          getResults(),
        ]);
        setStatus(
          `API connected. ${items.length} items, ${results.length} result rows. Swipe UI coming next.`
        );
      } catch (err) {
        setStatus(`API error: ${err.message}. Is the server running on :3000?`);
      }
    }

    probeApi();
  }, []);

  async function handleTestVote() {
    try {
      await postVote(1, "yes");
      const { results } = await getResults();
      const first = results.find((r) => r.itemId === 1);
      setStatus(
        `Test vote recorded. Item 1: ${first?.yesCount ?? 0} yes / ${first?.noCount ?? 0} no`
      );
    } catch (err) {
      setStatus(`Vote failed: ${err.message}`);
    }
  }

  return (
    <main style={{ padding: "1.5rem", maxWidth: 480, margin: "0 auto" }}>
      <h1>Swipe Vote</h1>
      <p>{status}</p>
      <button type="button" onClick={handleTestVote}>
        Test POST vote (item 1 = yes)
      </button>
    </main>
  );
}
