const chatDiv = document.getElementById("chat");
const micBtn  = document.getElementById("micBtn");
const orbContainer = document.querySelector(".orb-container");
let audio; // Will hold the single Audio element

// Check browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert("Sorry, your browser doesn't support speech recognition. Please try Chrome or Safari.");
}

const recog = new SpeechRecognition();
recog.lang = "en-US";
recog.interimResults = false;

micBtn.onclick = () => {
  if (!audio) {
    // Create the Audio object on the first user tap to satisfy mobile browser restrictions.
    audio = new Audio();
  }
  micBtn.disabled = true;
  orbContainer.classList.add("listening");
  micBtn.textContent = "...";
  recog.start();
};

recog.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  append("user", transcript);

  // Stop the 'listening' pulse and show a 'thinking' state
  orbContainer.classList.remove("listening");
  micBtn.textContent = "⏳";

  try {
    const response = await fetch("https://one00x-blxn.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: transcript }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    const reply = data.reply;
    append("assist", reply);
    await speak(reply);
  } catch (err) {
    console.error(err);
    append("assist", "Sorry, something went wrong. Please try again.");
  } finally {
    // IMPORTANT: Reset the UI only after everything is done.
    micBtn.disabled = false;
    micBtn.textContent = "🎙️";
  }
};

recog.onerror = (e) => {
  console.error(e);
  orbContainer.classList.remove("listening");
  micBtn.textContent = "🎙️";
  micBtn.disabled = false;
};

function append(role, text) {
  const p = document.createElement("p");
  p.className = role === "user" ? "user" : "assist";
  p.textContent = text;
  const chatContainer = document.getElementById("chat-container");
  chatDiv.appendChild(p);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function speak(text) {
  try {
    const res = await fetch("https://one00x-blxn.onrender.com/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error(await res.text());

    const arrayBuffer = await res.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    
    // Re-use the audio element created on the initial click.
    audio.src = url;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Audio playback failed:", error);
        // If playback fails, fall back to the browser's own speech synthesis.
        if ("speechSynthesis" in window) {
          const utter = new SpeechSynthesisUtterance("I'm sorry, I couldn't play that audio. Please check your browser's autoplay settings.");
          speechSynthesis.speak(utter);
        }
      });
    }
  } catch (err) {
    console.error("TTS error, falling back to SpeechSynthesis", err);
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      speechSynthesis.speak(utter);
    }
  }
} 