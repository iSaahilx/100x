const chatDiv = document.getElementById("chat");
const micBtn  = document.getElementById("micBtn");

// Check browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert("Sorry, your browser doesn't support speech recognition. Please try Chrome or Safari.");
}

const recog = new SpeechRecognition();
recog.lang = "en-US";
recog.interimResults = false;

micBtn.onclick = () => {
  micBtn.disabled = true;
  micBtn.textContent = "🎙️ Listening…";
  recog.start();
};

recog.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  append("user", transcript);

  micBtn.textContent = "⏳ Waiting…";

  try {
    const response = await fetch("http://localhost:8080/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: transcript }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    const reply = data.reply;
    append("assist", reply);
    speak(reply);
  } catch (err) {
    console.error(err);
    append("assist", "Sorry, something went wrong. Please try again.");
  }

  micBtn.textContent = "🎙️ Speak";
  micBtn.disabled = false;
};

recog.onerror = (e) => {
  console.error(e);
  micBtn.textContent = "🎙️ Speak";
  micBtn.disabled = false;
};

function append(role, text) {
  const p = document.createElement("p");
  p.className = role === "user" ? "user" : "assist";
  p.textContent = text;
  chatDiv.appendChild(p);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return; // unsupported
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  speechSynthesis.speak(utter);
} 