let cards = [
  {
    front: 'f',
    back: 'b',
  },
  {
    front: 'f2',
    back: 'b2',
  },
]

let front, back, back_text, next_btn

function onloadFunction() {
  front = document.getElementById('front')
  back = document.getElementById('back')
  back_text = document.getElementById('back_text')
  next_btn = document.getElementById('next_btn')
  // cards = getCards()
  mainloop()
}

function pickNextCard() {
  return cards[Math.floor(Math.random() * cards.length)]
}

function showCard(card) {
  front.innerText = card.front
  back.style.display = 'none'
  back_text.innerText = card.back
}

async function mainloop() {
  while (true) {
    let card = pickNextCard()
    showCard(card)

    // wait for button press
    await new Promise((resolve, reject) => {
      front.onclick = () => {
        resolve()
      }
    })

    // flip card
    back.style.display = 'block'

    // wait for button press
    await new Promise((resolve, reject) => {
      next_btn.onclick = () => {
        resolve()
      }
    })
    console.log('done!')
  }
}

window.onload = onloadFunction
