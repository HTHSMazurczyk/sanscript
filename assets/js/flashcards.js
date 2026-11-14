import * as common from './common.js'

let front_text, back, back_text, next_btn, front_audio_btn, back_audio_btn
async function onloadFunction() {
  front_text = document.getElementById('front_text')
  front_audio_btn = document.getElementById('front_audio_btn')
  back = document.getElementById('back')
  back_text = document.getElementById('back_text')
  back_audio_btn = document.getElementById('back_audio_btn')
  next_btn = document.getElementById('next_btn')
  let cards = await common.getCSVrows('flashcards')
  cards = common.filterQuestionsByLesson(cards)
  console.log(cards)
  if (cards.length > 0) {
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
    let card = common.pickNextQuestion(cards)
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
    if (back_audio_btn.style.display !== 'none') {
      back_audio_btn.onclick() // play audio on flip
    }

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
