const NUM_OF_CARDS = 16;
const BOARD_PREVIEW = 3500;  // Milliseconds to preview cards at start


class Game {
  constructor() {
    this.deck = ['fa-diamond', 'fa-diamond', 'fa-anchor', 'fa-anchor',
                 'fa-paper-plane-o', 'fa-paper-plane-o', 'fa-bolt', 'fa-bolt',
                 'fa-cube', 'fa-cube', 'fa-bicycle', 'fa-bicycle',
                 'fa-bomb', 'fa-bomb', 'fa-leaf', 'fa-leaf'];
    this.cards = document.getElementsByClassName('card');
  }

  // Shuffle function from http://stackoverflow.com/a/2450976
  static shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;

      while (currentIndex !== 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
      }

      return array;
  }

  displayModal() {
    console.log('Congratulations!');
  }

}


class Board extends Game {
  constructor() {
    super();
    this.openCards = [];
    this.lastCard = null;
  }

  handleMatch(card, iconName) {
    this.addToOpenCards(iconName);
    this.lastCard = null;
    if (this.openCards.length >= NUM_OF_CARDS) {
      super.displayModal();
    }
    // ANIMATION
  }

  handleMismatch(card, iconName) {
    const lastCard = this.lastCard;
    this.lastCard = null;
    this.deleteFromOpenCards(iconName);
    setTimeout(() => {
      [card, lastCard].forEach(elem => {
        elem.classList.toggle('flipped');
        this.setFlipEvent(elem);
      });
    }, 1000);
    // ANIMATION
  }

  addToOpenCards(iconName) {
    this.openCards.push(iconName);
  }

  deleteFromOpenCards(iconName) {
    this.openCards.pop(iconName);
  }

  getCardIconName(card) {
    return card.firstElementChild.firstElementChild.classList[1];
  }

  setFlipEvent(card) {
    const self = this;
    card.addEventListener('click', function() {
      const iconName = self.getCardIconName(this);
      this.classList.toggle('flipped');
      if (!self.lastCard) {
        self.addToOpenCards(iconName);
        self.lastCard = card;
      }
      else {
        if (iconName === self.getCardIconName(self.lastCard)) {
          self.handleMatch(card, iconName);
        }
        else {
          self.handleMismatch(card, iconName);
        }
      }
    }, {once: true});
  }

  displayCards() {
    this.deck = Game.shuffle(this.deck);
    for (let i = 0; i < this.deck.length; i++) {
      const iconElem = this.cards[i].firstElementChild.firstElementChild;
      const iconName = iconElem.classList[1];
      iconElem.classList.remove(iconName);
      iconElem.classList.add(this.deck[i]);
      setTimeout(() => this.cards[i].classList.toggle('flipped'), 500);
      setTimeout(() => this.cards[i].classList.toggle('flipped'), BOARD_PREVIEW);
    }
  }

  startGame() {
    this.displayCards();
    setTimeout(() => {
      for (const card of this.cards) {
        this.setFlipEvent(card);
      }
    }, BOARD_PREVIEW);
  }

}


const board = new Board();
board.startGame();


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */
