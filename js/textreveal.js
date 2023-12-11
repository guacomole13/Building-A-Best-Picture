function showNextLine() {
    var firstLine = document.getElementById("1");
    var secondLine = document.getElementById("2");
    var thirdLine = document.getElementById("3");
    var fourthLine = document.getElementById("4");
    var fifthLine = document.getElementById("5");
    var sixthLine = document.getElementById("6");
    var button = document.getElementById("showbtn");
    var resetbutton = document.getElementById("resetbtn");

    resetbutton.style.display = "none"
    if (firstLine.style.display !== "none" && thirdLine.style.display !== "block") {
        // firstLine.style.display = "none";
        // secondLine.style.display = "none";
        thirdLine.style.display = "block";
        fourthLine.style.display = "block";
    }
    else if (firstLine.style.display !== "none" && thirdLine.style.display !== "none" && fifthLine.style.display !== "block") {
        // thirdLine.style.display = "none";
        // fourthLine.style.display = "none";
        fifthLine.style.display = "block";
        sixthLine.style.display = "block";
        button.style.display = "none"
        resetbutton.style.display = "inline"
    }
    else if (firstLine.style.display !== "none" && thirdLine.style.display !== "none" && thirdLine.style.display !== "none") {
        thirdLine.style.display = "none";
        fourthLine.style.display = "none";
        fifthLine.style.display = "none";
        sixthLine.style.display = "none";
        button.style.display = "inline"
    }

    // else if (firstLine.style.display == "none" && thirdLine.style.display == "none") {
    //     firstLine.style.display = "block";
    //     secondLine.style.display = "block";
    //     thirdLine.style.display = "block";
    //     fourthLine.style.display = "block";
    //     fifthLine.style.display = "block";
    //     sixthLine.style.display = "block";
    //
    // }
}