const NUM_OF_CARDS = 16;
const CARD_FLIP_SPEED = 1000;
const BOARD_PREVIEW = 3500;  // Milliseconds to preview cards at start


class Game {
  constructor() {
    this.cards = document.getElementsByClassName('card');
    this.deck = ['fa-diamond', 'fa-diamond', 'fa-anchor', 'fa-anchor',
                 'fa-paper-plane-o', 'fa-paper-plane-o', 'fa-bolt', 'fa-bolt',
                 'fa-cube', 'fa-cube', 'fa-bicycle', 'fa-bicycle',
                 'fa-bomb', 'fa-bomb', 'fa-leaf', 'fa-leaf'];
    this.inPlay = true;
    // Find an AnimationEnd event that the browser recognizes
    // Taken from https://github.com/daneden/animate.css
    this.animationEnd = (function(el) {
      const animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
      };

      for (const t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));
  }

  // Shuffle function from http://stackoverflow.com/a/2450976
  static shuffle(array) {
      let currentIndex = array.length, temporaryValue, randomIndex;

      while (currentIndex !== 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
      }

      return array;
  }

  handleAnimation(card, match=false) {
    const wrapperElem = card.parentElement;
    const frontElem = card.firstElementChild;
    if (match) {
      wrapperElem.className += ' animated bounceIn';
      wrapperElem.addEventListener(this.animationEnd, function() {
        this.className = this.className.replace(' animated bounceIn', '');
      });
      frontElem.className += ' match';
    }
    else {
      wrapperElem.className += ' animated wobble';
      wrapperElem.addEventListener(this.animationEnd, function() {
        this.className = this.className.replace(' animated wobble', '');
      });
      frontElem.className += ' mismatch';
      setTimeout(() => frontElem.classList.remove('mismatch'), 500);
    }
  }

  removeCardEventListeners() {
    // Copy and replace card nodes to remove click listeners and restore
    // styles to original state
    for (let card of this.cards) {
      card.classList.remove('flipped');
      card.firstElementChild.classList.remove('match');
      const cardClone = card.cloneNode(true);
      card.parentNode.replaceChild(cardClone, card);
      card = null;  // Dump old node
    }
    this.cards = document.getElementsByClassName('card');
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
    document.querySelector('.restart').addEventListener('click', () => {
      this.restartGame();
    });
  }

  restartGame() {
    super.removeCardEventListeners();
    setTimeout(() => {
      this.startGame();
    }, CARD_FLIP_SPEED);

  }

  handleMatch(card, iconName) {
    const lastCard = this.lastCard;
    this.lastCard = null;
    this.addToOpenCards(iconName);
    if (this.openCards.length >= NUM_OF_CARDS) {
      super.displayModal();
    }
    setTimeout(() => {
      [card, lastCard].forEach(elem => {
        super.handleAnimation(elem, true);
      });
    }, CARD_FLIP_SPEED);
  }

  handleMismatch(card, iconName) {
    const lastCard = this.lastCard;
    this.lastCard = null;
    this.deleteFromOpenCards(iconName);
    setTimeout(() => {
      [card, lastCard].forEach(elem => {
        elem.classList.toggle('flipped');
        this.setFlipEvent(elem);
        super.handleAnimation(elem, false);
      });
    }, CARD_FLIP_SPEED);
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
        self.lastCard = this;
      }
      else {
        if (iconName === self.getCardIconName(self.lastCard)) {
          self.handleMatch(this, iconName);
        }
        else {
          self.handleMismatch(this, iconName);
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
