import { useState } from "react";

type Player = {
  name: string;
  buyIns: number[];
  finalAmount: number;
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [activePlayer, setActivePlayer] = useState<number | null>(null);
  const [currentBuyIn, setCurrentBuyIn] = useState<number>(0);
  const [finalAmounts, setFinalAmounts] = useState<{ [key: number]: number }>(
    {}
  );

  const handleAddPlayer = () => {
    if (newPlayer) {
      setPlayers([...players, { name: newPlayer, buyIns: [], finalAmount: 0 }]);
      setNewPlayer("");
    }
  };

  const handleAddBuyIn = (index: number) => {
    const updatedPlayers = players.map((player, i) =>
      i === index
        ? { ...player, buyIns: [...player.buyIns, currentBuyIn] }
        : player
    );
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
        <td className="p-2 border">{player.name}</td>
        <td className="p-2 border">{player.buyIns.join(", ")}</td>
        <td className="p-2 border">{player.buyIns.length}</td>
      </tr>
    ));
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-xl font-bold">Poker Game Calculator</h1>
      <div>
        <input
          type="text"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          className="p-2 mr-2 border"
          placeholder="Enter player name"
        />
        <button
          onClick={handleAddPlayer}
          className="p-2 text-white bg-blue-500"
        >
          Add Player
        </button>
      </div>

      <table className="w-full mt-4 border border-collapse border-black">
        <thead>
          <tr>
            <th className="p-2 border">Player</th>
            <th className="p-2 border">Buy-In</th>
            <th className="p-2 border">Final Amount</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {players.map((player, index) => (
            <tr key={index}>
              <td className="p-2 border" onClick={() => setActivePlayer(index)}>
                {player.name}
              </td>
              <td className="p-2 border">
                {activePlayer === index ? (
                  <>
                    <input
                      type="number"
                      value={currentBuyIn}
                      onChange={(e) => setCurrentBuyIn(Number(e.target.value))}
                      className="p-2 border"
                    />
                    <button
                      onClick={() => handleAddBuyIn(index)}
                      className="p-2 ml-2 text-white bg-green-500"
                    >
                      Add
                    </button>
                  </>
                ) : (
                  player.buyIns.reduce((a, b) => a + b, 0)
                )}
              </td>
              <td className="p-2 border">
                <input
                  type="number"
                  value={finalAmounts[index] || 0}
                  onChange={(e) =>
                    handleFinalAmountChange(index, Number(e.target.value))
                  }
                  className="p-2 border"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Buy-Ins Overview</h2>
        <table className="w-full mt-2 border border-collapse">
          <thead>
            <tr>
              <th className="p-2 border">Player</th>
              <th className="p-2 border">Buy-Ins (Time-wise)</th>
              <th className="p-2 border">Total Buy-Ins</th>
            </tr>
          </thead>
          <tbody>{renderBuyIns()}</tbody>
        </table>
      </div>
      <button
        onClick={() => console.log(calculateResults())}
        className="p-2 mt-4 text-white bg-blue-500"
      >
        Calculate Results
      </button>
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Results</h2>
        <ul>
          {playerResults.map((player, index) => (
            <li key={index}>
              {player.name}: {player.result >= 0 ? "Wins " : "Loses "}
              {Math.abs(player.result)} (Final Amount: {player.finalAmount},
              Total Buy-Ins: {player.buyIns.reduce((a, b) => a + b, 0)})
            </li>
          ))}
        </ul>
        <p>Total Buy-Ins: {totalBuyIns}</p>
        <p>Total Final Amounts: {totalFinalAmounts}</p>
        <p>
          Discrepancy: {discrepancy}{" "}
          {discrepancy === 0
            ? "(Balanced)"
            : discrepancy > 0
            ? "(Extra)"
            : "(Shortage)"}
        </p>
      </div>
    </div>
  );
}
