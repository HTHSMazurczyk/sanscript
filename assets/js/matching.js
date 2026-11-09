let questions
let prompt_text, prompt_audio_btn, next_btn, ans_btns, ans_texts, ans_audios
async function onloadFunction() {
  prompt_text = document.getElementById('prompt_text')
  prompt_audio_btn = document.getElementById('prompt_audio_btn')
  next_btn = document.getElementById('next_btn')
  ans_btns = document.getElementsByClassName('answer')
  ans_texts = document.getElementsByClassName('ans_text')
  ans_audios = document.getElementsByClassName('ans_audio')
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
  /* question = {
    id: str, lesson: str, prompt_text: str, prompt_audio: str, correct_choice: str
    answers: list[str], ans_audios: list[str]
  */
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
  const path = `assets/audio/${audio_name}`
  return () => {
    new Audio(path).play()
  }
}

function showQuestion(question) {
  // create front text + audio
  prompt_text.innerText = question.prompt_text + '\n'
  let audio_name = question.prompt_audio
  if (audio_name) {
    prompt_audio_btn.style.display = 'block' // default
    prompt_audio_btn.onclick = playAudioCallback(audio_name)
    playAudioCallback(audio_name)() // play on question load
  } else {
    prompt_audio_btn.style.display = 'none'
  }

  // create back text + audio
  for (let i = 0; i < 4; i = i + 1) {
    let text = question.answers[i]
    ans_texts[i].innerText = text
    let audio_name = question.ans_audios[i]
    let audio_icon = ans_audios[i]
    let ans_btn = ans_btns[i]
    if (audio_name) {
      audio_icon.style.display = 'inline-block' /* default */
      ans_btn.onclick = playAudioCallback(audio_name)
    } else {
      audio_icon.style.display = 'none'
    }
  }
}

function grade(question) {
  // zero-indexed
  let user_choice = Array.from(ans_inps)
    .map((x) => x.checked)
    .findIndex((x) => x)
  let correct_choice = Number(question.correct_choice) - 1
  ans_texts[correct_choice].parentElement.classList.remove('btn-outline-tertiary')
  ans_texts[correct_choice].parentElement.classList.add('btn-outline-success')
  if (correct_choice !== user_choice) {
    ans_inps[user_choice].checked = false // make button outline again
    ans_texts[user_choice].parentElement.classList.remove('btn-outline-tertiary')
    ans_texts[user_choice].parentElement.classList.add('btn-outline-danger')
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
