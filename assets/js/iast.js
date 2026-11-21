function playAudio(id) {
  const path = `assets/audio/${id}.mp3`
  new Audio(path).play()
}
