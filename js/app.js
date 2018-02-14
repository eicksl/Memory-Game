/*
 * Create a list that holds all cards
 */
 let deck = ['fa-diamond', 'fa-diamond', 'fa-anchor', 'fa-anchor',
            'fa-paper-plane-o', 'fa-paper-plane-o', 'fa-bolt', 'fa-bolt',
            'fa-cube', 'fa-cube', 'fa-bicycle', 'fa-bicycle',
            'fa-bomb', 'fa-bomb', 'fa-leaf', 'fa-leaf'];


/*
 * Display the cards on the page
 *   - shuffle the list of cards using the shuffle method
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */
function displayCards() {
  /*
  let cards = document.getElementsByClassName('card');
  deck = shuffle(deck);
  for (let i = 0; i < deck.length; i++) {
    const icon = cards[i].firstElementChild;
    const currentIcon = icon.classList[1];
    icon.classList.remove(currentIcon);
    icon.classList.add(deck[i]);

    setTimeout(() => cards[i].classList.toggle('flipped'), 500);
    //cards[i].className += ' open show';
  }
  */
  const card = document.querySelector('.card');
  card.addEventListener('click', function() {
    this.classList.toggle('flipped');
  });
}


// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
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


displayCards();


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
