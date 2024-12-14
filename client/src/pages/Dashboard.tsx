import React, { useState, useEffect } from "react";
import TokenPairDropdown from "../components/TokenPairDropdown";
import AccountTradeList from "../components/AccountTradeList";

const Dashboard: React.FC = () => {


  return (
    <>

        <div className="flex flex-col items-center animate-fadeIn">
          <div className="relative w-full">
            <div className="p-1 font-bold w-full">
              <div className="absolute h-[265px] w-full bg-gradient-to-r from-white/10 via-black/20 to-white/10 blur-sm"></div>
              <div className="px-4 py-1 text-center">
                <h1 className="text-2xl font-bold mb-4">Binance Dashboard</h1>

                {/* Account Trade List Component */}
                {/* <AccountTradeList /> */}

                <TokenPairDropdown />
              </div>
            </div>
          </div>
        </div>
      
    </>
  );
};

export default Dashboard;
