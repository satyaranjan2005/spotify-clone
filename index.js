let displaySong = document.querySelector(".display-song")
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");
let playingDiv = document.querySelector(".playing");
let cardContainer = document.querySelector(".card-container");

let songs;
let currentFolder;

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

async function getSongs(folder){
    let songUl = document.querySelector(".songs").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";

    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    currentFolder = folder;
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for(let i = 0 ; i<as.length ; i++){
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            let a = element.href.split(`/${folder}/`)[1];
            songs.push(a.split(".")[0]);
        }
    }
    
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

    return songs;
}



const playMusic = (track,pause=false)=>{
    currentSong.src =`http://127.0.0.1:5500/${currentFolder}/${track}.mp3`
    // let audio = new Audio(`/songs/${track}.mp3`);
    if(!pause){

        currentSong.play()
    }
    displaySong.innerHTML = `${track.replace("%20"," ")}`
    playingDiv.innerHTML = `<i class="fa-solid playing-btn fa-pause"></i>`
}

async function displayAlbum(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let allas = div.getElementsByTagName("a");
    let array = Array.from(allas)
    for(let index =0; index < array.length; index++){
        const e = array[index];
        if(e.href.includes("/songs/")){
            let folder = e.href.split("/").slice(-1)[0];
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
              <img
                src="/songs/${folder}/cover.jpeg"
                alt="song"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`


        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            console.log(item.currentTarget.dataset.folder);
            songs = await getSongs(`/songs/${item.currentTarget.dataset.folder}`)
            // playMusic(songs[0])
            console.log(songs);

            playingDiv.innerHTML = `<i class="fa-solid fa-play playing-btn"></i>`;



        })
    })
}

async function main(){
    songs = await getSongs(`/songs/ncs`);
    playMusic(songs[1],true);
    playingDiv.innerHTML = `<i class="fa-solid fa-play playing-btn"></i>`

    displayAlbum();

    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".song-duration").innerHTML = `${formatTime(currentSong.currentTime)} : ${formatTime(currentSong.duration)}`;
        document.querySelector(".seekcircle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".seekcircle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration*percent)/100;

    })

    previous.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0].split(".") [0]);
        if((index-1) >= 0){
            playMusic(songs[index-1]);
        }
    })
    next.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0].split(".") [0]);
        if((index+1)< songs.length){
            playMusic(songs[index+1]);
        }
    })

    let volseek;
    document.querySelector(".volume-range").addEventListener("change",(e)=>{
        volseek = e.target.value
        currentSong.volume = parseInt(volseek)/100;
        if(volseek == 0){
            document.querySelector(".volume-btn").innerHTML =`<i class="fa-solid fa-volume-xmark playing-btns"></i>`
        } else {
            document.querySelector(".volume-btn").innerHTML = `<i class="fa-solid fa-volume-high playing-btns"></i>`
        }
    })
    document.querySelector(".volume-btn").addEventListener("click",(e)=>{
        if(currentSong.volume != 0){
            currentSong.volume = 0;
            document.querySelector(".volume-btn").innerHTML =`<i class="fa-solid fa-volume-xmark playing-btns"></i>`
            document.querySelector(".volume-range").value = 0;
        } else if(currentSong.volume == 0){
            document.querySelector(".volume-btn").innerHTML = `<i class="fa-solid fa-volume-high playing-btns"></i>`
            document.querySelector(".volume-range").value = 50;
            currentSong.volume = 0.5;
        }
    })

    // Array.from(document.getElementsByClassName("card")).forEach(e=>{
    //     e.addEventListener("click", async item=>{
    //         console.log(item.currentTarget.dataset.folder);
    //         let des = item.currentTarget.dataset.folder
    //         songs = await getSongs(`/songs/${des}`)
    //         console.log(songs);

    //         playingDiv.innerHTML = `<i class="fa-solid fa-play playing-btn"></i>`;



    //     })
    // })
    

}   
 
main()

playingDiv.addEventListener("click", ()=>{
    if(currentSong.paused){
        currentSong.play();
        playingDiv.innerHTML = `<i class="fa-solid playing-btn fa-pause"></i>`;
    } else{
        currentSong.pause()
        playingDiv.innerHTML = `<i class="fa-solid fa-play playing-btn"></i>`

    }
});

