import { ReactNode, useEffect, useRef, useState } from "react";
import Card from "./Card";
import {
  checkCardMatch,
  checkDataSelectable,
  getSelectedCards,
} from "@/utils/utils-data";
import { CardData, GameState } from "@/types/game";
import { clone } from "lodash";

type MatrixProps = {
  handleUpdateDeck: (cardDeck: CardData[]) => void;
  gameState: GameState;
};
export const Matrix: React.FC<MatrixProps> = ({
  handleUpdateDeck,
  gameState,
}) => {
  // Default value
  const GRID_SIZE = 4;

  // Card elements state
  const [useCardElement, setCardElement] = useState<ReactNode>([]);
  const [useRefresh, setRefresh] = useState(false);
  const [useGameState, setGameState] = useState(gameState);
  const [useCardDeck, setCardDeck] = useState(useGameState.cardDeck);

  useEffect(() => {
    setCardDeck(gameState.cardDeck);
    setGameState(gameState);
  }, [gameState]);

  // Create all cards
  useEffect(() => {
    if (useCardDeck.length != 0) {
      const cardList = [];
      let counterKey = 0;
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          let actualCard = useCardDeck[counterKey];
          cardList.push(
            <Card
              frontText={actualCard.front}
              backText={actualCard.back}
              key={counterKey}
              selectCard={handleSelectACard}
              index={counterKey}
              guessed={actualCard.guessedFrom}
              selected={actualCard.selected}
            ></Card>,
          );
          counterKey += 1;
        }
      }
      setCardElement(cardList);
    }
  }, [useCardDeck, useRefresh]);

  useEffect(() => {
    const selectedCards = getSelectedCards(useCardDeck);
    // Check if the card match
    if (checkCardMatch(useCardDeck)) {
      // Change card to gueseed
      setCardDeck(() => {
        const newCardDeck = useCardDeck;
        // Change to gueesed
        // Extract index of the selected cards
        const cardIndex1 = selectedCards[0];
        const cardIndex2 = selectedCards[1];
        // Change the state to gueeesed
        newCardDeck[cardIndex1].guessedFrom = 1;
        newCardDeck[cardIndex2].guessedFrom = 1;
        // Change to unselected
        newCardDeck[cardIndex1].selected = false;
        newCardDeck[cardIndex2].selected = false;
        handleUpdateDeckWithDelay(newCardDeck);
        return newCardDeck;
      });
      console.log("Card gueesed!");
    } else if (selectedCards.length === 2) {
      console.log(selectedCards);
      setCardDeck(() => {
        const newCardDeck = useCardDeck;
        // Extract index of the selected cards
        const cardIndex1 = selectedCards[0];
        const cardIndex2 = selectedCards[1];
        // Change to unselected
        newCardDeck[cardIndex1].selected = false;
        newCardDeck[cardIndex2].selected = false;
        handleUpdateDeckWithDelay(newCardDeck);
        return newCardDeck;
      });

      console.log("Wrong!");
    }
  }, [useCardDeck]);

  // Handle the selection of a card
  const handleSelectACard = (index: number, lastState: boolean) => {
    // Helper function to flip card
    const flipCard = () => {
      const newCardDeck = clone(useCardDeck);
      // Flip the value
      newCardDeck[index].selected = !lastState;
      handleUpdateDeck(newCardDeck);

      return newCardDeck;
    };

    // If already flipped filp again
    if (lastState) {
      setCardDeck(flipCard);
      return true;
    }
    // Check if there are less than 2 cards selected
    else if (checkDataSelectable(useCardDeck)) {
      setCardDeck(flipCard);
    } else {
      return false;
    }

    return true;
  };

  // Helper function that enable the delay after 2 cards choosed
  const handleUpdateDeckWithDelay = (newCardDeck: CardData[]) => {
    const timer = new Promise((resolve) => {
      setTimeout(resolve, 2000);
    }).then(() => handleUpdateDeck(newCardDeck));
  };

  return (
    <>
      <div className="grid grid-cols 4 gap-4 border-double border-4 border-slate-600 grid-cols-4 ">
        {useCardElement}
      </div>
    </>
  );
};
