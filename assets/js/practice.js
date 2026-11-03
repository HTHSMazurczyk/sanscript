function getPracticePreferences() {
  const LESSON_KEYS = ['Letters', 'Syllables', 'Words']
  let prefs = {}

  let style = document.getElementById('practice_style').value
  if (style === 'Matching') {
    prefs.is_matching = true
  } else if (style === 'Flashcards') {
    prefs.is_matching = false
  } else {
    alert('Choose a practice style!')
    return null
  }

  for (let name of LESSON_KEYS) {
    prefs[name] = document.getElementById(name + '_check').checked
  }
  // console.log(prefs)
  return prefs
}

function hideForm() {
  document.getElementById('perfs_form').style.display = 'none'
}

function setup() {
  document.getElementById('run_btn').onclick = mainThingy
}

function mainThingy() {
  let prefs = getPracticePreferences()
  hideForm()
  // if (prefs.is_matching) {
  //   startFlashcards(prefs)
  // } else {
  //   startMatching(prefs)
  // }
}

window.onload = setup
