import * as common from './common.js'

let accuracies = new common.AccuracyDB('flashcards')
let card_picker

let front_text, back, back_text, front_audio_btn, back_audio_btn, correct_btn, incorrect_btn
async function onloadFunction() {
  front_text = document.getElementById('front_text')
  front_audio_btn = document.getElementById('front_audio_btn')
  back = document.getElementById('back')
  back_text = document.getElementById('back_text')
  back_audio_btn = document.getElementById('back_audio_btn')
  correct_btn = document.getElementById('correct_btn')
  incorrect_btn = document.getElementById('incorrect_btn')
  let cards = await common.getCSVrows('flashcards')
  cards = common.filterQuestionsByLesson(cards)
  cards = Object.fromEntries(
    common.zip(
      cards.map((x) => x.id),
      cards,
    ),
  )
  console.log(cards)
  card_picker = new common.CardPicker(accuracies, cards)
  if (Object.keys(cards).length > 0) {
    await mainloop(cards)
  } else {
    alert('no cards found!')
  }
}

function showCard(card) {
  front_text.innerText = card['front text'] + '\n'

  // create front text + audio
  let audio_name = card['front audio path']
  if (audio_name) {
    front_audio_btn.style.display = 'inline-block' /* default */
    front_audio_btn.onclick = common.playAudioCallback(audio_name)
    common.playAudioCallback(audio_name)() // play on card load
  } else {
    front_audio_btn.style.display = 'none'
  }

  // create back text + audio
  back.style.visibility = 'hidden'
  back_text.innerText = card['back text']

  audio_name = card['back audio path']
  if (audio_name) {
    back_audio_btn.style.display = 'inline-block' /* default */
    back_audio_btn.onclick = common.playAudioCallback(audio_name)
  } else {
    back_audio_btn.style.display = 'none'
  }
}

async function mainloop(cards) {
  while (true) {
    const cardid = card_picker.getQuestionId()
    if (cardid === undefined) {
      alert(`You've finished the deck! take a break for a few minutes to review?`)
      window.location.assign('practice.html')
      return
    }
    if (cardid === null) {
      let response = confirm(`You've now seen 20 new cards! Continue?`)
      if (response) {
        window.location.reload()
      } else {
        window.location.assign('practice.html')
      }
    }
    let card = cards[cardid]
    showCard(card)

    // wait for space press
    await new Promise((resolve, reject) => {
      document.addEventListener('keyup', (event) => {
        if (event.key === ' ') {
          resolve()
        }
      })
    })

    // flip card
    back.style.visibility = 'visible'
    if (back_audio_btn.style.display !== 'none') {
      back_audio_btn.onclick() // play audio on flip
    }

    // wait for button press
    let user_correct = false
    await new Promise((resolve, reject) => {
      correct_btn.onclick = () => resolve(true)
      incorrect_btn.onclick = () => resolve(false)

      // prettier-ignore
      document.addEventListener('keyup', (event) => {
        if (event.key === '1') { resolve(true) }
        if (event.key === '2') { resolve(false) }
      })
    }).then((ret) => {
      user_correct = ret
    })

    accuracies.updateItem(card.id, user_correct)

    // console.log('done!')
  }
}

window.onload = onloadFunction
