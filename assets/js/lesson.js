function playAudio(audio_name) {
  const path = `assets/audio/${audio_name}.mp3`
  new Audio(path).play()
}

function showBhartuh() {
  document.getElementById('bhartuhAnswer').style.display = 'block'
  document.getElementById('please').style.display = 'block'

  console.log('its working')
}

function showVarsa() {
  document.getElementById('varsaAnswer').style.display = 'block'
}

function showGurusukra() {
  document.getElementById('gurusukAnswer').style.display = 'block'
}

window.onload = () => {
  let apostrophe = document.querySelector("button[onclick*='apostrophe']")
  apostrophe.classList.add('disabled')
  apostrophe.parentElement.title = 'Breath mark makes no sound'
}
