import { AccuracyDB } from './common.js'

function getPracticePreferences() {
  const LESSON_KEYS = ['Letters', 'Syllables', 'Words']
  let prefs = {}

  let style = document.getElementById('practice_style').value
  if (style === 'Matching') {
    prefs.is_matching = true
  } else if (style === 'Flashcards') {
    prefs.is_matching = false
  } else {
    return null
  }

  for (let name of LESSON_KEYS) {
    prefs[name] = document.getElementById(name + '_check').checked
  }
  // console.log(prefs)
  return prefs
}

function processForm() {
  let prefs = getPracticePreferences()
  if (prefs === null) {
    alert('Choose a practice style!')
    return
  }
  let isAnyUnitSelected = Object.values(prefs).some((x) => x)
  if (!isAnyUnitSelected) {
    alert('Choose at least one lesson!')
    return
  }

  let is_matching = prefs.is_matching
  // encode the preferences into the url
  delete prefs.is_matching
  let query = new URLSearchParams(prefs).toString()
  console.log(query)
  // redirect to appropriate page
  if (is_matching) {
    window.location.assign('matching.html?' + query)
  } else {
    window.location.assign('flashcards.html?' + query)
  }
}

window.onload = async () => {
  let btn_pressed = false
  document.getElementById('run_btn').onclick = () => {
    alert('checking question database! please hold')
    btn_pressed = true
  }
  let checks = [new AccuracyDB('matching').checkDB(), new AccuracyDB('flashcards').checkDB()]
  Promise.all(checks).then(() => {
    if (btn_pressed) {
      processForm() // button was pressed while checking
    }
    document.getElementById('run_btn').onclick = processForm
  })
}
