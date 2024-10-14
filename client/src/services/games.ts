import Game, { League, GameArgs } from "../models/Game";

const BACKEND_URL = `https://backend-refactor-ubgdgpjm6a-uc.a.run.app`;

/**
 * Gets all the "current" games in the db
 *
 * @returns {ReadonlyArray<Game>} Returns the current games in the db.
 */
export const getGames = async (args: {
  leagues?: ReadonlyArray<League>;
  ids?: ReadonlyArray<string>;
  occursBefore?: Date;
  occursAfter?: Date;
}): Promise<ReadonlyArray<Game<unknown>>> => {
  const { leagues, occursBefore, occursAfter } = args;
  let queryParams = new URLSearchParams();
  if (leagues) {
    queryParams.append("leagues", leagues.join(","));
  }

  if (occursAfter) {
    queryParams.append("occursAfter", occursAfter.toISOString());
  }
  if (occursBefore) {
    queryParams.append("occursBefore", occursBefore.toISOString());
  }

  if (args.ids?.length) {
    queryParams.append("ids", args.ids.join(","));
  }

  const req = await fetch(`${BACKEND_URL}/api/games?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!req.ok) {
    throw new Error("There was an error fetching the current games");
  }

  const { games } = (await req.json()) as { games: GameArgs<unknown>[] };
  return games.map((game) => new Game(game));
};

export type GetGamePromptArgs = {
  associatedGameId?: string;
  associatedLeague?: string;
  dateStarts?: string;
  dateExpires?: string;
  ids?: readonly string[];
};
