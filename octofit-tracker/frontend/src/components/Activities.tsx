import { useApiData } from './useApiData.js';

type Activity = { type: string; minutes: number; points: number; occurredAt?: string };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const result = useApiData<ActivityResponse>('/api/activities');

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {result.status === 'loading' && <p role="status">Loading activities...</p>}
        {result.status === 'error' && <p role="alert">Unable to load activities.</p>}
        {result.status === 'success' && result.data.activities.length === 0 && <p>No activities yet.</p>}
        {result.status === 'success' && result.data.activities.length > 0 && (
          <ul className="list-group list-group-flush">
            {result.data.activities.map((activity, index) => (
              <li className="list-group-item px-0" key={`${activity.type}-${activity.occurredAt ?? index}`}>
                <strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
