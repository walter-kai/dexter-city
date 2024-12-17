import React, { useEffect, useRef, useState, useContext } from "react";
import { UserContext } from "../App";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { updateUser } from "../services/FirestoreUser";

const ItemTypes = {
  SPORT: "sport",
};

// Reorder function for drag-and-drop
const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1); 
  result.splice(endIndex, 0, removed);
  return result;
};

const grid = 8;

interface Sport {
  id: string;
  name: string;
}

const sportsOptions: Sport[] = [
  { id: "soccer", name: "Soccer" },
  { id: "basketball", name: "Basketball" },
  { id: "football", name: "Football" },
  { id: "baseball", name: "Baseball" },
  { id: "hockey", name: "Hockey" },
  { id: "tennis", name: "Tennis" },
  { id: "golf", name: "Golf" },
  { id: "rugby", name: "Rugby" },
];

interface OnboardFormProps {
  onComplete: (chosenName: string, favoriteSport: string[]) => void;
}

const SportItem = ({ sport, index, moveSport }: any) => {
  const [, ref] = useDrag({
    type: ItemTypes.SPORT,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.SPORT,
    hover(item: any) {
      if (item.index !== index) {
        moveSport(item.index, index);
        item.index = index; // Update the index for the dragged item
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} style={{ padding: grid * 2, margin: `0 0 ${grid}px 0`, background: "grey" }}>
      {sport.name}
    </div>
  );
};

const OnboardForm: React.FC<OnboardFormProps> = ({ onComplete }) => {
  const currentUser = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(0);
  const [userName, setUserName] = useState(currentUser?.firstName || '');
  const [favoriteTokens, setFavoriteTokens] = useState<Sport[]>([]);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Check if favoriteSports contains items and skip onboarding
    if (favoriteTokens.length > 0) {
      onComplete(userName, favoriteTokens.map((sport) => sport.name));
    } else{
      setFavoriteTokens(sportsOptions);
    }
  }, [favoriteTokens, onComplete, userName]); // Dependencies include favoriteSports and onComplete



  const handleNext = () => {
    if (currentPage === 1) {
      if (favoriteTokens.length === 0) {
        const updatedSports = reorder(sportsOptions, 0, 0);
        setFavoriteTokens(updatedSports);
      }
      onComplete(userName, favoriteTokens.map((sport) => sport.name));
      const updatedUser = {
        ...currentUser,
        firstName: currentUser?.firstName || userName,
        dateCreated: currentUser?.dateCreated || new Date(),
        favoriteTokens: favoriteTokens.map((sport) => sport.name),
        lastLoggedIn: new Date(),
        telegramId: currentUser?.telegramId || '',
        lastName: currentUser?.lastName || '',
        telegramHandle: currentUser?.telegramHandle || '',
        referralTelegramId: currentUser?.referralTelegramId || '',
        photoId: currentUser?.photoId || '',
        photoUrl: currentUser?.photoUrl || '',
      };
      updateUser(updatedUser);
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const moveSport = (fromIndex: number, toIndex: number) => {
    const updatedTokens = reorder(favoriteTokens, fromIndex, toIndex);
    setFavoriteTokens(updatedTokens);
  };

  const handleScroll = () => {
    const element = termsRef.current;
    if (element) {
      const isBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 25;
      setScrolledToBottom(isBottom);
    }
  };

  useEffect(() => {
    const element = termsRef.current;

    if (currentPage === 1 && element) {
      element.addEventListener("scroll", handleScroll);
      return () => {
        element.removeEventListener("scroll", handleScroll);
      };
    }
  }, [currentPage]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-md mx-auto p-4 mt-8 bg-white rounded-lg shadow-md">
        {currentPage === 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Welcome to the App! 🎉</h2>
            {currentUser?.photoUrl && (
              <img
                src={currentUser.photoUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full mb-4"
              />
            )}
            <p>Hello <strong>{userName}</strong>! 😊</p>
            <h2 className="text-xl font-semibold mb-4">⚽🏀 Please rank your favorite sports 🏈⚾</h2>
            <p>You can change this later in settings</p>
            <div>
              {favoriteTokens.map((sport, index) => (
                <SportItem key={sport.id} sport={sport} index={index} moveSport={moveSport} />
              ))}
            </div>
          </div>
        )}

        {currentPage === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Rules, Terms and Conditions 📜</h2>
            <p>Before completing your registration, please read and accept our rules:</p>
            <div
              ref={termsRef}
              className="overflow-y-scroll h-80 p-4 border border-gray-300 rounded mb-4"
            >
              <ul className="list-disc list-inside">
                <li>🤝 <strong>Be Respectful:</strong> Treat everyone with kindness and respect.</li>
                <li>🚫 <strong>No Spamming or Illegal Content:</strong> Keep the chat clean.</li>
                <li>🏆 <strong>Community Sharing:</strong> Stats will be shared with the community.</li>
                <li>🔒 <strong>Privacy Matters:</strong> Your data will be handled with care.</li>
                <li>⚠️ <strong>Play Responsibly:</strong> Enjoy the experience, but play responsibly.</li>
                <li>🔄 <strong>Terms Are Subject to Change:</strong> Rules may change as we grow.</li>
              </ul>
            </div>
            <p className="mt-4">Scroll down before you can continue.</p>
          </div>
        )}

        <div className="mt-4">
          {currentPage > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="btn-standard"
            disabled={currentPage === 1 && !scrolledToBottom}
          >
            {currentPage === 1 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default OnboardForm;
