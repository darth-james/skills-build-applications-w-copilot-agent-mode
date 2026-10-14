import { getJson } from '../api/client.js';
import { useApiData } from './useApiData.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const result = useApiData<LeaderboardResponse>('/api/leaderboard', getJson<LeaderboardResponse>);
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {result.status === 'loading' && <p role="status">Loading leaderboard...</p>}
        {result.status === 'error' && <p role="alert">Unable to load leaderboard.</p>}
        {result.status === 'success' && result.data.leaderboard.length === 0 && <p>No leaderboard scores yet.</p>}
        {result.status === 'success' && result.data.leaderboard.length > 0 && (
          <ol className="list-group list-group-numbered list-group-flush">
            {result.data.leaderboard.map((entry) => (
              <li className="list-group-item d-flex justify-content-between px-0" key={entry.rank}>
                <span>{entry.teamName}</span>
                <strong>{entry.totalPoints} points</strong>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
