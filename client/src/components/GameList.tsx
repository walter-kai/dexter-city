import React, { useEffect, useState } from "react";
import { getGames } from "../services/FirestoreGames";
import Game, { League, GameStatus } from "../models/Game";

const GameList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game<any>[]>([]); // Games state
  const [wagers, setWagers] = useState<{ [gameId: string]: number }>({});
  const [spreads, setSpreads] = useState<{ [gameId: string]: number }>({});

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const gamesData = await getGames({
          occursBefore: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
          occursAfter: new Date(new Date().getTime()),
        });

        // Filter the games based on the leagues after fetching the data
        const filteredGames = gamesData.filter((game) =>
          [League.EPL_2024, League.NFL_2024].includes(game.league)
        );
        setGames(filteredGames);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
      setLoading(false);
    };

    fetchGames();
  }, []);

  // Handle wager change
  const handleWagerChange = (gameId: string, amount: number) => {
    setWagers((prevWagers) => ({
      ...prevWagers,
      [gameId]: amount,
    }));
  };

  // Handle spread change
  const handleSpreadChange = (gameId: string, spread: number) => {
    setSpreads((prevSpreads) => ({
      ...prevSpreads,
      [gameId]: spread,
    }));
  };

  // Handle placing a bet
  const placeBet = async (gameId: string, wagerAmount: number, spread: number) => {
    if (!gameId || wagerAmount <= 0 || wagerAmount > 10) {
      alert("Invalid wager amount. Please choose a value between 1 and 10.");
      return;
    }

    try {
      const response = await fetch(`/api/game/bet/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
          wagerAmount,
          spread,
          vig: -105,
          // Assuming user context or id is available
          telegramId: "user-id", // Update this with the actual user id
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Bet placed successfully!");
      } else {
        alert("Failed to place the bet.");
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("An error occurred while placing the bet.");
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading games...</p>
      ) : (
        <div className="mt-6 bg-white p-4 rounded shadow-md">
          <h2 className="text-xl mb-2">Upcoming Games</h2>
          {games.length === 0 ? (
            <p>No games available</p>
          ) : (
            <ul>
              {games.map((game) => (
                <li key={game.getId()} className="mb-4">
                  <div className="p-2 border rounded">
                    <p><strong>League:</strong> {game.league}</p>
                    <p><strong>Teams:</strong> {game.teamADetails.name} vs {game.teamBDetails.name}</p>
                    <p><strong>Date:</strong> {game.date.toDateString()}</p>
                    <p><strong>Status:</strong> {GameStatus[game.status]}</p>
                    <p><strong>Vig:</strong> -105</p>

                    {/* Wager input, spread input, and bet button */}
                    <div className="mt-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={wagers[game.getId()] || 0}
                        onChange={(e) =>
                          handleWagerChange(game.getId(), parseInt(e.target.value, 10))
                        }
                        className="border p-1 rounded w-20"
                      />
                      <input
                        type="number"
                        step="0.5"
                        value={spreads[game.getId()] || 0}
                        onChange={(e) =>
                          handleSpreadChange(game.getId(), parseFloat(e.target.value))
                        }
                        className="border p-1 rounded w-20 ml-2"
                        placeholder="+/- Spread"
                      />
                      <button
                        onClick={() =>
                          placeBet(game.getId(), wagers[game.getId()] || 0, spreads[game.getId()] || 0)
                        }
                        className="ml-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                      >
                        Place Bet
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GameList;
