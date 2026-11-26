function playAudio(id) {
  const path = `assets/audio/${id}.mp3`
  new Audio(path).play()
}

window.onload = () => {
  let apostrophe = document.querySelector("button[onclick*='apostrophe']")
  apostrophe.classList.add('disabled')
  apostrophe.parentElement.title = 'Breath mark makes no sound'
}
