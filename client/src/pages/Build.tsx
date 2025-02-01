import React, { useState } from "react";
import BuildForm from "../components/Build/Form";
import LivePrice from "../components/LivePrice";
// import { PairDetailsProvider } from "../contexts/PairDetails";

const BuildBot: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<string>("");

  return (
    // <PairDetailsProvider>
      <div className="h-[700px] mt-6 items-center bg-gray-800 z-1">
        <div className="flex z-3 h-full gap-4 mx-10">
          <BuildForm setSelectedPair={setSelectedPair} />
          <div className="w-3/4 mt-4">
            <LivePrice selectedPair={selectedPair} />
          </div>
        </div>
      </div>
    // </PairDetailsProvider>
  );
};

export default BuildBot;
