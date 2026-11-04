let cards = {}
let front, back, back_text, next_btn

function onloadFunction() {
  front = document.getElementById('front')
  back = document.getElementById('back')
  back_text = document.getElementById('back_text')
  next_btn = document.getElementById('next_btn')
  cards = getCards()
}

async function mainloop() {
  while (true) {
    let card = pickNextCard()
    showCard(card)
    // wait for button press
    await new Promise((resolve, reject) => {
      next_btn.onclick = () => {
        resolve()
      }
    })
  }
}
