console.log("lets write js");
let currentSong = new Audio;
let songs
let currFolder
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }



    //  show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Sharath</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs
}
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/"+track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1]
            // get the metadata of the folder 
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder= "${folder}" class="card">
                        <div  class="play">
                            <svg data-encore-id="icon" role="img" aria-hidden="true" class="e-9960-icon e-9960-baseline"
                                viewBox="0 0 24 24" style="width: 25px;">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606">
                                </path>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div>`
        }
    }

    // load the playlist when ever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}

async function main() {
    // get the list of the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true) // removed autoplay to avoid browser error

    // Display all the albums on the page
    await displayAlbums()


    // attach an event listener to play next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // listen to the time update event 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} /${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%'
    })

    // add an Event Listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // add an event listener for hamburgur
    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".left .close").style.display = "block";
        document.querySelector(".hamburger").style.display = "none";
    })

    // add an event listener to close button
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-110%"
        document.querySelector(".left .close").style.display = "none";
        document.querySelector(".hamburger").style.display = "block";
    })


    // add an event listener to previous and next
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("previous clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index + 1])
        }

    })
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("next clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // add an event to voulme
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
             document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("img/mute.svg" ,"img/volume.svg")
        }
    })

    // add event listener to mute the track 
    document.querySelector(".volume > img").addEventListener("click",e=>{
        console.log(e.target);
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg" ,"img/mute.svg")
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
             e.target.src = e.target.src.replace("img/mute.svg" ,"img/volume.svg")
            currentSong.volume =0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value=10
        }
        
    })


}
main()
