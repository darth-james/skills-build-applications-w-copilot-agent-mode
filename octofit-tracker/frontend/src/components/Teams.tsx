import { useApiData } from './useApiData.js';

type Team = { name: string; mascot?: string; members?: unknown[] };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  const result = useApiData<TeamResponse>('/api/teams');
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {result.status === 'loading' && <p role="status">Loading teams...</p>}
        {result.status === 'error' && <p role="alert">Unable to load teams.</p>}
        {result.status === 'success' && result.data.teams.length === 0 && <p>No teams yet.</p>}
        {result.status === 'success' && result.data.teams.length > 0 && (
          <ul className="list-group list-group-flush">
            {result.data.teams.map((team) => (
              <li className="list-group-item px-0" key={team.name}>
                <strong>{team.name}</strong>
                {team.mascot && <span> · {team.mascot}</span>}
                <span className="d-block text-muted">{team.members?.length ?? 0} members</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
