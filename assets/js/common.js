export class AccuracyDB {
  constructor(style) {
    this.style = style
    this.data = JSON.parse(localStorage.getItem())
  }
  getItem(id) {
    if (id in this.data) {
      let item = this.data[id].slice(0, -1)
      item.push(new Date(this.data[id].at(-1)))
      return item
    } else {
      alert('ummmmmmmm card not found :(')
    }
  }
  setItem(id, correct, total, prompt_next_ts) {
    this.data[id] = [correct, total, prompt_next_ts]
    localStorage.setItem(`${this.style}_accuracies`, JSON.stringify(this.data))
  }
  updateItem(id, was_correct) {
    let [correct, total, prompt_next_ts] = this.getItem(id)
    if (was_correct) {
      prompt_next_ts = Date.now() + 15 * 60 * 1_000 // 15 mins
      correct += 1
    } else {
      prompt_next_ts = Date.now() + 3 * 60 * 1_000 // 3 mins
    }
    this.setItem(id, correct, total + 1, prompt_next_ts)
  }
}

export function zip(left, right) {
  let out = []
  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    out.push([left[i], right[i]])
  }
  return out
}

export async function getCSVrows(style) {
  let data
  try {
    const response = await fetch(`assets/questiondata/${style}.csv`)
    if (!response.ok) {
      throw new Error('Network Error!')
    }
    data = await response.text()
  } catch (err) {
    console.error(err)
    alert(`error fetching ${style} database!`)
    return null
  }

  let rows = data.split('\n')
  let header = rows
    .shift() // pop first row out
    .split(',')
    .map((x) => x.trim())

  let questions = []
  for (let row of rows) {
    row = row.split(',').map((x) => x.trim())
    // prettier-ignore
    questions.push(Object.fromEntries(zip(header, row)))
  }
  console.log(questions)
  return questions
}

export function filterQuestionsByLesson(questions) {
  let validLessons = []
  const url_params = new URLSearchParams(window.location.search)
  for (const [key, val] of url_params)
    if (val === 'true') {
      validLessons.push(key)
    }
  return questions.filter((question) => validLessons.includes(question.lesson))
}

export function pickNextQuestion() {
  return questions[Math.floor(Math.random() * questions.length)]
}

export function playAudioCallback(audio_name) {
  const path = `assets/audio/${audio_name}`
  return () => {
    new Audio(path).play()
  }
}
