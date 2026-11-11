function playAudio(audio_name) {
  const path = `assets/audio/${audio_name}.mp3`
  new Audio(path).play()
}
function exFunc() {
  playAudio()
}
