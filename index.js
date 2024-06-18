let displaySong = document.querySelector(".display-song")
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");
let playingDiv = document.querySelector(".playing");


let currentSong = new Audio();

function formatTime(seconds) {
    // Ensure the input is an integer
    seconds = parseInt(seconds, 10);
    
    // Calculate minutes and remaining seconds
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    
    // Pad seconds with a leading zero if needed
    if (remainingSeconds < 10) {
        remainingSeconds = '0' + remainingSeconds;
    }
    
    // Construct the minutes:seconds format
    return minutes + ':' + remainingSeconds;
}

async function getSongs(){
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as);
    let songs = [];
    for(let i = 0 ; i<as.length ; i++){
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            let a = element.href.split("/songs/")[1];
            songs.push(a.split(".")[0]);
        }
    }
    return songs;
}

const playMusic = (track,pause=false)=>{
    currentSong.src =`/songs/${track}.mp3`
    // let audio = new Audio(`/songs/${track}.mp3`);
    if(!pause){

        currentSong.play()
    }
    displaySong.innerHTML = `${track.replace("%20"," ")}`
    playingDiv.innerHTML = `<i class="fa-solid playing-btn fa-pause"></i>`
}

async function main(){
    let songs = await getSongs();
    console.log(songs);
    playMusic(songs[1],true);
    playingDiv.innerHTML = `<i class="fa-solid fa-play playing-btn"></i>`

    let songUl = document.querySelector(".songs").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><div class="left-side">
        <img src="./images/music.svg" alt="music" class="invert">
        <div class="song-name">${song.replace("%20"," ")}</div>
      </div>
      <div class="right-side">
        <div class="play-now">Play Now</div>
        <img src="./images/music1.svg" alt="music" class="invert" id="play">
      </div>
    </li>`;
    }

    Array.from(document.querySelector(".songs").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            console.log(e.querySelector(".song-name").innerHTML);
            playMusic(e.querySelector(".song-name").innerHTML)
            // document.querySelector("#play").src = `./images/pause.svg`
        })
    })

    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".song-duration").innerHTML = `${formatTime(currentSong.currentTime)} : ${formatTime(currentSong.duration)}`;
        document.querySelector(".seekcircle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".seekcircle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration*percent)/100;

    })

}   
 
main()

playingDiv.addEventListener("click", ()=>{
    if(currentSong.paused){
        currentSong.play();
        playingDiv.innerHTML = `<i class="fa-solid playing-btn fa-pause"></i>`;
    }else{
        currentSong.pause()
        playingDiv.innerHTML = `<i class="fa-solid fa-play playing-btn"></i>`

    }
})