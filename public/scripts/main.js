// Meme animation
const myImage = document.querySelector("img");
myImage.onclick = () => {
    const mySrc =myImage.getAttribute("src");
    if (mySrc === "images/my-meme2.jpg"){
        myImage.setAttribute("src", "images/my-meme.jpg");
    } else {
        myImage.setAttribute("src", "images/my-meme2.jpg");
    }
};

// Change temporal user button
let myButton = document.querySelector("button.button-user#change-user");
let myHeading = document.querySelector("h1");

function setUserName() {
    const myName = prompt("Введіть назву користувача: ");
    if (!myName) {
        setUserName();
    } else {
        localStorage.setItem("name", myName);
        myHeading.textContent = `Дуже приємно познайомитись, ${myName} :)`; 
    }
}

if (!localStorage.getItem("name")) {
    setUserName();
} else {
    const storedName = localStorage.getItem("name");
    myHeading.textContent = `Вітаємо знову, ${storedName} :3`;
}

myButton.onclick = () => {
    setUserName();
}

//navbar scrolling
var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        document.querySelector(".navbar").style.top = "0";
    } else {
        document.querySelector(".navbar").style.top = "-500px";
    }
    prevScrollpos = currentScrollPos;
}