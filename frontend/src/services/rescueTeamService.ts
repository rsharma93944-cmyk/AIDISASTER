/**
 * ResQAI — Rescue Team Service
 * Provides backend-ready API abstraction with local persistence for field deployment,
 * incident dispatch, and telemetry tracking across North-East India.
 */

import { INITIAL_RESCUE_TEAMS, RescueTeam, RescueTeamStatus, RescueIncident } from '../data/rescueTeams';

const STORAGE_KEY = 'resqai_rescue_teams_v1';

/**
 * Helper to get teams from localStorage or default fallback
 */
function loadPersistedTeams(): RescueTeam[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load rescue teams from localStorage, using initial dataset:', err);
  }
  return INITIAL_RESCUE_TEAMS;
}

/**
 * Helper to save teams to localStorage
 */
function savePersistedTeams(teams: RescueTeam[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  } catch (err) {
    console.warn('Failed to persist rescue teams to localStorage:', err);
  }
}

/**
 * Fetch all rescue teams (prepared for future API swap)
 */
export async function getRescueTeams(): Promise<RescueTeam[]> {
  // Simulating async network response
  await new Promise(r => setTimeout(r, 10));
  return loadPersistedTeams();
}

/**
 * Fetch a single rescue team by ID
 */
export async function getRescueTeamById(id: string): Promise<RescueTeam | undefined> {
  const teams = loadPersistedTeams();
  return teams.find(t => t.id === id);
}

/**
 * Assign a rescue team to an incident and set status to 'En Route'
 */
export async function assignRescueTeam(
  teamId: string, 
  incident: RescueIncident,
  customEtaMinutes?: number
): Promise<RescueTeam> {
  const teams = loadPersistedTeams();
  const index = teams.findIndex(t => t.id === teamId);
  
  if (index === -1) {
    throw new Error(`Rescue team with ID '${teamId}' not found.`);
  }

  const team = teams[index];
  const eta = customEtaMinutes ?? Math.floor(Math.random() * 20) + 10;

  // Generate dynamic waypoints and route if needed
  const routeCoordinates: [number, number][] = [
    [team.currentLocation.lat, team.currentLocation.lng],
    [
      (team.currentLocation.lat + incident.coordinates.lat) / 2 + 0.01,
      (team.currentLocation.lng + incident.coordinates.lng) / 2 - 0.01,
    ],
    [incident.coordinates.lat, incident.coordinates.lng],
  ];

  const updatedTeam: RescueTeam = {
    ...team,
    status: 'En Route',
    assignedIncident: incident,
    etaMinutes: eta,
    speedKmh: 45,
    lastTelemetryUpdate: `Dispatched just now (ETA: ${eta} mins)`,
    routeCoordinates,
    waypoints: [
      { name: `${team.currentLocation.name} (Base)`, lat: team.currentLocation.lat, lng: team.currentLocation.lng, status: 'passed' },
      { name: 'En Route Highway Corridor', lat: routeCoordinates[1][0], lng: routeCoordinates[1][1], status: 'current', estimatedTime: `+${Math.floor(eta / 2)} mins` },
      { name: `${incident.locationName} (Incident Zone)`, lat: incident.coordinates.lat, lng: incident.coordinates.lng, status: 'upcoming', estimatedTime: `+${eta} mins` },
    ],
    notes: `Dispatched to ${incident.incidentCode} (${incident.locationName}) on emergency priority.`,
  };

  teams[index] = updatedTeam;
  savePersistedTeams(teams);
  return updatedTeam;
}

/**
 * Update the status of a rescue team ('Available' | 'En Route' | 'On Site' | 'Completed')
 */
export async function updateRescueTeamStatus(
  teamId: string, 
  status: RescueTeamStatus
): Promise<RescueTeam> {
  const teams = loadPersistedTeams();
  const index = teams.findIndex(t => t.id === teamId);
  
  if (index === -1) {
    throw new Error(`Rescue team with ID '${teamId}' not found.`);
  }

  const team = teams[index];
  let updatedTeam: RescueTeam = { ...team, status };

  if (status === 'Available') {
    updatedTeam = {
      ...team,
      status: 'Available',
      assignedIncident: undefined,
      etaMinutes: undefined,
      speedKmh: 0,
      lastTelemetryUpdate: 'Standing by at Base (Ready for dispatch)',
      routeCoordinates: undefined,
      waypoints: undefined,
    };
  } else if (status === 'On Site') {
    updatedTeam = {
      ...team,
      status: 'On Site',
      etaMinutes: 0,
      speedKmh: 0,
      lastTelemetryUpdate: 'On Scene — Conducting field operations & triage',
    };
  } else if (status === 'Completed') {
    updatedTeam = {
      ...team,
      status: 'Completed',
      etaMinutes: undefined,
      speedKmh: 0,
      lastTelemetryUpdate: 'Mission completed — Standing down for post-operation check',
    };
  }

  teams[index] = updatedTeam;
  savePersistedTeams(teams);
  return updatedTeam;
}

/**
 * Retrieve current location & telemetry coordinates for a team
 */
export async function getRescueTeamLocation(teamId: string): Promise<{
  lat: number;
  lng: number;
  locationName: string;
  district: string;
  state: string;
  status: RescueTeamStatus;
} | undefined> {
  const team = await getRescueTeamById(teamId);
  if (!team) return undefined;
  return {
    lat: team.currentLocation.lat,
    lng: team.currentLocation.lng,
    locationName: team.currentLocation.name,
    district: team.currentLocation.district,
    state: team.currentLocation.state,
    status: team.status,
  };
}

/**
 * Reset all rescue teams to initial factory demo state
 */
export function resetRescueTeamsData(): RescueTeam[] {
  savePersistedTeams(INITIAL_RESCUE_TEAMS);
  return INITIAL_RESCUE_TEAMS;
}

/**
 * Calculate high-level summary overview counts
 */
export function calculateRescueMetrics(teams: RescueTeam[]) {
  const available = teams.filter(t => t.status === 'Available').length;
  const enRoute = teams.filter(t => t.status === 'En Route').length;
  const onSite = teams.filter(t => t.status === 'On Site').length;
  const completed = teams.filter(t => t.status === 'Completed').length;
  const activeOperations = teams.filter(t => t.assignedIncident && (t.status === 'En Route' || t.status === 'On Site')).length;

  return {
    available,
    enRoute,
    onSite,
    completed,
    activeOperations,
    totalTeams: teams.length,
  };
}
