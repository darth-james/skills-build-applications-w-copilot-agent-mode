import { getJson } from '../api/client.js';
import { useApiData } from './useApiData.js';

type Workout = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };
type WorkoutResponse = { suggestions: Workout[] };

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const result = useApiData<WorkoutResponse>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`, getJson<WorkoutResponse>);
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {result.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
        {result.status === 'error' && <p role="alert">Unable to load workout suggestions.</p>}
        {result.status === 'success' && result.data.suggestions.length === 0 && <p>No workout suggestions available.</p>}
        {result.status === 'success' && result.data.suggestions.length > 0 && (
          <ul className="list-group list-group-flush">
            {result.data.suggestions.map((workout) => (
              <li className="list-group-item px-0" key={workout.title}>
                <strong>{workout.title}</strong>
                {workout.focus && <span> · {workout.focus}</span>}
                {workout.minutes !== undefined && <span className="d-block text-muted">{workout.minutes} minutes</span>}
                {workout.reason && <p className="mb-0">{workout.reason}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
