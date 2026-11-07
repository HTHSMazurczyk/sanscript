let cards
let front_text, back, back_text, next_btn, front_audio_btn, back_audio_btn
async function onloadFunction() {
  front_text = document.getElementById('front_text')
  front_audio_btn = document.getElementById('front_audio_btn')
  back = document.getElementById('back')
  back_text = document.getElementById('back_text')
  back_audio_btn = document.getElementById('back_audio_btn')
  next_btn = document.getElementById('next_btn')
  cards = await getCards()
  filterCardsByLesson(cards)
  console.log(cards)
  if (cards.length > 0) {
    await mainloop()
  } else {
    alert('no cards found!')
  }
}

function zip(left, right) {
  let out = []
  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    out.push([left[i], right[i]])
  }
  return out
}

async function getCards() {
  let data
  try {
    const response = await fetch('assets/questiondata/flashcards.csv')
    if (!response.ok) {
      throw new Error('Network Error!')
    }
    data = await response.text()
  } catch (err) {
    console.error(err)
    alert('error fetching card database!')
    return null
  }

  let rows = data.split('\n')
  let header = rows.shift().split(',')

  cards = []
  for (let row of rows) {
    cards.push(Object.fromEntries(zip(header, row.split(','))))
  }
  // console.log(cards)
  return cards
}

function filterCardsByLesson() {
  let validLessons = []
  const url_params = new URLSearchParams(window.location.search)
  for (const [key, val] of url_params)
    if (val === 'true') {
      validLessons.push(key)
    }
  cards = cards.filter((card) => validLessons.includes(card.lesson))
}

function pickNextCard() {
  return cards[Math.floor(Math.random() * cards.length)]
}

function playAudio(audio_name) {
  const path = `assets/audio/${audio_name}.mp3`
  new Audio(path).play()
}

function showCard(card) {
  front_text.innerText = card['front text'] + '\n'

  // create front text + audio
  let audio_name = card['front audio path']
  if (audio_name) {
    front_audio_btn.style.display = 'inline-block' /* default */
    front_audio_btn.onclick = () => playAudio(audio_name)
    playAudio(audio_name) // play on card load
  } else {
    front_audio_btn.style.display = 'none'
  }

  // create back text + audio
  back.style.visibility = 'hidden'
  back_text.innerText = card['back text']

  audio_name = card['back audio path']
  if (audio_name) {
    back_audio_btn.style.display = 'inline-block' /* default */
    back_audio_btn.onclick = () => playAudio(audio_name)
  } else {
    back_audio_btn.style.display = 'none'
  }
}

async function mainloop() {
  while (true) {
    let card = pickNextCard()
    showCard(card)

    // wait for space press
    await new Promise((resolve, reject) => {
      document.addEventListener(
        'keyup',
        (event) => {
          if (event.key == ' ') {
            resolve()
          }
        },
        { once: true },
      )
    })

    // flip card
    back.style.visibility = 'visible'

    // wait for button press
    await new Promise((resolve, reject) => {
      next_btn.onclick = () => {
        resolve()
      }
      document.addEventListener(
        'keyup',
        (event) => {
          if (event.key == ' ') {
            resolve()
          }
        },
        { once: true },
      )
    })
    // console.log('done!')
  }
}

window.onload = onloadFunction
