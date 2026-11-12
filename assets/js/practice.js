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
  query = new URLSearchParams(prefs).toString()
  console.log(query)
  // redirect to appropriate page
  if (is_matching) {
    window.location.assign('matching.html?' + query)
  } else {
    window.location.assign('flashcards.html?' + query)
  }
}

async function getIdsFromCSV(name) {
  let data
  try {
    const response = await fetch(`assets/questiondata/${name}.csv`)
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
  rows.shift() // pop first row out

  let ids = []
  for (let row of rows) {
    row = row.split(',').map((x) => x.trim())
    ids.push(row[0])
  }
  return ids
}

async function checkDB() {
  for (let name of ['matching', 'flashcards']) {
    let ids = await getIdsFromCSV(name)
    let accuracies = JSON.parse(localStorage.getItem(`${name}_accuracies`))
    if (accuracies === null) {
      accuracies = {}
    }

    for (let id of ids) {
      if (id in accuracies === false) {
        accuracies[id] = [0, 0, new Date(0)] // unix time 0 => card never shown
      }
    }
    localStorage.setItem(`${name}_accuracies`, JSON.stringify(accuracies))
  }
}

window.onload = () => {
  document.getElementById('run_btn').onclick = processForm
  checkDB()
}
