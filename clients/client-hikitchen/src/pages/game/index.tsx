import { useState } from 'react';

type Player = {
  name: string;
  buyIns: number[];
  finalAmount: number;
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [activePlayer, setActivePlayer] = useState<number | null>(null);
  const [currentBuyIn, setCurrentBuyIn] = useState<number>(0);
  const [finalAmounts, setFinalAmounts] = useState<{ [key: number]: number }>({});

  const handleAddPlayer = () => {
    if (newPlayer) {
      setPlayers([...players, { name: newPlayer, buyIns: [], finalAmount: 0 }]);
      setNewPlayer('');
    }
  };

  const handleAddBuyIn = (index: number) => {
    const updatedPlayers = players.map((player, i) => (i === index ? { ...player, buyIns: [...player.buyIns, currentBuyIn] } : player));
    setPlayers(updatedPlayers);
    setActivePlayer(null);
    setCurrentBuyIn(0);
  };

  const handleFinalAmountChange = (index: number, amount: number) => {
    setFinalAmounts({ ...finalAmounts, [index]: amount });
  };

  const calculateResults = () => {
    let totalBuyIns = 0;
    let totalFinalAmounts = 0;

    const playerResults = players.map((player, index) => {
      const playerTotalBuyIns = player.buyIns.reduce((a, b) => a + b, 0);
      totalBuyIns += playerTotalBuyIns;

      const finalAmount = finalAmounts[index] || player.finalAmount;
      totalFinalAmounts += finalAmount;

      const result = finalAmount - playerTotalBuyIns;
      return {
        ...player,
        finalAmount,
        result,
      };
    });

    const discrepancy = totalFinalAmounts - totalBuyIns;

    return { playerResults, totalBuyIns, totalFinalAmounts, discrepancy };
  };
  const { playerResults, totalBuyIns, totalFinalAmounts, discrepancy } = calculateResults();

  // ...

  const renderBuyIns = () => {
    return players.map((player, index) => (
      <tr key={index}>
        <td className="border p-2">{player.name}</td>
        <td className="border p-2">{player.buyIns.join(', ')}</td>
        <td className="border p-2">{player.buyIns.length}</td>
      </tr>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-xl font-bold">Poker Game Calculator</h1>
      <div>
        <input
          type="text"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          className="mr-2 border p-2"
          placeholder="Enter player name"
        />
        <button onClick={handleAddPlayer} className="bg-blue-500 p-2 text-white">
          Add Player
        </button>
      </div>

      <table className="mt-4 w-full border-collapse border border-black">
        <thead>
          <tr>
            <th className="border p-2">Player</th>
            <th className="border p-2">Buy-In</th>
            <th className="border p-2">Final Amount</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {players.map((player, index) => (
            <tr key={index}>
              <td className="border p-2" onClick={() => setActivePlayer(index)}>
                {player.name}
              </td>
              <td className="border p-2">
                {activePlayer === index ? (
                  <>
                    <input type="number" value={currentBuyIn} onChange={(e) => setCurrentBuyIn(Number(e.target.value))} className="border p-2" />
                    <button onClick={() => handleAddBuyIn(index)} className="ml-2 bg-green-500 p-2 text-white">
                      Add
                    </button>
                  </>
                ) : (
                  player.buyIns.reduce((a, b) => a + b, 0)
                )}
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={finalAmounts[index] || 0}
                  onChange={(e) => handleFinalAmountChange(index, Number(e.target.value))}
                  className="border p-2"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Buy-Ins Overview</h2>
        <table className="mt-2 w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Player</th>
              <th className="border p-2">Buy-Ins (Time-wise)</th>
              <th className="border p-2">Total Buy-Ins</th>
            </tr>
          </thead>
          <tbody>{renderBuyIns()}</tbody>
        </table>
      </div>
      <button onClick={() => console.log(calculateResults())} className="mt-4 bg-blue-500 p-2 text-white">
        Calculate Results
      </button>
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Results</h2>
        <ul>
          {playerResults.map((player, index) => (
            <li key={index}>
              {player.name}: {player.result >= 0 ? 'Wins ' : 'Loses '}
              {Math.abs(player.result)} (Final Amount: {player.finalAmount}, Total Buy-Ins: {player.buyIns.reduce((a, b) => a + b, 0)})
            </li>
          ))}
        </ul>
        <p>Total Buy-Ins: {totalBuyIns}</p>
        <p>Total Final Amounts: {totalFinalAmounts}</p>
        <p>
          Discrepancy: {discrepancy} {discrepancy === 0 ? '(Balanced)' : discrepancy > 0 ? '(Extra)' : '(Shortage)'}
        </p>
      </div>
    </div>
  );
}
