console.log("🐺 WOLF X Started");

function sendMessage() {

    let input = document.getElementById("message");
    let chat = document.getElementById("chatBox");

    if (input.value.trim() === "") {
        alert("لطفاً یک پیام وارد کنید.");
        return;
    }

    let message = document.createElement("p");
    message.innerHTML = "🧑 شما: " + input.value;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;

    input.value = "";
}
