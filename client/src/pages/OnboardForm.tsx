import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

// a little function to help us with reordering the result
const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

// grid size for spacing and styling
const grid = 8;

// Inline styles for draggable items
const getItemStyle = (
  isDragging: boolean,
  draggableStyle: React.CSSProperties | undefined
): React.CSSProperties => ({
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "lightgreen" : "grey",
  ...draggableStyle,
});

// Inline styles for droppable container
const getListStyle = (isDraggingOver: boolean): React.CSSProperties => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 250,
});

interface OnboardFormProps {
  telegramName: string;
  onComplete: (chosenName: string, favoriteSport: string[]) => void;
}

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


// ... rest of the code remains the same

const OnboardForm: React.FC<OnboardFormProps> = ({ telegramName, onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [userName, setUserName] = useState(telegramName);
  const [favoriteSports, setFavoriteSports] = useState<Sport[]>(sportsOptions);
  const [isChecked, setIsChecked] = useState(false); // Checkbox state
  const [scrolledToBottom, setScrolledToBottom] = useState(false); // Scrolling state

  const termsRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container

  const handleNext = () => {
    if (currentPage === 2) {
      onComplete(userName, favoriteSports.map((sport) => sport.name));
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = reorder(favoriteSports, result.source.index, result.destination.index);
    setFavoriteSports(items);
  };
  const handleScroll = () => {
    const element = termsRef.current;
    if (element) {
      const isBottom = 
        element.scrollTop + element.clientHeight >= element.scrollHeight;
      setScrolledToBottom(isBottom);
    }
  };
  

  useEffect(() => {
    const element = termsRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const element = termsRef.current;
    if (currentPage === 2 && element) {
      element.addEventListener("scroll", handleScroll);
      return () => {
        element.removeEventListener("scroll", handleScroll);
      };
    }
  }, [currentPage]); // Add currentPage as a dependency
  

  return (
    <div className="max-w-md mx-auto p-4 mt-8 bg-white rounded-lg shadow-md">
      {/* Page 1: Name */}
      {currentPage === 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Welcome to the App! 🎉</h2>
          <p>
            Hello <strong>{telegramName}</strong>! 😊
          </p>
          <p>Would you like to use this name in the app or create a new one?</p>
          <input
            type="text"
            value={userName}
            onChange={handleChange}
            className="border border-gray-300 rounded w-full p-2 mb-4"
            placeholder="Enter your name"
          />
        </div>
      )}

      {/* Page 2: Favorite Sports */}
      {currentPage === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">What's your favorite sport? ⚽🏀🏈⚾</h2>
          <p>Please rank your favorite sports:</p>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {favoriteSports.map((sport, index) => (
                    <Draggable key={sport.id} draggableId={sport.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          {sport.name}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Page 3: Rules, Terms, and Conditions */}
      {currentPage === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Rules, Terms and Conditions 📜</h2>
          <p>Before completing your registration, please read and accept our rules:</p>
          
          {/* Scrollable terms and conditions */}
          <div
            ref={termsRef}
            className="overflow-y-scroll h-80 p-4 border border-gray-300 rounded mb-4"
          >
          <ul className="list-disc list-inside">
            <li>🤝 <strong>Be Respectful:</strong> Treat everyone with kindness and respect. We’re all here to enjoy the game together!</li>
            <li>🚫 <strong>No Spamming or Illegal Content:</strong> Keep the chat clean and fun. Let’s keep it legal and enjoyable for everyone!</li>
            <li>🏆 <strong>Community Sharing:</strong> By playing this game, you agree that your stats will be shared with the community! This way, you’ll have full access to your data and can track your progress! 📊</li>
            <li>🔒 <strong>Privacy Matters:</strong> Your data will be handled with care in accordance with our privacy policy. Your information is safe with us!</li>
            <li>⚠️ <strong>Play Responsibly:</strong> Remember, this is a platform for fun! Enjoy the experience, but please play responsibly.</li>
            <li>🔄 <strong>Terms Are Subject to Change:</strong> Our rules may change as we grow, so keep an eye out for updates!</li>
          </ul>

          </div>

          <p className="mt-4">Scroll down before you can continue.</p>
        </div>
      )}

      {/* Navigation Buttons */}
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
          disabled={currentPage === 2 && !scrolledToBottom} // Disable if not checked or not scrolled to bottom
        >
          {currentPage === 2 ? "Complete" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default OnboardForm;

