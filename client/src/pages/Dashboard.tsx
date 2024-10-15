import React, { useContext, useEffect, useState } from "react";
import LoadingScreenDots from "../components/LoadingScreenDots";
import { UserContext } from "../App";
import { getGames } from "../services/games";
import Game, { League, GameStatus } from "../models/Game";

const Dashboard: React.FC = () => {
  const currentUser = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Adjust this based on your actual user type
  const [games, setGames] = useState<Game<any>[]>([]); // Games state
  const [wagers, setWagers] = useState<{ [gameId: string]: number }>({});

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const gamesData = await getGames({
          occursBefore: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
          occursAfter: new Date(new Date().getTime()),
        });

        // Filter the games based on the leagues after fetching the data
        const filteredGames = gamesData.filter(game =>
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

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  // Handle wager change
  const handleWagerChange = (gameId: string, amount: number) => {
    setWagers((prevWagers) => ({
      ...prevWagers,
      [gameId]: amount,
    }));
  };

  // Handle placing a bet
  const placeBet = async (gameId: string, wagerAmount: number) => {
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
          telegramId: user?.id, // Assuming this is the correct field for the Telegram ID
        }),
      });

      const result = await response.json();

      if (result.test) {
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
    <>
      {loading ? (
        <div className="h-[270px]">
          <LoadingScreenDots />
        </div>
      ) : (
        <div className="flex flex-col items-center animate-fadeIn">
          <div className="relative w-full">
            <div className="p-1 font-bold w-full">
              <div className="absolute h-[265px] w-full bg-gradient-to-r from-white/10 via-black/20 to-white/10 blur-sm"></div>
              <div className="px-4 py-1 text-center">
                <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard!</h1>
                <div className="bg-white p-4 rounded shadow-md">
                  <h2 className="text-xl">Your Information</h2>
                  <p><strong>Handle:</strong> {user?.username || "Not set"}</p>
                  <p><strong>FIrstname:</strong> {user.firstName}</p>
                  <p><strong>Telegram ID:</strong> {user?.telegramid}</p>
                  <p><strong>Score:</strong> {user?.pickScore || 0}</p>
                </div>

                {/* Display the list of games */}
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

                            {/* Wager input and bet button */}
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
                              <button
                                onClick={() =>
                                  placeBet(game.getId(), wagers[game.getId()] || 0)
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
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
