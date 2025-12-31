
document.addEventListener("DOMContentLoaded", () => {
  let na_ready = document.querySelector(".naa-reddy");
  let mahi = document.querySelector(".mahi-jinna");
  let rahat = document.querySelector(".mere-pass-tum");

  let audio = new Audio();

  na_ready.addEventListener("click", (e) => {
    e.preventDefault();
    audio.src = "./music/Ready-Chal-Le.mp3";
    audio.play();
  });

  mahi.addEventListener("click", (e) => {
    e.preventDefault();
    audio.src = "./music/mahi.mp3";
    audio.play();
  });

  rahat.addEventListener("click", (e) => {
    e.preventDefault();
    audio.src = "./music/rahat.mp3";
    audio.play();
  });
});

