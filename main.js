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

// Player variables
let playerPosition = 1;
let canMove = true;

// Add cards to cardsInPlay array when they're dropped in the corresponding container, on play, make the cards be used up and their effect be triggered
const cardsInPlay = [];

let curDraggedElement = null;
let curUpgradeElement = null;

let upgradeMenuOpen = false;

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

const cardDatabase = {
    3: {
        id: 3,
        type: "Fire",
        cost: 20,
        dmg: 2,
        callback: FireEffect,
        next: [4, 6],
    },
    4: {
        id: 4,
        type: "Fire",
        cost: 20,
        dmg: 4,
        callback: FireEffect,
        next: null,
    },
    6: {
        id: 6,
        type: "Fire",
        cost: 60,
        dmg: 8,
        callback: FireEffect,
        next: null,
    },
    5: {
        id: 5,
        type: "Earth",
        cost: 50,
        callback: EarthEffect,
        next: null,
    },
}

// element property, parent, cost, type, playable, children []
// Replace this with a tree structure?
const allCards = {};

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
        if(upgradeMenuOpen && curUpgradeElement){
            curUpgradeElement.container.remove();
        }
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
        if(upgradeMenuOpen && curUpgradeElement){
            DrawUpgradeUI(curDraggedElement);
        }
        curDraggedElement = null;
    })
}

function CardSetup(element, cardID) {
    console.log("Initialised card from id: " + cardID);
    let baseCard = cardDatabase[cardID]
    if(!baseCard){
        console.log("Card could not be found based on given card-id");
    }
    let newPlayID = crypto.randomUUID();
    element.setAttribute("id", newPlayID);
    let newCard = {
        element: element,
        cost: baseCard.cost,
        type: baseCard.type,
        callback: baseCard.callback,
        playable: false,
        baseID: cardID,
        playID: newPlayID,

    };
    allCards[newPlayID] = newCard;
    DrawCardText(element);
    console.log(allCards);
}

function Upgrade(element, cardUpgrade) {
    console.log(element);
    console.log(cardUpgrade);

    let cost = cardUpgrade.cost;
    if(cardUpgrade.cost > curResources){
        alert("You don't have enough resources to upgrade this card");
        return;
    }
    curResources -= cost;
    resourceText.textContent = "Resources: " + curResources;
    
    // Replace parent element with upgrade

    let newPlayID = crypto.randomUUID();
    cardUpgrade.parent.setAttribute("id", newPlayID);

    delete allCards[cardUpgrade.parentID];
    allCards[newPlayID] = cardUpgrade;
    allCards[newPlayID].playID = newPlayID;
    DrawCardText(cardUpgrade.parent);

    if(cardUpgrade.next){
        curUpgradeElement == null;
        DrawUpgradeUI(cardUpgrade.parent);
    }
    else{
        DrawUpgradeUI(cardUpgrade.parent);
    }
}

function DrawUpgradeUI (element) {
    
    // Disable menu if already open and the same element is clicked on

    if(!element || element.type == "resize"){
        if(!curUpgradeElement || !curUpgradeElement.element){
            upgradeMenuOpen = false;
            return;
        }
        console.log(curUpgradeElement.element)
        element = curUpgradeElement.element;
    }

    if(curUpgradeElement){
        curUpgradeElement.container.remove();
        if(curUpgradeElement.element == element){
            console.log("Menu closing")
            upgradeMenuOpen = false;
            curUpgradeElement = null;
            return;
        }
        // Set upgradeMenuOpen to false and skip the rest?
    }

    if(cardDatabase[allCards[element.id].baseID].next){

        // Opening menu

        console.log("Opening upgrade menu");

        let upgradeContainer = document.createElement("div");
        upgradeContainer.classList.add("card-container--upgrade");
        element.parentElement.parentElement.appendChild(upgradeContainer);
        let rect = element.getBoundingClientRect();
        let containerRect = upgradeContainer.getBoundingClientRect();
        upgradeContainer.style.left = rect.left - containerRect.width / 2 + rect.width / 2 + "px";
        upgradeContainer.style.top = rect.y - containerRect.height - 15 + "px";

        console.log(cardDatabase[allCards[element.id].baseID]);
        cardDatabase[allCards[element.id].baseID].next.forEach((upgradeID) => {

            let upgrade = cardDatabase[upgradeID];
            let upgradeCard = document.createElement("div");
            upgradeCard.classList.add("card");
            upgradeCard.classList.add("card--upgrade");
            upgradeCard.top = "0px";
            upgradeCard.left = "0px";

            let newCard = {
                element: upgradeCard,
                cost: upgrade.cost,
                type: upgrade.type,
                callback: upgrade.callback,
                playable: false,
                baseID: upgradeID,
                // playID: newPlayID,
                parent: element,
                parentID: element.id,
            };

            upgradeCard.addEventListener("click", () => {
                Upgrade(element, newCard);
            });


            upgradeContainer.appendChild(upgradeCard);

            // Add info based on card stats

            // Add onclick function calling Upgrade()

            upgradeMenuOpen = true;
            curUpgradeElement = {container: upgradeContainer, element: element};
        });
    }
    else{
        console.log("Closed menu because empty card was clicked");
        upgradeMenuOpen = false;
        curUpgradeElement = null;
    }
}

function DrawCardText(element) {
    if(!element || element.type == "resize"){
        console.log("Tried to draw card text without and element")
        return;
    }
    let childrenToRemove = element.children;
    console.log(childrenToRemove)
    if(childrenToRemove){
        for(let i = 0; i < childrenToRemove.length; i++){
            if(childrenToRemove[i].classList.contains("card__text")){
                childrenToRemove[i].remove();
            }
        }
    }
    let card = allCards[element.id];
    let costText = document.createElement("p");
    costText.textContent = card.cost;
    costText.classList.add("card__text");
    costText.classList.add("card__text--cost");
    element.appendChild(costText);

    let textArray = [];
    textArray.push(costText);
    allCards[element.id].textChildren = textArray;
}

window.onresize = DrawUpgradeUI;

// Reminder: When an upgrade card is clicked it triggers the click event on the parent card as well, closing the card menu
function SelectCard(element) {
    // Restructure

    DrawUpgradeUI(element);


    // OLD 

    // if(element.parentElement.parentElement.classList.contains("card--playable")) return;
    // if(curUpgradeCards){
    //     curUpgradeCards[0].parentElement.parentElement.classList.add("card--playable__hover");
    //     for(let i = 0; i < curUpgradeCards.length; i++){
    //         curUpgradeCards[i].classList.add("hidden");
    //     }
    //     if(curUpgradeCards[0].parentElement.parentElement == element){
    //         curUpgradeCards = null;
    //         return;
    //     }
    // }

    // element.classList.remove("card--playable__hover")
    // let children = element.children[0].children;
    // for(let i = 0; i < children.length; i++){
    //     children[i].classList.remove("hidden");
    // }
    // curUpgradeCards = children;
}

// Make sure you only move once per turn
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