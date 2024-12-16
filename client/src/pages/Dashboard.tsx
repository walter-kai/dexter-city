import React, { useState, useEffect } from "react";
import SearchExchangeInfo from "../components/SearchExchangeInfo";
import AccountTradeList from "../components/AccountTradeList";
import Profile from "./Profile";
import BinanceButton from "@/components/ButtonBinance";

const Dashboard: React.FC = () => {


  return (
    <>

        <div className="flex flex-col items-center animate-fadeIn">
          <div className="relative w-full">
            <div className="p-1 font-bold w-full">
              <div className="px-4 py-1 text-center">
                <Profile />
                {/* <BinanceButton /> */}
                <h1 className="text-2xl font-bold mb-4">Binance Dashboard</h1>

                {/* Account Trade List Component */}
                {/* <AccountTradeList /> */}

                <SearchExchangeInfo />
              </div>
            </div>
          </div>
        </div>
      
    </>
  );
};

export default Dashboard;
