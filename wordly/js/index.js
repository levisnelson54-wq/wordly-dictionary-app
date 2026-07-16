// =======================================
// WORDLY DICTIONARY SPA
// =======================================

// DOM ELEMENTS
const searchForm = document.getElementById("search-form");
const wordInput = document.getElementById("word-input");

const wordTitle = document.getElementById("word");
const phonetic = document.getElementById("phonetic");
const meanings = document.getElementById("meanings");

const playAudioBtn = document.getElementById("play-audio");
const audio = document.getElementById("audio");

const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");

const sourceLink = document.getElementById("source-link");

const favoriteBtn = document.getElementById("favorite-btn");
const favoritesContainer = document.getElementById("favorites-container");

const resultsSection = document.querySelector(".results-section");

// =======================================
// SEARCH FORM EVENT
// =======================================

searchForm.addEventListener("submit", handleSearch);

function handleSearch(event) {

    event.preventDefault();

    const word = wordInput.value.trim().toLowerCase();

    if (word === "") {
        showError("Please enter a word.");
        return;
    }

    clearError();

    fetchWord(word);

}

// =======================================
// FETCH WORD
// =======================================

async function fetchWord(word) {

    setLoading(true);

    try {

        const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        );

        if (!response.ok) {
            throw new Error();
        }

        const data = await response.json();

        clearError();

        displayWord(data[0]);

        wordInput.value = "";

        resultsSection.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        showError("We could not find that word. Check the spelling and try again.");

    } finally {

        setLoading(false);

    }

}

// =======================================
// HELPER FUNCTIONS
// =======================================

function setLoading(isLoading) {

    if (isLoading) {

        loadingMessage.classList.remove("hidden");

    } else {

        loadingMessage.classList.add("hidden");

    }

}

function showError(message) {

    errorMessage.textContent = message;

}

function clearError() {

    errorMessage.textContent = "";

}

// =======================================
// GET AUDIO URL
// =======================================

function getAudioUrl(phonetics) {

    if (!phonetics) return "";

    const audioObject = phonetics.find(item => item.audio);

    return audioObject ? audioObject.audio : "";

}

// =======================================
// DISPLAY WORD
// =======================================

function displayWord(data) {

    wordTitle.textContent = data.word;

    phonetic.textContent =
        data.phonetic ||
        data.phonetics.find(item => item.text)?.text ||
        "Pronunciation unavailable.";

    meanings.innerHTML = "";

    data.meanings.forEach(function (meaning) {

        const card = document.createElement("div");

        card.style.marginBottom = "20px";

        let html = `
            <h3>${meaning.partOfSpeech}</h3>
        `;

        meaning.definitions.forEach(function (definition) {

            html += `
                <p><strong>Definition:</strong> ${definition.definition}</p>
            `;

            if (definition.example) {

                html += `
                    <p><strong>Example:</strong> ${definition.example}</p>
                `;

            }

            if (definition.synonyms.length > 0) {

                html += `
                    <p><strong>Synonyms:</strong> ${definition.synonyms.join(", ")}</p>
                `;

            }

        });

        card.innerHTML = html;

        meanings.appendChild(card);

    });

    // Audio
    const audioUrl = getAudioUrl(data.phonetics);

    if (audioUrl) {

        audio.src = audioUrl;

        playAudioBtn.classList.remove("hidden");

    } else {

        playAudioBtn.classList.add("hidden");

    }

    // Source Link
    if (data.sourceUrls && data.sourceUrls.length > 0) {

        sourceLink.href = data.sourceUrls[0];
        sourceLink.textContent = "📖 View Dictionary Source";
        sourceLink.classList.remove("hidden");

    } else {

        sourceLink.classList.add("hidden");

    }

}

// =======================================
// PLAY AUDIO
// =======================================

playAudioBtn.addEventListener("click", function () {

    if (audio.src) {

        audio.play().catch(() => {

            showError("Unable to play pronunciation.");

        });

    }

});