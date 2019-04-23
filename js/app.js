const NUM_OF_CARDS = 16;
const CARD_FLIP_SPEED = 1000;
const BOARD_PREVIEW = 6500;  // Milliseconds to preview cards at start
const sounds = {
  start1: new Audio('sounds/start1.wav'),
  start2: new Audio('sounds/start2.wav'),
  start3: new Audio('sounds/start3.wav'),
  flip: new Audio('sounds/flip.wav'),
  match: new Audio('sounds/match.wav'),
  mismatch: new Audio('sounds/mismatch.wav'),
  winning: new Audio('sounds/winning.wav')
};


// The Game class controls general features of the game unrelated to the board
class Game {
  constructor() {
    this.cards = document.getElementsByClassName('card');
    this.deck = ['fa-diamond', 'fa-diamond', 'fa-anchor', 'fa-anchor',
                 'fa-paper-plane-o', 'fa-paper-plane-o', 'fa-bolt', 'fa-bolt',
                 'fa-cube', 'fa-cube', 'fa-bicycle', 'fa-bicycle',
                 'fa-bomb', 'fa-bomb', 'fa-leaf', 'fa-leaf'];
    this.time = Math.ceil(BOARD_PREVIEW / -1000);
    this.counter = null;
    this.restarted = false;  // true when game is restarted
    this.matches = 0;
    this.attempts = 0;
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

  // Flip over any face-up cards and change its color back to normal by
  // removing the .match class
  static flipAndRemoveMatched() {
    const cards = document.getElementsByClassName('card');
    for (const card of cards) {
      card.classList.remove('flipped');
      setTimeout(() => card.firstElementChild.classList.remove('match'), 500);
    }
  }

  // Animation
  static zoomInContent() {
    const content = document.querySelector('.container');
    content.className = 'container animated zoomInDown';
    content.addEventListener('animationend', function() {
      this.className = 'container';
    }, {once: true});
  }

  // Sets the display property for the results view and play again button to
  // none. The .pyro class that controls the fireworks is also removed.
  static hideModals() {
    const fireworks = document.getElementById('fireworks-modal');
    document.getElementById('start-modal').style.display = 'none';
    document.getElementById('win-modal').style.display = 'none';
    document.getElementById('btn-modal').style.display = 'none';
    setTimeout(() => fireworks.classList.remove('pyro'), BOARD_PREVIEW);
  }

  // Display the results results view.
  displayModals() {
    const circleLoader = document.querySelector('.circle-loader');
    const checkmark = document.querySelector('.checkmark');
    const content = document.querySelector('.container');

    content.className = 'container animated zoomOutUp';
    content.addEventListener('animationend', evt => {
      // if the final card match animation has triggered this listener,
      // simply ignore it
      if (evt.target.nodeName !== 'DIV') {return}

      const btn = document.getElementById('btn-modal');
      const fireworks = document.getElementById('fireworks-modal');

      fireworks.classList.add('pyro');
      // checkmark animation
      setTimeout(() => {
        circleLoader.classList.add('load-complete');
        checkmark.style.display = 'inherit';
      }, 300);
      //circleLoader.classList.add('load-complete');
      //checkmark.style.display = 'inherit';
      document.getElementById('win-modal').style.display = 'flex';
      btn.style.display = 'grid';
      Media.playSound('winning');
    }, {once: true, capture: true});
  }

  // Render the appropriate scores on the results view
  displayResults() {
    const stars = document.querySelector('.stars').children.length;
    const matchRate = Math.round(this.matches / this.attempts * 100) + '%';
    const seconds = this.time + ' seconds';
    document.querySelector('.stars-span').innerHTML = stars;
    document.querySelector('.matchrate-span').innerHTML = matchRate;
    document.querySelector('.seconds-span').innerHTML = seconds;
  }

  // Handles the animation for a card after the user matches or
  // mismatches
  handleAnimation(card, match=false, gameWon=false) {
    const wrapperElem = card.parentElement;
    const frontElem = card.firstElementChild;
    const self = this;
    if (match) {
      wrapperElem.className += ' animated bounceIn';
      wrapperElem.addEventListener('animationend', function() {
        this.className = this.className.replace(' animated bounceIn', '');
        if (gameWon) {
          Game.flipAndRemoveMatched();
          setTimeout(self.displayModals, CARD_FLIP_SPEED);
          self.displayResults();
        }
      }, {once: true});
      frontElem.className += ' match';
    }
    else {
      wrapperElem.className += ' animated wobble';
      // wait until the animation ends and then remove the animate.css classes
      wrapperElem.addEventListener('animationend', function() {
        this.className = this.className.replace(' animated wobble', '');
      }, {once: true});
      frontElem.className += ' mismatch';
      setTimeout(() => frontElem.classList.remove('mismatch'), 500);
    }
  }

  // Set a one-second interval for the timer
  startTimer() {
    const timeElem = document.querySelector('.time-int');
    const incrementTimer = () => {
      timeElem.innerHTML = this.time;
      this.time++;
    }
    this.counter = setInterval(incrementTimer, 1000);
  }

  // Clears the timer interval
  stopTimer() {
    const timeElem = document.querySelector('.time-int');
    clearInterval(this.counter);
    timeElem.innerHTML = '--';
    this.time = Math.ceil(BOARD_PREVIEW / -1000);
  }

  // Renders the correct number of matches with regard to plurality/singularity
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

  // Renders the correct number of attempts with regard to plurality/singularity
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

  // Renders the appropriate star rating based on the match success rate
  updateRating() {
    const starElem = document.querySelector('.stars');
    const star = `<li><i class="fa fa-star"></i></li>`;
    // exit function if attempts is zero (game was restarted)
    if (!this.attempts) {
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

  // Updates only attempts and star rating if a card was matched,
  // else updates all three
  updateScore(match=true) {
    if (match) {
      this.incrementMatches();
    }
    this.incrementAttempts();
    this.updateRating();
  }

}


// The Board class controls functionality specific to the board of the game
class Board extends Game {
  constructor() {
    super();
    this.openCards = [];
    this.lastCard = null;
    // Defining the handler here in the contructor allows it to be used later
    // to remove the event listener
    this.flipEventHandler = evt => {
      const n = evt.target;
      // .card parents within the deck element do not contain divs, so if the
      // event target's node name is DIV we know it was a card that was clicked.
      // We also don't want to do anything if the card has already been flipped.
      if (n.nodeName === 'DIV' && !n.parentElement.classList.contains('flipped')) {
        const card = n.parentElement;
        const iconName = this.getCardIconName(card);
        card.classList.add('flipped');
        Media.playSound('flip');
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
    // event handler for when game is reset from the game view
    this.restartHandler = () => {
      this.restarted = true;
      this.restartGame();
    }
    // when restarted from the results (winning.css) view
    document.querySelector('#btn-modal').addEventListener('click', () => {
      const circleLoader = document.querySelector('.circle-loader');
      const checkmark = document.querySelector('.checkmark');
      const content = document.querySelector('.container');
      // remove solid checkmark state
      circleLoader.classList.remove('load-complete');
      checkmark.style.display = 'none';
      // remove container's animated state
      content.className = 'container animated zoomInDown';
      this.restarted = false;
      this.restartGame(false);
    });
  }

  // Clears fields and restarts the game. wait is false when either first
  // loading the game or when restarting from the win view modal.
  restartGame(wait=true) {
    const clearFields = () => {
      this.openCards = [];
      this.lastCard = null;
      this.matches = null;
      this.attempts = null;
      super.updateScore();
    }
    const deck = document.querySelector('.deck');
    const restart = document.querySelector('.restart');
    deck.removeEventListener('click', this.flipEventHandler);
    restart.removeEventListener('click', this.restartHandler);
    restart.style.cursor = 'default';
    super.stopTimer();
    clearFields();

    if (wait) {
      Game.flipAndRemoveMatched();
      setTimeout(() => this.startGame(), CARD_FLIP_SPEED);
    }
    else {
      this.startGame();
    }
  }

  // Wait for flip animation to complete, then render the match animation
  // and the new score
  handleMatch(card, iconName) {
    const lastCard = this.lastCard;
    let gameWon = false;
    this.lastCard = null;
    this.addToOpenCards(iconName);
    if (this.openCards.length >= NUM_OF_CARDS) {
      gameWon = true;
    }
    setTimeout(() => {
      [card, lastCard].forEach(elem => {
        super.handleAnimation(elem, true, gameWon);
        Media.playSound('match');
      });
      super.updateScore();
    }, CARD_FLIP_SPEED);

    const fireworks = document.getElementById('fireworks-modal');
    setTimeout(() => {
      fireworks.classList.add('pyro');
      fireworks.style.zIndex = -1;
    }, 1000);
    setTimeout(() => {
      fireworks.classList.remove('pyro');
      fireworks.style.zIndex = 2;
    }, 3000);

  }

  // Wait for flip animation to complete, then render the mismatch animation
  // and the new score
  handleMismatch(card, iconName) {
    const lastCard = this.lastCard;
    this.lastCard = null;
    this.deleteFromOpenCards(iconName);
    setTimeout(() => {
      [card, lastCard].forEach(elem => {
        elem.classList.remove('flipped');
        super.handleAnimation(elem, false);
        Media.playSound('mismatch');
      });
      super.updateScore(false);
    }, CARD_FLIP_SPEED);
  }

  // Pushes the name of the Bootstrap icon to the openCards array of strings
  addToOpenCards(iconName) {
    this.openCards.push(iconName);
  }

  // Pops the name of the Bootstrap icon from the openCards array of strings
  deleteFromOpenCards(iconName) {
    this.openCards.pop(iconName);
  }

  // Returns the name of the Bootstrap icon as a string
  getCardIconName(card) {
    return card.firstElementChild.firstElementChild.classList[1];
  }

  // Get a randomized board and display it using timeouts
  displayCards() {
    this.deck = Game.shuffle(this.deck);
    for (let i = 0; i < this.deck.length; i++) {
      const iconElem = this.cards[i].firstElementChild.firstElementChild;
      const iconName = iconElem.classList[1];
      iconElem.classList.remove(iconName);
      iconElem.classList.add(this.deck[i]);
      setTimeout(() => this.cards[i].classList.add('flipped'), 500);
      setTimeout(() => this.cards[i].classList.remove('flipped'), BOARD_PREVIEW);
      setTimeout(() => {
        const restart = document.querySelector('.restart');
        restart.addEventListener('click', this.restartHandler);
        restart.style.cursor = 'pointer';
      }, BOARD_PREVIEW + 500);
    }
  }

  // Do not animate zoom-in or alter modal attributes if reset button
  // was clicked
  startGame() {
    if (!this.restarted) {
      Game.hideModals();
      Game.zoomInContent();
    }
    const deck = document.querySelector('.deck');
    Media.playGameStart();
    this.displayCards();
    super.startTimer();
    setTimeout(() => {
      // The handler here serves as an event delegate for its child card
      // elements. It is also later used to remove the click listener when
      // restarting the game.
      deck.addEventListener('click', this.flipEventHandler);
    }, CARD_FLIP_SPEED);
  }

}

// The Media class currently uses audio files taken from the pokerstars.com
// desktop client application
class Media {
  // Plays three audio files in sequence
  static playGameStart() {
    sounds.start1.play();
    sounds.start1.onended = () => {
      sounds.start2.play();
      sounds.start2.onended = () => {
        sounds.start3.play();
      }
    }
  }

  // Takes in a string as a parameter and plays the appropriate audio file
  static playSound(name) {
    const path = `sounds/${name}.wav`;
    let file = new Audio(path);
    file.play();
  }

}


const board = new Board();
const startCb = () => {
  document.removeEventListener('keydown', startCb);
  board.startGame();
};
document.addEventListener('keydown', startCb);
