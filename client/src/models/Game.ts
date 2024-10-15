export enum SportApis {
  RAPIDAPI_FOOTBALL_V3 = "rapidapi-football-v3",
  RAPIDAPI_BASKETBALL_V1 = "rapidapi-basketball",
  MANUALLY_ADDED = "manually-added",
  RAPID_HOCKEY_V1 = "rapidapi-hockey-v1",
}

export enum GameStatus {
  TO_BE_DETERMINED,
  SCHEDULED,
  IN_PROGRESS,
  COMPLETE,
  POSTPONED,
  CANCELLED,
}

export enum League {
  EUROCUP_2024 = 0,         // Starts at 0
  WNBA_2024,                // 1
  UFC,                      // 2
  CRICKET_WC_2024,          // 3
  NBA_PLAYOFFS_2023_2024,    // 4
  NHL_PLAYOFFS_2023_2024,    // 5
  NHL_2023_2024,            // 6
  NBA_2023_2024,            // 7
  COPA_AMERICA_2024,        // 8
  NBA_2024_2025,            // 9
  NHL_2024_2025,            // 10
  CHAMPIONS_LEAGUE_2024_2025,// 11
  OLYMPICS_2024,            // 12
  MLB_2024,                 // 13
  CDL_2023_2024,            // 14
  WIMBLEDON_2024,           // 15
  NFL_2024,                 // 16
  EPL_2024,                 // 17
  NCAA_FOOTBALL_2024,       // 18
  TEXT                      // 19
}



// used to set the league filter on load by startapp parameter
export function getLeagueFromString(value: string): League | undefined {
  switch (value) {
    case "EUROCUP":
      return League.EUROCUP_2024;
    case "WNBA":
      return League.WNBA_2024;
    case "UFC":
      return League.UFC;
    case "COPA":
      return League.COPA_AMERICA_2024;
    case "NBA":
      return League.NBA_2024_2025;
    case "NHL":
      return League.NHL_2024_2025;
    case "CHAMPIONSLEAGUE":
      return League.CHAMPIONS_LEAGUE_2024_2025;
    case "OLYMPICS":
      return League.OLYMPICS_2024;
    case "MLB":
      return League.MLB_2024;
    case "CDL":
      return League.CDL_2023_2024;
    case "WIMBLEDON":
      return League.WIMBLEDON_2024;
    default:
      return undefined;
  }
}


export const convertExternalGameStatusToInternalGameStatus = (status: string): GameStatus => {
  switch (status) {
    case "FT":
    case "AOT":
    case "AET":
    case "PEN":
    case "AP":
      return GameStatus.COMPLETE;
    case "NS":
    case "AWD":
      return GameStatus.SCHEDULED;
    case "TBD":
      return GameStatus.TO_BE_DETERMINED;
    case "PST":
    case "POST":
      return GameStatus.POSTPONED;
    case "CANC":
    case "ABD":
    case "AWD":
    case "WO":
    case "SUSP":
    case "ABD":
      return GameStatus.CANCELLED;
    // Basketball
    case "Q1":
    case "Q2":
    case "Q3":
    case "Q4":
    case "OT":
    case "BT":
    case "HT":
    // Football
    case "1H":
    case "HT":
    case "2H":
    case "ET":
    case "BT":
    case "P":
    case "SUSP":
    case "INT":
    case "LIVE":
      return GameStatus.IN_PROGRESS;
    default:
      throw new Error(`Could not convert external game status ${status} to internal game status.`);
  }
};

export type TeamDetails = {
  //  ID for the API we pulled it from
  readonly apiId: string | null;
  readonly name: string;
  readonly abbrev: string;
  readonly score: string | null;
};

export interface GameArgs<T> {
  readonly id?: string;
  // Internal ID for the league
  readonly league: League;
  // ID of the match for the API we pulled it from
  readonly apiMatchId: string | null;
  // ID of the league for the API we pulled it from
  readonly apiLeagueId: string | null;
  readonly api: SportApis;
  // Date taking place
  readonly date: string;
  readonly teamADetails: TeamDetails;
  readonly teamBDetails: TeamDetails;
  readonly winner: "A" | "B" | null;
  readonly status: GameStatus;
  // Metadata specific to the sport api we pulled from
  readonly gameMetadata: T;
  readonly cancelled: boolean;
}



export default class Game<T> {
  readonly id?: string;
  // Internal ID for the league
  readonly league: League;
  // ID of the match for the API we pulled it from
  readonly apiMatchId: string | null;
  // ID of the league for the API we pulled it from
  readonly apiLeagueId: string | null;
  readonly api: SportApis;
  // Date taking place
  readonly date: Date;
  readonly teamADetails: TeamDetails;
  readonly teamBDetails: TeamDetails;
  readonly winner: "A" | "B" | null;
  readonly status: GameStatus;
  // Metadata specific to the sport api we pulled from
  readonly gameMetadata: T;
  readonly cancelled: boolean;

  constructor(args: GameArgs<T>) {
    this.id = args.id;
    this.date = new Date(args.date);
    this.apiMatchId = args.apiMatchId;
    this.apiLeagueId = args.apiLeagueId;
    this.api = args.api;
    this.league = args.league;
    this.teamADetails = args.teamADetails;
    this.teamBDetails = args.teamBDetails;
    this.winner = args.winner;
    this.status = args.status;
    this.gameMetadata = args.gameMetadata;
    this.cancelled = args.cancelled;
  }

  public toJson(): GameArgs<T> {
    return {
      id: this.getId(),
      apiMatchId: this.apiMatchId,
      date: this.date.toISOString(),
      league: this.league,
      apiLeagueId: this.apiLeagueId,
      api: this.api,
      teamADetails: this.teamADetails,
      teamBDetails: this.teamBDetails,
      winner: this.winner,
      status: this.status,
      gameMetadata: this.gameMetadata,
      cancelled: this.cancelled,
    };
  }

  public getId() {
    return `${this.api}:${this.league}:${this.apiMatchId}`;
  }
}

// NBA specific metadata interface
export interface NBAGameMetadata {
  quarter: number; // Current quarter
  timeRemaining: string; // Time remaining in the current quarter
  homeScore: number; // Home team score
  awayScore: number; // Away team score
  // Add more NBA-specific metadata as needed
}

// NBA Game class
// export class NBAGame implements GameArgs<NBAGameMetadata> {

//   // You can add NBA-specific methods here if needed
// }

// NHL specific metadata interface
export interface NHLGameMetadata {
  period: number; // Current period
  timeRemaining: string; // Time remaining in the current period
  homeScore: number; // Home team score
  awayScore: number; // Away team score
  // Add more NHL-specific metadata as needed
}

// NHL Game class
// export class NHLGame extends GameArgs<NHLGameMetadata> {

//   // You can add NHL-specific methods here if needed
// }
