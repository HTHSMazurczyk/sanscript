function playAudio(audio_name) {
  const path = `assets/audio/one.mp3`
  new Audio(path).play()
}
function exFunc() {
    playAudio()
}

async function mainloop(){
    while (true) {

        await new Promise((resolve, reject) => {
            k_btn.onclick = () => {
                resolve()
            }
            
        })
        console.log("Button was pressed")
        playAudio('one')
    }
}