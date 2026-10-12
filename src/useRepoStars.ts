import { useEffect, useState } from "react";
import snapshot from "./repo-stats.json";

export function useRepoStars() {
  const [stars, setStars] = useState(snapshot.stars);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    fetch("https://api.github.com/repos/draexon/pros", {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (
          !controller.signal.aborted &&
          Number.isSafeInteger(data?.stargazers_count) &&
          data.stargazers_count >= 0
        ) {
          setStars(data.stargazers_count);
          setLive(true);
        }
      })
      .catch(() => {})
      .finally(() => window.clearTimeout(timeout));
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);
  return { stars, live, verifiedAt: snapshot.verifiedAt };
}
