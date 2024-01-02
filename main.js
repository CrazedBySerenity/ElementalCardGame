const resourceText = document.getElementById("resource-text");
const playerElement = [document.getElementById("player--1"), document.getElementById("player--2")]
const positionTiles = [document.querySelectorAll(".movement-area__position--1"), document.querySelectorAll(".movement-area__position--2")]
const positions = [
    Array.prototype.map.call(positionTiles[0], function(element) {
        return {
            tile: element,
            blocked: false,
            blockTile: undefined,
            hasPlayer: false,
        };
    }),
    Array.prototype.map.call(positionTiles[1], function(element) {
        return {
            tile: element,
            blocked: false,
            blockTile: undefined,
            hasPlayer: false,
        };
    }), 
];

const moveArrows = [{"left": document.getElementById("move-arrow-left--1"), "right": document.getElementById("move-arrow-right--1")}, {"left": document.getElementById("move-arrow-left--2"), "right": document.getElementById("move-arrow-right--2")}];
const board = document.getElementById("board");
const baseCards = document.getElementsByClassName("card--playable");
const dropZones = document.getElementsByClassName("drop-zone");
const turnText = document.getElementById("turn-text");
const handContainer = [document.getElementById("hand--1"), document.getElementById("hand--2")]
const healthText = [document.getElementById("health-text--1"), document.getElementById("health-text--2")];

const turnTextDialogue = {
    default: "Your turn",
    endOfTurn: "Opponenents turn",
    startOfTurn: "Move your character",
    hasMoved: "Play a card or end turn",
}

// Player variables
let playerPosition = [1, 1];
let playerHealth = [10, 10];
let canMove = true; // Unused
let curPlayer = 0;

// Add cards to cardsInPlay array when they're dropped in the corresponding container, on play, make the cards be used up and their effect be triggered
let cardsInPlay = [];

let curDraggedElement = null;
let curUpgradeElement = null;

let upgradeMenuOpen = false;

let curResources = 100;
let curUpgradeCards = null;

const earthObjects = [];

resourceText.textContent = "Resources: " + curResources;

// Doesn't get blocked by friendly earth element
function FireEffect (damage, direction) {
    if(positions[curPlayer][playerPosition[curPlayer]].blocked == true){
        // Remove earth object
        positions[curPlayer][playerPosition[curPlayer]].blockTile.remove();
        positions[curPlayer][playerPosition[curPlayer]].blocked = false;
    }
    else if (positions[GetOtherPlayer(curPlayer)][playerPosition[curPlayer]].hasPlayer){
        // Only for enemy fire
        // alert("dmg was inflicted");
        UpdateHealth(damage, direction);
    }

    let newFire = document.createElement("div");
    newFire.classList.add("ability--fire");
    newFire.classList.add("ability--fire--" + (curPlayer + 1));
    positions[curPlayer][playerPosition[curPlayer]].tile.appendChild(newFire);
    setTimeout(() => {
        newFire.remove();
    }, 100);
}

function DoubleFireEffect (damage, direction) {
    FireEffect(damage, direction);
    let player = curPlayer;
    setTimeout(() => {
        if(positions[player][playerPosition[player]].blocked == true){
            // Remove earth object
            positions[player][playerPosition[player]].blockTile.remove();
            positions[player][playerPosition[player]].blocked = false;
        }
        else if (positions[GetOtherPlayer(player)][playerPosition[player]].hasPlayer){
            // Only for enemy fire
            // alert("dmg was inflicted");
            UpdateHealth(damage, GetOtherPlayer(direction));
        }
    
        let newFire = document.createElement("div");
        newFire.classList.add("ability--fire");
        newFire.classList.add("ability--fire--" + (player + 1));
        positions[player][playerPosition[player]].tile.appendChild(newFire);
        setTimeout(() => {
            newFire.remove();
        }, 100);
    }, 200);
}

const EarthEffect = () => {
    let newEarth = document.createElement("div");
    newEarth.classList.add("ability--earth");
    newEarth.classList.add("ability--earth--" + (curPlayer + 1));
    let opponent = GetOtherPlayer(curPlayer);
    positions[curPlayer][playerPosition[curPlayer]].tile.appendChild(newEarth);
    positions[opponent][playerPosition[opponent]].blocked = true;
    positions[opponent][playerPosition[opponent]].blockTile = newEarth;
    // Removal effect?
}

const cardDatabase = {
    3: {
        id: 3,
        type: "Fire",
        cost: 20,
        description: "Shoot a basic fireball at the enemy, dealing 2 dmg",
        dmg: 2,
        callback: () => {
            FireEffect(2, 1);
        },
        next: [4, 6],
    },
    4: {
        id: 4,
        type: "Fire",
        description: "Shoot a heavy fireball at the enemy, dealing 6 dmg",
        cost: 20,
        dmg: 6,
        callback: () => {
            FireEffect(6, 1);
        },
        next: null,
    },
    6: {
        id: 6,
        type: "Fire",
        description: "Shoot two fireballs at the enemy, dealing 2 dmg each",
        cost: 60,
        dmg: 2,
        callback: () => {
            DoubleFireEffect(2, 1);
        },
        next: null,
    },
    5: {
        id: 5,
        type: "Earth",
        description: "Put up a wall of rock, blocking enemy attacks",
        cost: 50,
        callback: EarthEffect,
        next: null,
    },
}

// element property, parent, cost, type, playable, children []
// Replace this with a tree structure?
const allCards = {};

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
        description: baseCard.description,
        callback: baseCard.callback,
        playable: false,
        baseID: cardID,
        playID: newPlayID,

    };
    allCards[newPlayID] = newCard;
    DrawCardText(element);
}

// Add drag and drop functionality
function DragAndDropSetup() {
    console.log("Drag and drop set up")
    for(let i = 0; i < baseCards.length; i++){
        let curCard = baseCards[i];
        curCard.addEventListener("dragstart", (event) => {
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
                }
            }
            else {
                curDropZone.prepend(curDraggedElement);
                let indexToRemove = cardsInPlay.indexOf(curDraggedElement.id);
                if(indexToRemove >= 0) {
                    cardsInPlay.splice(indexToRemove);
                }
            }
            if(upgradeMenuOpen && curUpgradeElement){
                DrawUpgradeUI(curDraggedElement);
            }
            curDraggedElement = null;
        })
    }
}

// Fix bugs with upgraded cards not being returned to hand

function Upgrade(element, cardUpgrade) {
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
    allCards[newPlayID].element = cardUpgrade.parent;
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
        upgradeContainer.style.top = rect.y - containerRect.height - 15 + ((element.getBoundingClientRect().height + 15) * curPlayer * 2) + "px";

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
                description: upgrade.description,
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
            console.log(upgradeCard)
            DrawCardText(newCard);

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
        console.log("Tried to draw card text without an element")
        return;
    }
    let childrenToRemove = element.children;

    if(childrenToRemove != undefined){
        for(let i = 0; i < childrenToRemove.length; i++){

            // Not sure how this works, but both remove functions are needed to make sure the old description is removed after upgrading the card
            console.log("removed an element")
            childrenToRemove[i].remove();
            if(childrenToRemove[i].classList.contains("card__text")){
                console.log("removed an element")
                childrenToRemove[i].remove();
            }
        }
    }
    let card;
    if(allCards[element.id]){
        card = allCards[element.id];
    }
    else{
        card = element;
        element = element.element;
    }

    let costText = document.createElement("p");
    costText.textContent = card.cost;
    costText.classList.add("card__text");
    costText.classList.add("card__text--cost");
    element.appendChild(costText);

    let descText = document.createElement("p");
    descText.textContent = card.description;
    console.log(card.description);
    descText.classList.add("card__text");
    descText.classList.add("card__text--desc");
    element.appendChild(descText);

    let textArray = [];
    textArray.push(costText);
    textArray.push(descText);
    card.textChildren = textArray;
}

function SelectCard(element) {
    DrawUpgradeUI(element);
}

function UpdateHealth(damage, direction) {
    let player = direction > 0 ? GetOtherPlayer(curPlayer) : curPlayer; // Set targeted player based on direction (0 or 1)
    playerHealth[player] -= damage;
    healthText[player].textContent = "Health: " + playerHealth[player];
}


function ShowMoveArrows(){
    if(playerPosition[curPlayer] < 1) moveArrows[curPlayer]["left"].classList.add("hidden");
    if(playerPosition[curPlayer] > 1) moveArrows[curPlayer]["right"].classList.add("hidden");

    switch (playerPosition[curPlayer]){
        case 0:
            moveArrows[curPlayer]["left"].classList.add("hidden");
            if(moveArrows[curPlayer]["right"].classList.contains("hidden")){
                moveArrows[curPlayer]["right"].classList.remove("hidden");
            }
            break;
        case 2:
            moveArrows[curPlayer]["right"].classList.add("hidden");
            if(moveArrows[curPlayer]["left"].classList.contains("hidden")){
                moveArrows[curPlayer]["left"].classList.remove("hidden");
            }
            break;
        default:
            if(moveArrows[curPlayer]["right"].classList.contains("hidden")){
                moveArrows[curPlayer]["right"].classList.remove("hidden");
            }
            if(moveArrows[curPlayer]["left"].classList.contains("hidden")){
                moveArrows[curPlayer]["left"].classList.remove("hidden");
            }
            break;
    }
}

function HideMoveArrows(){
    moveArrows[curPlayer]["right"].classList.add("hidden");
    moveArrows[curPlayer]["left"].classList.add("hidden");
}

// Make sure you only move once per turn
function Move(direction) {
    if(!canMove) return; //Deprecated
    positions[curPlayer][playerPosition[curPlayer]].hasPlayer = false;
    playerPosition[curPlayer] += direction;
    if(playerPosition[curPlayer] > positions[curPlayer].length - 1) playerPosition[curPlayer] = positions[curPlayer].length - 1;
    positions[curPlayer][playerPosition[curPlayer]].tile.appendChild(playerElement[curPlayer]);
    positions[curPlayer][playerPosition[curPlayer]].hasPlayer = true;
    turnText.textContent = turnTextDialogue.hasMoved;
    HideMoveArrows();
}

// Deprecated
function AllowMove(){
    canMove = true;
    ShowMoveArrows();
}

function TriggerEffects() {
    console.log("Triggering effects")
    let cardID = 0;
    console.log(allCards);
    cardsInPlay.forEach((cardID) => {
        console.log(cardsInPlay);
        console.log(cardID);
        allCards[cardID].callback();
    })
}

function GetOtherPlayer(player) {
    if(player == 0){
        return 1;
    }
    else {
        return 0;
    }
}

function SwapPlayer() {
    handContainer[curPlayer].style.display = "none";
    curPlayer = GetOtherPlayer(curPlayer);
    // document.getElementById("curPlayerText").textContent = "Current player: " + (curPlayer + 1);
    handContainer[curPlayer].style.display = "flex";
    board.parentElement.style.flexDirection = curPlayer == 0 ? "column" : "column-reverse";
}

function ReturnCards() {
    if(cardsInPlay.length <= 0){
        console.log("No cards in play")
        return;
    }
    cardsInPlay.forEach((card) => {
        handContainer[curPlayer].appendChild(allCards[card].element);

    })
    cardsInPlay = [];
}


// Implement turn order

function StartTurn() {
    turnText.textContent = turnTextDialogue.startOfTurn; 
    ShowMoveArrows();
}

function EndTurn() {
    turnText.textContent = turnTextDialogue.endOfTurn;
    HideMoveArrows();
    TriggerEffects();
    ReturnCards();
    DrawUpgradeUI();
    SwapPlayer();
    StartTurn();
}

function GameSetup() {
    turnText.textContent = turnTextDialogue.default;
    DragAndDropSetup();
    UpdateHealth(0, curPlayer);
    UpdateHealth(0, GetOtherPlayer(curPlayer));
    positions[curPlayer][playerPosition[curPlayer]].hasPlayer = true;
    positions[GetOtherPlayer(curPlayer)][playerPosition[GetOtherPlayer(curPlayer)]].hasPlayer = true;
    window.onresize = DrawUpgradeUI;
}
GameSetup();