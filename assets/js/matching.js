import * as common from './common.js'

// initialize objects, create global variables
let accuracies = new common.AccuracyDB('matching')
let card_picker
let prompt_text, prompt_audio_btn, next_btn, ans_inputs, ans_texts, ans_audios

/**
 * Gets references to all interactive elements, gets and filters questions,
 * starts mainloop
 */
async function onloadFunction() {
  prompt_text = document.getElementById('prompt_text')
  prompt_audio_btn = document.getElementById('prompt_audio_btn')
  next_btn = document.getElementById('next_btn')
  ans_inputs = document.getElementsByClassName('answer')
  ans_texts = document.getElementsByClassName('ans_text')
  ans_audios = document.getElementsByClassName('ans_audio')
  let rows = await common.getCSVrows('matching')
  let questions = rowsToQuestions(rows)
  questions = common.filterQuestionsByLesson(questions)
  questions = Object.fromEntries(
    common.zip(
      questions.map((x) => x.id),
      questions,
    ),
  )
  card_picker = new common.CardPicker(accuracies, questions)
  if (Object.keys(questions).length > 0) {
    await mainloop(questions)
  } else {
    alert('no cards found!')
  }
}

/**
 * Restructures output from `getCSVRows` to be easier to work with
 * @param {Array} rows array of objects
 * @returns array of {id, lesson, prompt_text, prompt_audio, correct_choice, answers: [str,...], ans_audios: [str, ...]}
 */
function rowsToQuestions(rows) {
  let questions = []
  for (let row of rows) {
    // prettier-ignore
    let { 
      ans1, ans2, ans3, ans4,
      ans1_audio, ans2_audio, ans3_audio, ans4_audio,
      ...question 
    } = row

    question.answers = [ans1, ans2, ans3, ans4]
    question.ans_audios = [ans1_audio, ans2_audio, ans3_audio, ans4_audio]
    questions.push(question)
  }
  return questions
}

/**
 * Writes question content (prompt, audio, answers) to screen. Resets formatting
 * @param {Object} question
 */
function showQuestion(question) {
  // create front text + audio
  prompt_text.innerText = question.prompt_text + '\n'
  let audio_name = question.prompt_audio
  if (audio_name) {
    prompt_audio_btn.style.display = 'block' // default
    prompt_audio_btn.onclick = common.playAudioCallback(audio_name)
    common.playAudioCallback(audio_name)() // play on question load
  } else {
    prompt_audio_btn.style.display = 'none'
    prompt_audio_btn.onclick = null
  }

  // create answer text, create answer audio, reset button states
  for (let i = 0; i < 4; i = i + 1) {
    // set text
    let text = question.answers[i]
    let ans_text = ans_texts[i]
    ans_text.innerText = text

    // set audio
    let audio_name = question.ans_audios[i]
    let audio_icon = ans_audios[i]
    let ans_input = ans_inputs[i]
    if (audio_name) {
      audio_icon.style.display = 'inline-block' /* default */
      ans_input.onclick = common.playAudioCallback(audio_name)
    } else {
      audio_icon.style.display = 'none'
      ans_input.onclick = null
    }

    // reset correct answer styling
    ans_input.checked = false
    ans_text.parentElement.classList.add('btn-outline-tertiary')
    ans_text.parentElement.classList.remove('btn-outline-success', 'btn-outline-danger')
  }
}

/**
 * Checks of answer choices based on keyboard input, plays audio
 * @param {KeyboardEvent} event
 */
function handleNumberPress(event) {
  if (['1', '2', '3', '4'].includes(event.key)) {
    let idx = Number(event.key) - 1
    ans_inputs[idx].checked = true
    if (ans_inputs[idx].onclick !== null) {
      ans_inputs[idx].onclick() // play audio
    }
  }
}

/**
 * Highlight correct answer, update AccuracyDB with response, change next button
 * @param {Object} question
 */
function grade(question) {
  // Get user and correct choice
  let user_choice = Array.from(ans_inputs) // zero-indexed
    .map((x) => x.checked)
    .findIndex((x) => x)
  console.assert(user_choice >= 0)
  let correct_choice = Number(question.correct_choice) - 1

  // highlight correct answer
  ans_texts[correct_choice].parentElement.classList.remove('btn-outline-tertiary')
  ans_texts[correct_choice].parentElement.classList.add('btn-outline-success')

  // uncheck user answer, highlight as wrong if appropriate
  ans_inputs[user_choice].checked = false // make button outline again
  if (correct_choice !== user_choice) {
    ans_texts[user_choice].parentElement.classList.remove('btn-outline-tertiary')
    ans_texts[user_choice].parentElement.classList.add('btn-outline-danger')
  }

  accuracies.updateItem(question.id, correct_choice === user_choice)

  next_btn.innerHTML = 'Next &rightarrow;'
}

/**
 * Runs the web page: picks question, displays question, handles user inputs, grades question, updates AccuracyDB
 * @param {Array<Object>} questions array of questions from `rowsToQuestions`
 * @returns Never
 */
async function mainloop(questions) {
  while (true) {
    let questionid = card_picker.getQuestionId()
    if (questionid === undefined) {
      alert(`You've finished the deck! take a break for a few minutes to review?`)
      return
    }
    if (questionid === null) {
      let response = confirm(`You've now seen 20 new question! Continue?`)
      if (response) {
        window.location.reload()
      } else {
        window.location.assign('practice.html')
      }
    }
    let question = questions[questionid]
    showQuestion(question)

    document.addEventListener('keyup', handleNumberPress)
    while (true) {
      // wait for enter or next btn press
      await new Promise((resolve, reject) => {
        next_btn.onclick = () => resolve()
        document.addEventListener('keyup', (event) => {
          if (event.key === 'Enter') {
            resolve()
          }
        })
      })
      if (
        Array.from(ans_inputs)
          .map((x) => x.checked)
          .some((x) => x)
      ) {
        break
      }
    }

    document.removeEventListener('keyup', handleNumberPress)
    grade(question)

    // wait for button press
    await new Promise((resolve, reject) => {
      next_btn.onclick = () => resolve()
      document.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          resolve()
        }
      })
    })
  }
}

window.onload = onloadFunction
