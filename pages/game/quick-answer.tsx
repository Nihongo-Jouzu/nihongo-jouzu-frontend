import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../components/SocketProvider";
import { useGameState } from "../../components/GameStateProvider";
import { GameContexType, Lobby } from "../../globals/types/game";
// import GameQuickAnswer from "../../components/GameQuickAnswer"; // This is from the previous file

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function GameQuickAnswer() {
  const socket = useSocket();
  const gameState = useGameState();

  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null); //Question to show each user
  const [currentTurn, setCurrentTurn] = useState(0); //Current turn
  interface deal {
    id: number
    content: string
  }
  const [deals, setDeals] = useState<deal[] | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [timer, setTimer] = useState(15); // 15 seconds timer
  const intervalRef = useRef(null); // Reference for the timer interval

  const players: string[] = gameState?.gameState?.lobby?.players || []; // Todo: need to plyers type 'GameContexType'
  const initialPlayerScores: Record<string, number>[] = (players.map((el) => Object.fromEntries([[el, 0]])))
  // const initialPlayerScores: Record<string, number> = Object.fromEntries(players.map((el) => [el, 0]))
  const [playerScores, setPlayerScores] = useState(initialPlayerScores);
  const maxTurns = 10;

  useEffect(() => {
    //Open socket
    if (socket) {
      socket.on("newQuestion", (question: string) => {
        // Todo: link the question (English ver)
        setCurrentQuestion(question);
        setSelectedCardId(null); // Reset card selection
      });

      socket.on("correctAnswer", (playerName: string) => {
        handleCorrectAnswer(playerName);
      });
    }

    return () => {
      if (socket) {
        socket.off("newQuestion");
        socket.off("correctAnswer");
      }
    };
  }, [socket]);

  // Start the game
  // const startGame = () => {
  //   if (!isGameActive) {
  //     setGameActive(true);
  //     startTurn();
  //   }
  // };

  // Start a new turn
  // const startTurn = () => {
  //   if (currentTurn >= maxTurns) {
  //     endGame();
  //     return;
  //   }

  //   setTimer(15);
  //   setCurrentTurn((prev) => prev + 1);

  //   socket.emit("requestQuestion", currentTurn);

  //   intervalRef.current = setInterval(() => {
  //     setTimer((prevTimer) => {
  //       if (prevTimer === 1) {
  //         clearInterval(intervalRef.current);
  //         nextQuestion();
  //         return 15;
  //       }
  //       return prevTimer - 1;
  //     });
  //   }, 1000);
  // };

  const handleCardSelect = (cardId: number, playerName: string) => {
    setSelectedCardId(cardId);
    socket.emit("answerSelected", Object.fromEntries([[cardId, playerName]]));
  };

  const handleCorrectAnswer = (playerName: string) => {
    let newPlayerScores = playerScores
    for (let i = 0; i <= newPlayerScores.length - 1; i++) {
      // for (const i of (newPlayerScores)) {
      const key = Object.keys(newPlayerScores[i])[0]
      if (key === playerName) {
        const previousScore = newPlayerScores[i][key]
        newPlayerScores[i] = Object.fromEntries([[key, previousScore + 1]])
      }
    }
    setPlayerScores(newPlayerScores)
    // setPlayerScores((playerScores) => ({
    //   ...playerScores,
    //   [playerName]: (playerScores[playerName] || 0) + 1,
    // }));
    // setTimeout(() => {
    //   nextQuestion();
    // }, 1000); // Add 1 sec before moving to the next question. Need to check with members
  };

  const calcPlayerRank = () => {
    playerScores.sort(function (a, b) {
      return a[1] - b[1];
    })
  }

  // const nextQuestion = () => {
  //   clearInterval(intervalRef.current); // Reset the timer
  //   if (currentTurn < maxTurns) {
  //     startTurn();
  //   } else {
  //     endGame();
  //   }
  // };

  // const endGame = () => {
  //   setGameActive(false);
  //   // Todo: link to game-result
  //   socket.emit("endGame");
  // };

  return (
    <div>
      <h2>Quick Answer Game</h2>
      {
        (
          <>
            <p>
              Current Turn: {currentTurn} / {maxTurns}
            </p>
            <p>Time Left: {timer}s</p>

            {currentQuestion && (
              <div>
                <h3>Question: {currentQuestion}</h3>
                <p>Choose your answer:</p>
                {deals?.map((elem) => {
                  return (
                    <div key={elem.id} onClick={() => { handleCardSelect(elem.id, gameState.gameState.playerName) }}>
                      {elem.content}
                    </div>
                  )
                })}
                {/* <div className="cards">
                  {gameState?.players.map((player) => (
                    <div key={player.id} className="player-cards">
                      {player.id === gameState.currentPlayerId ? (
                        <div>
                          {player.cards.map((card) => (
                            <button
                              key={card.id}
                              onClick={() => handleCardSelect(card, player.id)}
                            >
                              {card.text}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p>Player {player.name}'s cards are hidden</p>
                      )}
                    </div>
                  ))}
                </div> */}


                {/* {selectedCard && (
                  <p>
                    Player {gameState.currentPlayerId} selected:{" "}
                    {selectedCard.text}
                  </p>
                )} */}
              </div>
            )}

            <div>
              <h4>Scores:</h4>
              {playerScores.map((elem, ind) => (
                <p key={ind}>
                  {Object.keys(elem)[0]}: {Object.values(elem)[0]} points
                </p>
              ))}
            </div>
          </>
        )
      }
    </div>
  );
}
