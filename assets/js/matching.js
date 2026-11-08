let questions
let prompt_text, back, back_text, next_btn, prompt_audio_btn, back_audio_btn
async function onloadFunction() {
  prompt_text = document.getElementById('prompt_text')
  prompt_audio_btn = document.getElementById('prompt_audio_btn')
  next_btn = document.getElementById('next_btn')
  questions = await getQuestions()
  filterQuestionsByLesson(questions)
  if (questions.length > 0) {
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

async function getQuestions() {
  let data
  try {
    const response = await fetch('assets/questiondata/matching.csv')
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
  let header = rows
    .shift() // pop first row out
    .split(',')
    .map((x) => x.trim())

  questions = []
  for (let row of rows) {
    row = row.split(',').map((x) => x.trim())
    // prettier-ignore
    let { 
      ans1, ans2, ans3, ans4,
      ans1_audio, ans2_audio, ans3_audio, ans4_audio,
      ...question 
    } = Object.fromEntries(zip(header, row))

    question.answers = [ans1, ans2, ans3, ans4]
    question.ans_audios = [ans1_audio, ans2_audio, ans3_audio, ans4_audio]
    questions.push(question)
  }
  console.log(questions)
  return questions
}

function filterQuestionsByLesson() {
  let validLessons = []
  const url_params = new URLSearchParams(window.location.search)
  for (const [key, val] of url_params)
    if (val === 'true') {
      validLessons.push(key)
    }
  questions = questions.filter((question) => validLessons.includes(question.lesson))
}

function pickNextQuestion() {
  return questions[Math.floor(Math.random() * questions.length)]
}

function playAudioCallback(audio_name) {
  const path = `assets/audio/${audio_name}.mp3`
  return () => {
    new Audio(path).play()
  }
}

function showQuestion(question) {
  prompt_text.innerText = question['prompt text'] + '\n'

  // create front text + audio
  let audio_name = question['prompt audio']
  if (audio_name) {
    prompt_audio_btn.style.display = 'inline-block' /* default */
    prompt_audio_btn.onclick = playAudioCallback(audio_name)
    playAudioCallback(audio_name)() // play on question load
  } else {
    prompt_audio_btn.style.display = 'none'
  }

  // create back text + audio
  audio_name = question['back audio path']
  if (audio_name) {
    back_audio_btn.style.display = 'inline-block' /* default */
    back_audio_btn.onclick = () => playAudioCallback(audio_name)
  } else {
    back_audio_btn.style.display = 'none'
  }
}

async function mainloop() {
  while (true) {
    let card = pickNextQuestion()
    showQuestion(card)

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
