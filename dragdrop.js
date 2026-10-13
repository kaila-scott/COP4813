const deck = [
    { value: "A", suit: "♠", color: "black" },
    { value: "K", suit: "♥", color: "red" },
    { value: "Q", suit: "♣", color: "black" },
    { value: "J", suit: "♦", color: "red" },
    { value: "10", suit: "♠", color: "black" },
    { value: "9", suit: "♥", color: "red" },
    { value: "8", suit: "♣", color: "black" },
    { value: "7", suit: "♦", color: "red" }
];

document.addEventListener("DOMContentLoaded", function () {
    const dealButton = document.getElementById("dealButton");
    const resetButton = document.getElementById("resetButton");
    const discardPile = document.getElementById("discardPile");

    dealButton.addEventListener("click", dealCards);
    resetButton.addEventListener("click", resetGame);

    discardPile.addEventListener("dragover", allowDrop);
    discardPile.addEventListener("drop", discardCard);
    discardPile.addEventListener("dragenter", highlightDiscardPile);
    discardPile.addEventListener("dragleave", removeDiscardHighlight);
});

function dealCards() {
    const cardArea = document.getElementById("cardArea");
    const gameMessage = document.getElementById("gameMessage");

    cardArea.innerHTML = "";

    const shuffledDeck = shuffleDeck(deck);
    const hand = shuffledDeck.slice(0, 5);

    hand.forEach(function (card, index) {
        const cardElement = document.createElement("div");

        cardElement.className = "playing-card " + card.color;
        cardElement.id = "card-" + index;
        cardElement.draggable = true;
        cardElement.setAttribute("aria-label", card.value + " of " + card.suit);

        cardElement.innerHTML =
            "<span class='card-corner'>" + card.value + "</span>" +
            "<span class='card-suit'>" + card.suit + "</span>" +
            "<span class='card-corner bottom'>" + card.value + "</span>";

        cardElement.addEventListener("dragstart", dragCard);

        cardArea.appendChild(cardElement);
    });

    gameMessage.textContent = "Cards dealt. Drag any card into the discard pile.";
}

function shuffleDeck(cards) {
    const shuffled = [...cards];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const temporaryCard = shuffled[i];

        shuffled[i] = shuffled[randomIndex];
        shuffled[randomIndex] = temporaryCard;
    }

    return shuffled;
}

function dragCard(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function highlightDiscardPile(event) {
    event.preventDefault();
    document.getElementById("discardPile").classList.add("discard-active");
}

function removeDiscardHighlight() {
    document.getElementById("discardPile").classList.remove("discard-active");
}

function discardCard(event) {
    event.preventDefault();

    const cardId = event.dataTransfer.getData("text/plain");
    const card = document.getElementById(cardId);
    const discardPile = document.getElementById("discardPile");
    const gameMessage = document.getElementById("gameMessage");

    if (card) {
        card.draggable = false;
        card.classList.add("discarded-card");
        discardPile.appendChild(card);

        gameMessage.textContent = "Event triggered: " + card.textContent.trim() + " was discarded successfully.";
    }

    discardPile.classList.remove("discard-active");
}

function resetGame() {
    const cardArea = document.getElementById("cardArea");
    const discardPile = document.getElementById("discardPile");
    const gameMessage = document.getElementById("gameMessage");

    cardArea.innerHTML = "<p class='placeholder-text'>Cards will appear here.</p>";
    discardPile.innerHTML = "<p>Drag cards here</p><span class='discard-icon'>🍃</span>";
    gameMessage.textContent = "Click Deal Cards to begin.";
}