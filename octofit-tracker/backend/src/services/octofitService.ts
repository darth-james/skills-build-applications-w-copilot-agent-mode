import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length === 0) {
    throw Object.assign(new Error('Activity input is required'), { status: 400 });
  }
  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (typeof userId !== 'string' || !Types.ObjectId.isValid(userId) || typeof teamId !== 'string' || !Types.ObjectId.isValid(teamId)) {
    throw Object.assign(new Error('Valid userId and teamId are required'), { status: 400 });
  }
  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!userExists || !teamExists) {
    throw Object.assign(new Error('Activity user and team must exist'), { status: 400 });
  }
  if (typeof type !== 'string' || type.trim().length === 0 || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('Activity type and positive minutes are required'), { status: 400 });
  }
  return Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Team input is required'), { status: 400 });
  }
  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || name.trim().length === 0 || typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw Object.assign(new Error('Team name and mascot are required'), { status: 400 });
  }
  if (members !== undefined && !Array.isArray(members)) {
    throw Object.assign(new Error('Team members must be an array'), { status: 400 });
  }
  return Team.create({ name, mascot, members: members ?? [] });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: Team.collection.name, localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, 'team.name': 1 } },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
  ]);
  return totals.map(({ teamName, totalPoints }, index) => ({ teamName, totalPoints, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean(),
    Workout.find().lean(),
  ]);
  const activityFocuses = activities.map(({ type }) => {
    const normalizedType = type.toLowerCase();
    return ['run', 'walk', 'cycle'].includes(normalizedType) ? 'endurance' : normalizedType;
  });
  const goalFocus = user.fitnessGoal.toLowerCase();
  const score = (focus: string) => (focus.toLowerCase() === goalFocus ? 2 : activityFocuses.includes(focus.toLowerCase()) ? 1 : 0);
  return workouts
    .sort((left, right) => score(right.focus) - score(left.focus))
    .map((workout) => {
      const focus = workout.focus.toLowerCase();
      const activityIndex = activityFocuses.indexOf(focus);
      const reason = focus === goalFocus
        ? `Recommended for your ${user.fitnessGoal} goal.`
        : activityIndex >= 0
          ? `Builds on your recent ${activities[activityIndex].type} activity.`
          : `A complementary ${workout.focus} workout.`;
      return { ...workout, reason };
    });
}

export { User };
