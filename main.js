// status
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

// adopt MVC
const view = {

  // label each poker card index after being shuffled
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  // show card front context when callback
  getCardFront(index) {
    const number = this.getCardNumber((index % 13) + 1)
    const symbol = this.getCardSymbol(index)

    return `
      <p>${number}</p>
      <div class="card-img ${symbol}"></div>
      <p>${number}</p>
    `
  },

  // transform index 52 to poker number 1~10, J, Q, K
  getCardNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  // generate poker suites by index 52
  getCardSymbol(number) {
    const index = Math.floor(number / 13)
    switch (index) {
      case 0:
        return "heart"
      case 1:
        return "diamond"
      case 2:
        return "club"
      case 3:
        return "spade"
    }
  },


  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  toggleEasyModeCards(element) {
    if (!element.classList.contains('paired')) {
      element.classList.toggle('back-blur')
      if (controller.easyMode) {
        element.innerHTML = this.getCardFront(element.dataset.index)
      } else {
        element.innerHTML = ''
      }
    }
  },

  updateEasyModeBtn(toggle) {
    const btn = document.querySelector('.easy-mode')
    const btnSwitch = document.querySelector('#easy-mode-switch')

    if (toggle) {
      btnSwitch.textContent = 'ON'
      btn.classList.remove('btn-danger')
      btn.classList.add('btn-success')
    } else {
      btnSwitch.textContent = 'OFF'
      btn.classList.remove('btn-success')
      btn.classList.add('btn-danger')
    }
  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardFront(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
      card.classList.remove('back-blur')
    })
  },

  renderScore(score) {
    const scoreText = document.querySelector("#score")
    scoreText.textContent = `${score}`
  },

  renderTriedTimes(times) {
    const triedText = document.querySelector("#tried")
    triedText.textContent = `${times}`
  },

  // css animation
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished(score, tried) {
    const endGameMessage = document.querySelector("#end-game-message")
    const endGameScore = document.querySelector("#end-score")
    const endGameTried = document.querySelector("#end-tried")

    endGameScore.textContent = score
    endGameTried.textContent = tried
    endGameMessage.classList.remove("hide")
    header.before(endGameMessage)
  }
}

const model = {
  revealedCards: [], // cards being flipped
  tried: 0,
  scores: 0,
  maxScores: 260,

  // verify matched cards, return bool
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
}

const controller = {
  easyMode: false,
  currentState: GAME_STATE.FirstCardAwaits,

  // shuffle cards
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {

    if (!card.classList.contains('back')) {
      return
    }

    // flip first card
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      // flip second card
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.tried)
        view.flipCards(card)
        model.revealedCards.push(card)

        // test pair match
        if (model.isRevealedCardsMatched()) {
          // pair match succeed
          view.renderScore(model.scores += 10)

          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []

          // end game
          if (model.scores === model.maxScores) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished(model.scores, model.tried)
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // pair match fail
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)   // 停留 1000 毫秒 (1s) 後執行重置
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },

  onClickedEasyModeBtn() {
    const cardContent = document.querySelectorAll('.card')

    if (!this.easyMode) {
      this.easyMode = true
      view.updateEasyModeBtn(true)
      cardContent.forEach(card => view.toggleEasyModeCards(card))
    } else {
      this.easyMode = false
      view.updateEasyModeBtn(false)
      cardContent.forEach(card => view.toggleEasyModeCards(card))
    }
  },

  onClickedPlayAgainBtn() {
    window.location.reload()
  }

}

// Fisher-Yates Shuffle
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())  // .keys() 依序做出陣列的 index
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

// start
controller.generateCards()

// listeners
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})
document.querySelector('.easy-mode').addEventListener('click', (event) => { controller.onClickedEasyModeBtn() })
document.querySelector('#play-again-btn').addEventListener('click', controller.onClickedPlayAgainBtn)