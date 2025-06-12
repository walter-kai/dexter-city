import React from 'react';
import BotCard from './BotCard';
import FilterPanel from './FilterPanel';

interface BuyingTabProps {
  filteredBotsWithRemoved: any[];
  currency: string;
  onOpenModal: (botId: string) => void;
  onAddToCart: (bot: any) => void;
  // Filter props
  search: string;
  setSearch: (value: string) => void;
  riskFilter: number | null;
  setRiskFilter: (value: number | null) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  categoryFilter: string[];
  setCategoryFilter: (value: string[]) => void;
  allCategories: string[];
  dragging: null | 'min' | 'max';
  setDragging: (value: null | 'min' | 'max') => void;
  MIN: number;
  MAX: number;
}

const BuyingTab: React.FC<BuyingTabProps> = ({
  filteredBotsWithRemoved,
  currency,
  onOpenModal,
  onAddToCart,
  search,
  setSearch,
  riskFilter,
  setRiskFilter,
  priceRange,
  setPriceRange,
  categoryFilter,
  setCategoryFilter,
  allCategories,
  dragging,
  setDragging,
  MIN,
  MAX,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <FilterPanel
        search={search}
        setSearch={setSearch}
        riskFilter={riskFilter}
        setRiskFilter={setRiskFilter}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        allCategories={allCategories}
        dragging={dragging}
        setDragging={setDragging}
        MIN={MIN}
        MAX={MAX}
      />
      {filteredBotsWithRemoved.map((bot) => (
        <BotCard
          key={bot.id}
          bot={bot}
          currency={currency}
          onView={onOpenModal}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default BuyingTab;
