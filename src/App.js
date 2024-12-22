import { useState, useEffect } from "react";
import Axios from "axios";
import "./App.css";
import { FaSearch } from "react-icons/fa";
import { FcSpeaker } from "react-icons/fc";
import { MdDarkMode } from "react-icons/md";
import { BiCopy } from "react-icons/bi"; // Ikon untuk salin
import { RiRefreshLine } from "react-icons/ri"; // Ikon untuk reset

function App() {
  const [data, setData] = useState("");
  const [searchWord, setSearchWord] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [error, setError] = useState("");
  const [showInstructions, setShowInstructions] = useState(false); // State untuk petunjuk penggunaan

  // Toggle dark mode with transition effect
  const handleToggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
    document.body.classList.toggle("dark-mode-transition");
  };

  // Fetch suggestions for autocomplete
  useEffect(() => {
    if (searchWord.trim()) {
      Axios.get(`https://api.datamuse.com/words?sp=${searchWord}*`)
        .then((response) => {
          setSuggestions(response.data.slice(0, 5).map((word) => word.word));
        })
        .catch((error) => {
          console.error("Error fetching suggestions:", error);
        });
    } else {
      setSuggestions([]);
    }
  }, [searchWord]);

  // Fetch meaning, synonyms, and antonyms of the word
  function getMeaning(word) {
    const searchQuery = word || searchWord;
    if (searchQuery.trim() !== "") {
      Axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en_US/${searchQuery}`
      )
        .then((response) => {
          setData(response.data[0]);
          setShowAlert(false);
          setSuggestions([]);
          setError("");

          // Add search query to history if not already in it
          if (!searchHistory.includes(searchQuery)) {
            setSearchHistory((prevHistory) => [...prevHistory, searchQuery]);
          }

          // Fetch synonyms and antonyms
          fetchSynonymsAndAntonyms(searchQuery);
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            setShowAlert(true);
            setError("Kata tidak ditemukan, coba lagi.");
          }
        });
    } else {
      setShowAlert(true);
      setError("Mohon isi kata yang ingin dicari atau isi dengan benar");
    }
  }

  // Fetch synonyms and antonyms
  function fetchSynonymsAndAntonyms(word) {
    Axios.get(`https://api.datamuse.com/synonyms?rel_syn=${word}`)
      .then((response) => {
        setData((prevData) => ({
          ...prevData,
          synonyms: response.data.map((syn) => syn.word),
        }));
      })
      .catch((error) => {
        console.error("Error fetching synonyms:", error);
      });

    Axios.get(`https://api.datamuse.com/words?rel_ant=${word}`)
      .then((response) => {
        setData((prevData) => ({
          ...prevData,
          antonyms: response.data.map((ant) => ant.word),
        }));
      })
      .catch((error) => {
        console.error("Error fetching antonyms:", error);
      });
  }

  // Play audio pronunciation
  function playAudio() {
    if (data && data.phonetics[0]) {
      let audio = new Audio(data.phonetics[0].audio);
      audio.play();
    }
  }

  // Handle Enter key press
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      getMeaning();
    }
  }

  // Copy definition to clipboard
  function copyDefinition() {
    if (data && data.meanings[0].definitions[0].definition) {
      navigator.clipboard.writeText(data.meanings[0].definitions[0].definition);
      alert("Definisi disalin ke clipboard!");
    }
  }

  // Reset search
  function resetSearch() {
    setSearchWord("");
    setData("");
    setSuggestions([]);
  }

  useEffect(() => {
    document.addEventListener("keypress", handleKeyPress);
    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  return (
    <div className={isDarkMode ? "dark-mode" : ""}>
      <h1
        className={isDarkMode ? "dark-mode" : ""}
        onClick={() => {
          window.location.reload();
        }}
      >
        Web Kamus Bahasa Inggris
      </h1>
      <div className="searchBox">
        <input
          type="text"
          placeholder="Cari Disini"
          style={{ marginTop: "10px" }}
          onChange={(e) => setSearchWord(e.target.value)}
          value={searchWord}
        />
        <button onClick={() => getMeaning()}>
          <FaSearch size="20px" />
        </button>
        <button onClick={resetSearch} className="reset-btn">
          <RiRefreshLine size="20px" />
        </button>
        <button onClick={handleToggleDarkMode} className="toggle-theme-btn">
          <MdDarkMode />
        </button>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="instructions-btn"
        >
          ?
        </button>
      </div>

      {/* Petunjuk Penggunaan */}
      {showInstructions && (
        <div className="instructions-box">
          <h3>Petunjuk Penggunaan:</h3>
          <p>1. Ketikkan kata yang ingin dicari di kolom pencarian.</p>
          <p>2. Klik tombol pencarian atau tekan Enter.</p>
          <p>3. Klik pada kata di riwayat pencarian untuk melihat definisi.</p>
          <p>4. Klik ikon speaker untuk mendengarkan pengucapan.</p>
          <p>5. Klik ikon salin untuk menyalin definisi ke clipboard.</p>
          <button onClick={() => setShowInstructions(false)}>Tutup</button>
        </div>
      )}

      {/* Autocomplete Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions-box">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => getMeaning(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Button to open search history modal */}
      <button className="history-btn" onClick={() => setShowHistoryModal(true)}>
        Riwayat Pencarian
      </button>

      {/* Search History Modal */}
      {showHistoryModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowHistoryModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Riwayat Pencarian:</h3>
            <ul>
              {searchHistory.map((item, index) => (
                <li
                  key={index}
                  className="history-item"
                  onClick={() => getMeaning(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
            <button
              className="close-modal-btn"
              onClick={() => setShowHistoryModal(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "25px",
          position: "relative",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        {showAlert && (
          <div
            style={{
              color: "red",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <p
              style={{
                fontSize: "calc(0.4vw + 10px)",
                textAlign: "center",
                marginTop: "30px",
              }}
            >
              {error}
            </p>
          </div>
        )}
      </div>

      {data && (
        <div className="showResults">
          <h2>
            {data.word}{" "}
            <button onClick={playAudio}>
              <FcSpeaker size="22px" />
            </button>{" "}
            <button onClick={copyDefinition}>
              <BiCopy size="22px" />
            </button>
          </h2>
          <h3>Definisi:</h3>
          <p>{data.meanings[0].definitions[0].definition}</p>
          <h3>Contoh:</h3>
          <p>{data.meanings[0].definitions[0].example || "Tidak ada contoh"}</p>
          <h3>Sinonim:</h3>
          <p>
            {data.synonyms ? data.synonyms.join(", ") : "Tidak ada sinonim"}
          </p>
          <h3>Antonim:</h3>
          <p>
            {data.antonyms ? data.antonyms.join(", ") : "Tidak ada antonim"}
          </p>
          <h3>Penjelasan Singkat:</h3>
          <p>
            {data.meanings[0].definitions[0].definition ||
              "Tidak ada penjelasan"}
          </p>
        </div>
      )}

      <div className="footer">
        &copy; 2024 Copyright:
        <a
          style={{
            color: isDarkMode ? "white" : "black",
            fontSize: "17px",
            textDecoration: "none",
          }}
          href="https://github.com/AlpianPPLG"
        >
          {" "}
          Alpian
        </a>
      </div>
    </div>
  );
}

export default App;
