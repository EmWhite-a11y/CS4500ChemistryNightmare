const socket = io()

let micEnabled = true;

function toggleMute() {
    micEnabled = !micEnabled;
    if (micEnabled) {
        $("#mic .fas").removeClass("fa-microphone fa-microphone-slash").addClass("fa-microphone");
    } else {
        $("#mic .fas").removeClass("fa-microphone fa-microphone-slash").addClass("fa-microphone-slash");
    }
    console.log(`Microphone ${micEnabled ? "enabled" : "disabled"}`);
}

$("#mic").on("click", function() {
    toggleMute();
});