import React, { useState } from 'react';
import { Search, X, Filter, Send, MapPin, CreditCard, Info } from 'lucide-react';

// Sample data
const CREDIT_CARDS = [
  { id: 'chase-sapphire', name: 'Chase Sapphire Preferred', pointsName: 'Ultimate Rewards', program: 'Chase Ultimate Rewards', valuationCPP: 1.25 },
  { id: 'amex-platinum', name: 'American Express Platinum', pointsName: 'Membership Rewards', program: 'American Express Membership Rewards', valuationCPP: 1.1 },
  { id: 'capital-one-venture', name: 'Capital One Venture', pointsName: 'Venture Miles', program: 'Capital One Rewards', valuationCPP: 1.0 },
  { id: 'citi-premier', name: 'Citi Premier', pointsName: 'ThankYou Points', program: 'Citi ThankYou', valuationCPP: 1.0 },
  { id: 'bilt-mastercard', name: 'Bilt Mastercard', pointsName: 'Bilt Points', program: 'Bilt Rewards', valuationCPP: 1.25 },
  { id: 'wells-fargo-autograph', name: 'Wells Fargo Autograph', pointsName: 'Rewards Points', program: 'Wells Fargo Rewards', valuationCPP: 1.0 }
];

const AIRLINES = [
  { id: 'united', name: 'United Airlines', alliance: 'Star Alliance' },
  { id: 'delta', name: 'Delta Airlines', alliance: 'SkyTeam' },
  { id: 'american', name: 'American Airlines', alliance: 'OneWorld' },
  { id: 'british', name: 'British Airways', alliance: 'OneWorld' },
  { id: 'lufthansa', name: 'Lufthansa', alliance: 'Star Alliance' },
  { id: 'air-france', name: 'Air France', alliance: 'SkyTeam' }
];

// Card transfer partners
const TRANSFER_PARTNERS = {
  'chase-sapphire': ['united', 'british', 'air-france'],
  'amex-platinum': ['delta', 'british', 'air-france'],
  'capital-one-venture': ['british', 'air-france', 'lufthansa'],
  'citi-premier': ['air-france', 'american'],
  'bilt-mastercard': ['united', 'american', 'air-france', 'british'],
  'wells-fargo-autograph': ['american']
};

// Regional point ceilings by fare class
const FARE_CLASS_CEILINGS = {
  'Europe': {
    'economy': 70000,
    'premium-economy': 80000,
    'business': 140000,
    'first': 160000
  },
  'Asia': {
    'economy': 100000,
    'premium-economy': 150000,
    'business': 200000,
    'first': 240000
  }
};

// Airports and routes
const AIRPORTS = [
  { code: 'JFK', name: 'New York JFK' },
  { code: 'LAX', name: 'Los Angeles' },
  { code: 'ORD', name: 'Chicago O\'Hare' }
];

const AIRPORT_ROUTES = {
  'JFK': ['tokyo', 'paris', 'london'],
  'LAX': ['tokyo', 'london'],
  'ORD': ['paris', 'london']
};

// Destinations
const DESTINATIONS = [
  { 
    id: 'tokyo', 
    name: 'Tokyo, Japan',
    region: 'Asia',
    pointCosts: { 
      'united': 70000,
      'delta': 80000, 
      'american': 70000,
      'british': 90000,
      'lufthansa': 85000,
      'air-france': 85000
    },
    taxes: {
      'united': 55,
      'delta': 67,
      'american': 59,
      'british': 220,
      'lufthansa': 190,
      'air-france': 165
    },
    imageUrl: '/api/placeholder/500/300',
    description: 'Vibrant metropolis blending ultramodern with traditional.'
  },
  {
    id: 'paris',
    name: 'Paris, France',
    region: 'Europe',
    pointCosts: {
      'united': 60000,
      'delta': 70000,
      'american': 60000,
      'british': 50000,
      'lufthansa': 55000,
      'air-france': 60000
    },
    taxes: {
      'united': 83,
      'delta': 93,
      'american': 89,
      'british': 150,
      'lufthansa': 195,
      'air-france': 120
    },
    imageUrl: '/api/placeholder/500/300',
    description: 'City of lights, romance, and world-class cuisine.'
  },
  {
    id: 'london',
    name: 'London, UK',
    region: 'Europe',
    pointCosts: {
      'united': 60000,
      'delta': 70000,
      'american': 60000,
      'british': 40000,
      'lufthansa': 55000,
      'air-france': 60000
    },
    taxes: {
      'united': 190,
      'delta': 210,
      'american': 185,
      'british': 150,
      'lufthansa': 215,
      'air-france': 195
    },
    imageUrl: '/api/placeholder/500/300',
    description: 'Iconic city with royal heritage and modern culture.'
  }
];

const PointsExplorer = () => {
  const [selectedCard, setSelectedCard] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [maxTaxRate, setMaxTaxRate] = useState('');
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [regionFilter, setRegionFilter] = useState('');
  const [fareClassFilter, setFareClassFilter] = useState('economy');
  const [tripType, setTripType] = useState('roundtrip');
  const [departureAirport, setDepartureAirport] = useState('');
  const [showApiInfo, setShowApiInfo] = useState(false);
  
  // Get unique regions
  const regions = [...new Set(DESTINATIONS.map(dest => dest.region))];
  
  // Get unique card programs
  const cardPrograms = [...new Set(CREDIT_CARDS.map(card => card.program))];
  
  // Filter cards by program
  const [cardProgramFilter, setCardProgramFilter] = useState('');
  const filteredCards = cardProgramFilter 
    ? CREDIT_CARDS.filter(card => card.program === cardProgramFilter)
    : CREDIT_CARDS;
  
  // Get available airlines for selected card
  const availableAirlines = selectedCard ? 
    AIRLINES.filter(airline => TRANSFER_PARTNERS[selectedCard]?.includes(airline.id)) : 
    [];
    
  const handleSearch = () => {
    if (!selectedCard) return;
    
    // Get user points amount or use infinity if not specified
    let userPointsAmount = pointsAmount ? parseInt(pointsAmount) : Infinity;
    
    // Get tax limit or use infinity if not specified
    const taxLimit = maxTaxRate ? parseInt(maxTaxRate) : Infinity;
    
    // Get airlines to filter by
    const airlinesForSearch = selectedAirlines.length > 0 ? 
      selectedAirlines : 
      TRANSFER_PARTNERS[selectedCard];
    
    // Filter destinations
    const filtered = DESTINATIONS.filter(destination => {
      // Filter by region if selected
      if (regionFilter && destination.region !== regionFilter) {
        return false;
      }
      
      // Filter by departure airport if selected
      if (departureAirport && AIRPORT_ROUTES[departureAirport]) {
        if (!AIRPORT_ROUTES[departureAirport].includes(destination.id)) {
          return false;
        }
      }
      
      // Get regional ceiling for this destination
      const regionalCeiling = FARE_CLASS_CEILINGS[destination.region]?.[fareClassFilter] || Infinity;
      
      // Use lower of user points or ceiling
      const effectivePointsLimit = Math.min(userPointsAmount, regionalCeiling);
      
      // Check if at least one airline can get you there
      return airlinesForSearch.some(airlineId => {
        const pointCost = destination.pointCosts[airlineId];
        if (!pointCost) return false;
        
        const tax = destination.taxes[airlineId];
        if (!tax) return false;
        
        // Apply trip multiplier (2x for roundtrip)
        const tripMultiplier = tripType === 'roundtrip' ? 2 : 1;
        return pointCost * tripMultiplier <= effectivePointsLimit && 
               tax * tripMultiplier <= taxLimit;
      });
    });
    
    setFilteredDestinations(filtered);
    setHasSearched(true);
  };
  
  const resetFilters = () => {
    setSelectedCard('');
    setPointsAmount('');
    setMaxTaxRate('');
    setSelectedAirlines([]);
    setRegionFilter('');
    setCardProgramFilter('');
    setTripType('roundtrip');
    setFareClassFilter('economy');
    setDepartureAirport('');
    setFilteredDestinations([]);
    setHasSearched(false);
  };
  
  const toggleAirlineSelection = (airlineId) => {
    if (selectedAirlines.includes(airlineId)) {
      setSelectedAirlines(selectedAirlines.filter(id => id !== airlineId));
    } else {
      setSelectedAirlines([...selectedAirlines, airlineId]);
    }
  };
  
  // Get card details
  const selectedCardDetails = CREDIT_CARDS.find(card => card.id === selectedCard);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-teal-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center">
              <CreditCard className="mr-2" size={20} />
              Points Explorer
            </h1>
            <p className="text-sm text-teal-100 mt-1">Find your next award flight destination</p>
          </div>
          <button 
            className="bg-teal-500 hover:bg-teal-400 rounded-full p-2"
            onClick={() => setShowApiInfo(true)}
            title="API Information"
          >
            <Info size={18} />
          </button>
        </div>
      </div>
      
      {/* API Information Modal */}
      {showApiInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-teal-700">Point Valuation API Sources</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowApiInfo(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-gray-700">
              <p className="mb-4">For the most accurate and up-to-date point valuations, we recommend integrating with the following APIs:</p>
              
              <h3 className="font-bold mt-4 mb-2">Recommended APIs:</h3>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><span className="font-medium">The Points Guy API:</span> Provides monthly updated valuations for all major credit card, airline, and hotel loyalty programs.</li>
                <li><span className="font-medium">Award Wallet Developer API:</span> Offers real-time point valuations and availability data.</li>
                <li><span className="font-medium">FlightConnections API:</span> Provides route network data to determine where airlines fly.</li>
              </ul>
              
              <div className="bg-blue-50 p-4 rounded-md mt-6">
                <p className="text-sm text-blue-700">Note: The sample data in this demo uses approximate valuations based on publicly available information. For production use, we strongly recommend integrating with one of the APIs above to ensure accurate and current data.</p>
              </div>
            </div>
            
            <button
              className="mt-6 w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
              onClick={() => setShowApiInfo(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-col h-full">
        {/* Search Panel */}
        <div className="p-5 bg-white border-b">
          <div className="flex flex-col space-y-5 max-w-3xl mx-auto">
            {/* Card Program and Credit Card Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Credit Card</label>
              <div>
                <select 
                  className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-2"
                  value={cardProgramFilter}
                  onChange={(e) => {
                    setCardProgramFilter(e.target.value);
                    setSelectedCard(''); // Reset selected card when changing program
                  }}
                >
                  <option value="">All Credit Card Programs</option>
                  {cardPrograms.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
                
                <select 
                  className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                >
                  <option value="">Select a card</option>
                  {filteredCards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.name} ({card.valuationCPP}¢ per point)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Departure Airport Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure Airport
              </label>
              <select
                className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={departureAirport}
                onChange={(e) => setDepartureAirport(e.target.value)}
              >
                <option value="">Any Departure Airport</option>
                {AIRPORTS.map(airport => (
                  <option key={airport.code} value={airport.code}>
                    {airport.name} ({airport.code})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Fare Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Class</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  className={`py-2 px-2 rounded-md border ${
                    fareClassFilter === 'economy' 
                      ? 'bg-teal-100 text-teal-800 font-medium border-teal-300' 
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  onClick={() => setFareClassFilter('economy')}
                >
                  Economy
                </button>
                <button
                  className={`py-2 px-2 rounded-md border ${
                    fareClassFilter === 'premium-economy' 
                      ? 'bg-teal-100 text-teal-800 font-medium border-teal-300' 
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  onClick={() => setFareClassFilter('premium-economy')}
                >
                  Premium Economy
                </button>
                <button
                  className={`py-2 px-2 rounded-md border ${
                    fareClassFilter === 'business' 
                      ? 'bg-teal-100 text-teal-800 font-medium border-teal-300' 
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  onClick={() => setFareClassFilter('business')}
                >
                  Business
                </button>
                <button
                  className={`py-2 px-2 rounded-md border ${
                    fareClassFilter === 'first' 
                      ? 'bg-teal-100 text-teal-800 font-medium border-teal-300' 
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  onClick={() => setFareClassFilter('first')}
                >
                  First
                </button>
              </div>
            </div>
            
            {/* Points Input (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span>{selectedCardDetails ? `${selectedCardDetails.pointsName} Available` : 'Points Available'}</span>
                <span className="text-xs text-gray-500 ml-1">(Optional - will use recommended ceiling if blank)</span>
              </label>
              <input 
                type="number"
                placeholder="Enter points amount"
                className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
              />
            </div>
            
            {/* Trip Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  className={`flex-1 py-2 px-4 ${tripType === 'oneway' 
                    ? 'bg-teal-100 text-teal-800 font-medium' 
                    : 'bg-white text-gray-700'}`}
                  onClick={() => setTripType('oneway')}
                >
                  One Way
                </button>
                <button
                  className={`flex-1 py-2 px-4 ${tripType === 'roundtrip' 
                    ? 'bg-teal-100 text-teal-800 font-medium' 
                    : 'bg-white text-gray-700'}`}
                  onClick={() => setTripType('roundtrip')}
                >
                  Round Trip
                </button>
              </div>
            </div>
            
            {/* Max Tax Rate (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Tax & Fees ($)
                <span className="text-xs text-gray-500 ml-1">(Optional)</span>
              </label>
              <input 
                type="number"
                placeholder="No limit"
                className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={maxTaxRate}
                onChange={(e) => setMaxTaxRate(e.target.value)}
              />
            </div>
            
            {/* Search and Reset Buttons */}
            <div className="flex space-x-2">
              <button
                className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 flex items-center justify-center font-medium"
                onClick={handleSearch}
                disabled={!selectedCard}
              >
                <Search className="mr-2" size={16} />
                Find Destinations
              </button>
              
              <button
                className="bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 flex items-center justify-center"
                onClick={resetFilters}
              >
                <X className="mr-1" size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Area */}
        <div className="flex-1 overflow-auto p-5 bg-gray-50">
          {hasSearched ? (
            <>
              {filteredDestinations.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
                  {filteredDestinations.map(destination => {
                    const tripMultiplier = tripType === 'roundtrip' ? 2 : 1;
                    
                    const availableAirlineIds = selectedAirlines.length > 0 ? 
                      selectedAirlines : TRANSFER_PARTNERS[selectedCard];
                    
                    const validAirlines = availableAirlineIds.filter(airlineId => {
                      const pointCost = destination.pointCosts[airlineId];
                      if (!pointCost) return false;
                      
                      const taxCost = destination.taxes[airlineId];
                      if (!taxCost) return false;
                      
                      const regionalCeiling = FARE_CLASS_CEILINGS[destination.region]?.[fareClassFilter] || Infinity;
                      const userPointsLimit = pointsAmount ? parseInt(pointsAmount) : Infinity;
                      const effectivePointsLimit = Math.min(userPointsLimit, regionalCeiling);
                      const maxTax = maxTaxRate ? parseInt(maxTaxRate) : Infinity;
                      
                      return pointCost * tripMultiplier <= effectivePointsLimit && 
                             taxCost * tripMultiplier <= maxTax;
                    });
                    
                    const bestAirlineId = validAirlines.reduce((best, current) => {
                      if (!best) return current;
                      return destination.pointCosts[current] < destination.pointCosts[best] ? current : best;
                    }, null);
                    
                    if (!bestAirlineId) return null;
                    
                    const bestAirline = AIRLINES.find(a => a.id === bestAirlineId);
                    const pointsCost = destination.pointCosts[bestAirlineId] * tripMultiplier;
                    const taxCost = destination.taxes[bestAirlineId] * tripMultiplier;
                    
                    const selectedCardData = CREDIT_CARDS.find(c => c.id === selectedCard);
                    const pointValueInCents = selectedCardData ? selectedCardData.valuationCPP : 1.0;
                    const cashValue = pointsCost * (pointValueInCents / 100);
                    
                    const regionalCeiling = FARE_CLASS_CEILINGS[destination.region]?.[fareClassFilter];
                    const ceilingInfo = regionalCeiling ? 
                      `${regionalCeiling.toLocaleString()} points` : 
                      'No ceiling';
                    
                    return (
                      <div key={destination.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
                        <div>
                          <img 
                            src={destination.imageUrl} 
                            alt={destination.name} 
                            className="w-full h-48 object-cover" 
                          />
                        </div>
                        
                        <div className="p-5">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg flex items-center text-gray-800">
                              <MapPin size={16} className="mr-1 text-teal-500" />
                              {destination.name}
                            </h3>
                            {departureAirport && (
                              <div className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                {departureAirport} → {destination.id.toUpperCase().slice(0, 3)}
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{destination.description}</p>
                          
                          <div className="mt-3 flex items-center text-xs text-gray-500">
                            <span className="mr-2">Region: {destination.region}</span>
                            <span>Recommended ceiling: {ceilingInfo}</span>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-md mt-4 border border-gray-200">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-gray-600">
                                Best {fareClassFilter.replace('-', ' ')} ({tripType}):
                              </p>
                              <div className="relative group">
                                <button 
                                  className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 text-xs text-gray-600"
                                  title="Booking Instructions"
                                >
                                  ?
                                </button>
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-3 hidden group-hover:block z-10 text-xs text-left">
                                  <p className="font-bold text-teal-700 mb-1">How to Book with {selectedCardDetails?.name}:</p>
                                  <ol className="list-decimal pl-4 space-y-1 text-gray-700">
                                    <li>Log in to {selectedCardDetails?.program} portal</li>
                                    <li>Select "Transfer to Travel Partners"</li>
                                    <li>Transfer points to {bestAirline.name} at 1:1 ratio</li>
                                    <li>Search for {fareClassFilter.replace('-', ' ')} award flights</li>
                                    <li>Book using your transferred points</li>
                                  </ol>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="font-bold text-gray-800">{bestAirline.name}</span>
                              <div>
                                <span className="font-bold text-teal-700">{pointsCost.toLocaleString()} points</span>
                                <span className="text-gray-500 text-sm"> + ${taxCost} tax</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                              <span>Cash equivalent:</span>
                              <span>${cashValue.toFixed(2)} (≈{pointValueInCents}¢ per point)</span>
                            </div>
                          </div>
                          
                          {validAirlines.length > 1 && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500">Also available through {validAirlines.length - 1} other airline(s)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
