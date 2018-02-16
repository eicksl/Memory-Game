const NUM_OF_CARDS = 16;
const CARD_FLIP_SPEED = 1000;
const BOARD_PREVIEW = 6500;  // Milliseconds to preview cards at start


class Game {
  constructor() {
    this.cards = document.getElementsByClassName('card');
    this.deck = ['fa-diamond', 'fa-diamond', 'fa-anchor', 'fa-anchor',
                 'fa-paper-plane-o', 'fa-paper-plane-o', 'fa-bolt', 'fa-bolt',
                 'fa-cube', 'fa-cube', 'fa-bicycle', 'fa-bicycle',
                 'fa-bomb', 'fa-bomb', 'fa-leaf', 'fa-leaf'];
    this.media = new Media();
    this.time = Math.ceil(BOARD_PREVIEW / -1000);
    this.counter = null;
    this.restarted = false;  // true when game is restarted
    this.matches = 0;
    this.attempts = 0;
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

  hideModals() {
    const winning = document.getElementById('win-modal');
    const fireworks = document.getElementById('fireworks-modal');
    const button = document.getElementById('btn-modal');
    winning.style.display = 'none';
    button.style.display = 'none';
    setTimeout(() => fireworks.classList.remove('pyro'), BOARD_PREVIEW);
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

  zoomInContent() {
    const content = document.querySelector('.container');
    content.className += ' animated zoomInDown';
    content.addEventListener(this.animationEnd, function() {
      this.className = this.className.replace(' animated zoomInDown', '');
    });
  }

  startTimer() {
    const timeElem = document.querySelector('.time-int');
    const incrementTimer = () => {
      timeElem.innerHTML = this.time;
      this.time++;
    }
    this.counter = setInterval(incrementTimer, 1000);
  }

  stopTimer() {
    const timeElem = document.querySelector('.time-int');
    clearInterval(this.counter);
    timeElem.innerHTML = '--';
    this.time = Math.ceil(BOARD_PREVIEW / -1000);
  }

  incrementMatches() {
    const matchesElem = document.querySelector('.matches');
    let pluralSpan = document.querySelector('.matches-plural');
    if (this.matches === null) {
      this.matches = 0;
      matchesElem.innerHTML = this.matches;
      pluralSpan.innerHTML = 'Matches';
      return;
    }
    this.matches++;
    matchesElem.innerHTML = this.matches;
    if (this.matches === 1) {
      pluralSpan.innerHTML = 'Match';
    }
    else if (pluralSpan.innerHTML === 'Match') {
      pluralSpan.innerHTML = 'Matches';
    }
  }

  incrementAttempts() {
    const attemptsElem = document.querySelector('.attempts');
    let pluralSpan = document.querySelector('.attempts-plural');
    if (this.attempts === null) {
      this.attempts = 0;
      attemptsElem.innerHTML = this.attempts;
      pluralSpan.innerHTML = 'Attempts';
      return;
    }
    this.attempts++;
    attemptsElem.innerHTML = this.attempts;
    if (this.attempts === 1) {
      pluralSpan.innerHTML = 'Attempt';
    }
    else if (pluralSpan.innerHTML === 'Attempt') {
      pluralSpan.innerHTML = 'Attempts';
    }
  }

  updateRating() {
    const starElem = document.querySelector('.stars');
    const star = `<li><i class="fa fa-star"></i></li>`;
    if (this.attempts === 0) {
      starElem.innerHTML = star.repeat(5);
      return;
    }
    const matchRate = this.matches / this.attempts;
    if (matchRate >= 0.8) {
        starElem.innerHTML = star.repeat(5);
    } else if (matchRate >= 0.6) {
        starElem.innerHTML = star.repeat(4);
    } else if (matchRate >= 0.4) {
        starElem.innerHTML = star.repeat(3);
    } else if (matchRate >= 0.2) {
        starElem.innerHTML = star.repeat(2);
    } else {
        starElem.innerHTML = star;
    }
  }

  updateScore(match=true) {
    if (match) {
      this.incrementMatches();
    }
    this.incrementAttempts();
    this.updateRating();
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

    this.flipEventHandler = evt => {
      const n = evt.target;
      if (n.nodeName === 'DIV' && !n.parentElement.classList.contains('flipped')) {
        const card = n.parentElement;
        const iconName = this.getCardIconName(card);
        card.classList.add('flipped');
        this.media.playSound('flip');
        if (!this.lastCard) {
          this.addToOpenCards(iconName);
          this.lastCard = card;
        }
        else {
          if (iconName === this.getCardIconName(this.lastCard)) {
            this.handleMatch(card, iconName);
          }
          else {
            this.handleMismatch(card, iconName);
          }
        }
      }
    }

    document.querySelector('.restart').addEventListener('click', () => {
      this.restartGame();
    });
  }

  restartGame() {
    const clearFields = () => {
      this.openCards = [];
      this.lastCard = null;
      this.matches = null;
      this.attempts = null;
      super.updateScore();
    }
    const deck = document.querySelector('.deck');
    this.restarted = true;
    deck.removeEventListener('click', this.flipEventHandler);
    super.stopTimer();
    clearFields();
    for (const card of this.cards) {
      card.classList.remove('flipped');
      setTimeout(() => card.firstElementChild.classList.remove('match'), 500);
    }
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
        this.media.playSound('match');
      });
      super.updateScore();
    }, CARD_FLIP_SPEED);
  }

  handleMismatch(card, iconName) {
    const lastCard = this.lastCard;
    this.lastCard = null;
    this.deleteFromOpenCards(iconName);
    setTimeout(() => {
      [card, lastCard].forEach(elem => {
        elem.classList.remove('flipped');
        super.handleAnimation(elem, false);
        this.media.playSound('mismatch');
      });
      super.updateScore(false);
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

  displayCards() {
    this.deck = Game.shuffle(this.deck);
    for (let i = 0; i < this.deck.length; i++) {
      const iconElem = this.cards[i].firstElementChild.firstElementChild;
      const iconName = iconElem.classList[1];
      iconElem.classList.remove(iconName);
      iconElem.classList.add(this.deck[i]);
      setTimeout(() => this.cards[i].classList.add('flipped'), 500);
      setTimeout(() => this.cards[i].classList.remove('flipped'), BOARD_PREVIEW);
    }
  }

  startGame() {
    super.hideModals();
    if (!this.restarted) {
      super.zoomInContent();
    }
    const deck = document.querySelector('.deck');
    this.media.playGameStart();
    this.displayCards();
    super.startTimer();
    setTimeout(() => {
      deck.addEventListener('click', this.flipEventHandler);
    }, CARD_FLIP_SPEED);


  }

}

// The Media class currently uses audio files taken from the pokerstars.com
// desktop client application
class Media {
  playGameStart() {
    let file = new Audio('sounds/start1.wav');
    file.play();
    file.onended = () => {
      file = new Audio('sounds/start2.wav');
      file.play();
      file.onended = () => {
        file = new Audio('sounds/start3.wav');
        file.play();
        file.onended = () => file = null;
      }
    }
  }

  playSound(sound) {
    const path = `sounds/${sound}.wav`;
    let file = new Audio(path);
    file.play();
    file.onended = () => file = null;
  }

}


const board = new Board();
board.startGame();
