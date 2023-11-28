const resourceText = document.getElementById("resource-text");
let curResources = 100;
let curUpgradeCards = null;

resourceText.textContent = "Resources: " + curResources;

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
                lastNode = lastNode.next
            }
        }
        return lastNode
    }
}

const allCards = [
    {
        id: 2,
        cardName: "Fire",
        cost: 20,
    },
    {
        id: 5,
        cardName: "Earth",
        cost: 50,
    },
    {},
]

let card1 = new CardNode(10);
let card2 = new CardNode(20);
card1.next = card2;

let list = new CardList(card1);

function Upgrade(element, cardID) {
    console.log(element);
    let cost = allCards.find((card) => {
        return card.id === cardID;
    }).cost;
    curResources -= cost;
    resourceText.textContent = "Resources: " + curResources;
}


function SelectCard(element) {
    if(curUpgradeCards){
        curUpgradeCards[0].parentElement.parentElement.classList.add("card--playable__hover")
        for(let i = 0; i < curUpgradeCards.length; i++){
            curUpgradeCards[i].style.visibility = "hidden";
        }
        if(curUpgradeCards[0].parentElement.parentElement == element){
            curUpgradeCards = null;
            return;
        }
    }

    element.classList.remove("card--playable__hover")
    let children = element.children[0].children;
    for(let i = 0; i < children.length; i++){
        children[i].style.visibility = "visible";
    }
    curUpgradeCards = children;
}