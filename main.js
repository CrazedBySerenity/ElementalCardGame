const resourceText = document.getElementById("resource-text");
const playerElement = document.getElementById("player");
const positionTiles = document.querySelectorAll(".movement-area__position");
const positions = Array.prototype.map.call(positionTiles, function(element) {
    return {
        tile: element,
        blocked: false,
        blockTile: undefined,
        hasPlayer: false,
    };
});

console.log(positions);

const moveArrows = {"left": document.getElementById("move-arrow-left"), "right": document.getElementById("move-arrow-right")}
const board = document.getElementById("board");
const baseCards = document.getElementsByClassName("card--playable");
const dropZones = document.getElementsByClassName("drop-zone");

// Add cards to cardsInPlay array when they're dropped in the corresponding container, on play, make the cards be used up and their effect be triggered
const cardsInPlay = [];

let curDraggedElement = null;

let curResources = 100;
let curUpgradeCards = null;

console.log(crypto.randomUUID());

// Find upgradable cards, link them with an object in a list
// Change variables within the object

const earthObjects = [];

resourceText.textContent = "Resources: " + curResources;

const FireEffect = () => {
    console.log(positions[playerPosition]);
    if(positions[playerPosition].blocked == true){
        // Remove earth object
        positions[playerPosition].blockTile.remove();
        positions[playerPosition].blocked = false;
    }
    else if (positions[playerPosition].hasPlayer){
        // Only for enemy fire
        // alert("dmg was inflicted");
    }

    let newFire = document.createElement("div");
    newFire.classList.add("ability--fire");
    positions[playerPosition].tile.appendChild(newFire);
    setTimeout(() => {
        newFire.remove();
    }, 100);
}

const EarthEffect = () => {
    let newEarth = document.createElement("div");
    newEarth.classList.add("ability--earth");
    positions[playerPosition].tile.appendChild(newEarth);
    positions[playerPosition].blocked = true;
    positions[playerPosition].blockTile = newEarth;
    // Removal effect?
}

// 3 5 7 11 13 17 23 31

const cardDatabase = [
    {
        id: 3,
        cardType: "Fire",
        cost: 20,
        dmg: 2,
        callback: FireEffect,
        next: [4, 6],
    },
    {
        id: 4,
        cardType: "Fire",
        cost: 20,
        dmg: 4,
        callback: FireEffect,
        next: null,
    },
    {
        id: 6,
        cardType: "Fire",
        cost: 60,
        dmg: 8,
        callback: FireEffect,
        next: null,
    },
    {
        id: 5,
        cardType: "Earth",
        cost: 50,
        callback: EarthEffect,
        next: null,
    },
]

// CardElement property, parent, cardCost, cardType, playable, children []
// Replace this with a tree structure?
const allCards = {};

// Player variables
let playerPosition = 1;
let canMove = true;

class CardEffect {
    constructor(name){
        this.name = name;
    }

    // Effect name
    // Effect callback function
    // Effect stats (dmg)
    // Effect function order (Wait with this one)
    // 
}

class CardNode {
    constructor(data){
        this.data = data;
        this.next = null;
    }
}

class CardList {
    constructor(head = null){
        this.head = head;
    }

    size() {
        let count = 0; 
        let node = this.head;
        while (node) {
            count++;
            node = node.next
        }
        return count;
    }
    

    clear() {
        this.head = null;
    }

    getFirst() {
        return this.head;
    }
    
    getLast() {
        let lastNode = this.head;
        if (lastNode) {
            while (lastNode.next) {
                lastNode = lastNode.next;
            }
        }
        return lastNode;
    }
}

let card1 = new CardNode(10);
let card2 = new CardNode(20);
card1.next = card2;

let list = new CardList(card1);

for(let i = 0; i < baseCards.length; i++){
    let curCard = baseCards[i];
    curCard.addEventListener("dragstart", (event) => {
        console.log(event);
        curDraggedElement = curCard;
    })
    let id = curCard.classList.contains("card--fire") ? 3 : 5;
    CardSetup(curCard, id);
}

for(let i = 0; i < dropZones.length; i++){
    let curDropZone = dropZones[i];
    curDropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
    })
    
    curDropZone.addEventListener("drop", (event) => {
        event.preventDefault();

        if(curDropZone.classList.contains("board")){
            if(cardsInPlay.indexOf(curDraggedElement.id) < 0 && cardsInPlay.length <= 0){
                cardsInPlay.push(curDraggedElement.id);
                curDropZone.prepend(curDraggedElement);
                console.log(cardsInPlay);
            }
        }
        else {
            curDropZone.prepend(curDraggedElement);
            let indexToRemove = cardsInPlay.indexOf(curDraggedElement.id);
            if(indexToRemove >= 0) {
                cardsInPlay.splice(indexToRemove);
                console.log(cardsInPlay);
            }
        }
        curDraggedElement = null;
    })
}

function CardSetup(element, cardID) {
    console.log("Initialised card from id: " + cardID);
    let baseCard = cardDatabase.find((card) => {
        return card.id == cardID;
    });
    if(!baseCard){
        console.log("Card could not be found based on given card-id");
    }
    let newPlayID = crypto.randomUUID();
    element.setAttribute("id", newPlayID);
    let newCard = {
        cardElement: element,
        cardCost: baseCard.cost,
        cardType: baseCard.cardType,
        callback: baseCard.callback,
        playable: false,
        baseID: cardID,
        playID: newPlayID,

    };
    allCards[newPlayID] = newCard;
    console.log(allCards);
}

function Upgrade(element, cardID) {
    console.log(element);

    let cost = cardDatabase.find((card) => {
        return card.id == cardID;
    }).cost;
    if(cost > curResources){
        alert("You don't have enough resources to upgrade this card");
        return;
    }
    curResources -= cost;
    resourceText.textContent = "Resources: " + curResources;

    // Untested
    console.log(cardDatabase);
}

// Reminder: When an upgrade card is clicked it triggers the click event on the parent card as well, closing the card menu
function SelectCard(element) {
    // Restructure

    if(element.parentElement.parentElement.classList.contains("card--playable")) return;
    if(curUpgradeCards){
        curUpgradeCards[0].parentElement.parentElement.classList.add("card--playable__hover");
        for(let i = 0; i < curUpgradeCards.length; i++){
            curUpgradeCards[i].classList.add("hidden");
        }
        if(curUpgradeCards[0].parentElement.parentElement == element){
            curUpgradeCards = null;
            return;
        }
    }

    element.classList.remove("card--playable__hover")
    let children = element.children[0].children;
    for(let i = 0; i < children.length; i++){
        children[i].classList.remove("hidden");
    }
    curUpgradeCards = children;
}

function Move(direction) {
    if(!canMove) return;
    positions[playerPosition].hasPlayer = false;
    playerPosition += direction;
    if(playerPosition > positions.length - 1) playerPosition = positions.length - 1;
    positions[playerPosition].tile.appendChild(playerElement);
    positions[playerPosition].hasPlayer = true;

    if(playerPosition < 1) moveArrows["left"].classList.add("hidden");
    if(playerPosition > 1) moveArrows["right"].classList.add("hidden");

    switch (playerPosition){
        case 0:
            moveArrows["left"].classList.add("hidden");
            if(moveArrows["right"].classList.contains("hidden")){
                moveArrows["right"].classList.remove("hidden");
            }
            break;
        case 2:
            moveArrows["right"].classList.add("hidden");
            if(moveArrows["left"].classList.contains("hidden")){
                moveArrows["left"].classList.remove("hidden");
            }
            break;
        default:
            if(moveArrows["right"].classList.contains("hidden")){
                moveArrows["right"].classList.remove("hidden");
            }
            if(moveArrows["left"].classList.contains("hidden")){
                moveArrows["left"].classList.remove("hidden");
            }
            break;
    }
}

function AllowMove(){
    canMove = true;
}

function TriggerEffects() {
    console.log("Triggering effects")
    // Trigger card effects of cards in play
    let cardID = 0;
    console.log(allCards);
    cardsInPlay.forEach((cardID) => {
        console.log(cardsInPlay);
        console.log(cardID);
        allCards[cardID].callback();
    })
}

function StartTurn() {
    earthObjects.forEach((object) => {

    })
}

function EndTurn() {
    TriggerEffects();
}