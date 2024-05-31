import { React, useState, useEffect } from "react";
import Axios from "axios";
import "./App.css";
import { FaSearch } from "react-icons/fa";
import { FcSpeaker } from "react-icons/fc";
import { MdDarkMode } from "react-icons/md";

function App() {
  // Setting up the initial states using react hook 'useState'

  const [data, setData] = useState("");
  const [searchWord, setSearchWord] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Function to fetch information on button
  // click, and set the data accordingly
  function getMeaning() {
    if (searchWord.trim() !== "") {
      Axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en_US/${searchWord}`
      ).then((response) => {
        setData(response.data[0]);
        setShowAlert(false);
      }).catch((error) => {
        if (error.response && error.response.status === 404) {
          setShowAlert(true);
        }
      });
    } else {
      setShowAlert(true);
    }
  }

  // Function to play and listen the
  // phonetics of the searched word
  function playAudio() {
    let audio = new Audio(data.phonetics[0].audio);
    audio.play();
  }

  // Function to handle key press
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      getMeaning();
    }
  }

  useEffect(() => {
    // Add event listener for key press
    document.addEventListener("keypress", handleKeyPress);

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  return (
    <div className={isDarkMode ? "App dark-mode" : "App"}>
      <h1  onClick={() => {window.location.reload();}} >Web Kamus Bahasa Inggris</h1>
      <div className="searchBox">
        <input
          type="text"
          placeholder="Cari Disini"
          style={{ marginTop: "10px" }}
          onChange={(e) => {
            setSearchWord(e.target.value);
          }}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={() => {
            getMeaning();
          }}
        >
          <FaSearch size="20px" />
        </button>
        <button
          onClick={handleToggleDarkMode}
          className="toggle-theme-btn"
        >
          {isDarkMode ? <MdDarkMode /> : <MdDarkMode />}
        </button>
      </div>
      {showAlert && <p style={{ color: "red" }}>Mohon isi kata yang ingin dicari Atau Isi Dengan Benar</p>}
      {data && (
        <div className="showResults">
          <h2>
            {data.word}{" "}
            <button
              onClick={() => {
                playAudio();
              }}
            >
              <FcSpeaker size="26px" />
            </button>
          </h2>
          <h4>Parts of speech:</h4>

          <p>{data.meanings[0].partOfSpeech}</p>

          <h4>Definition:</h4>

          <p>{data.meanings[0].definitions[0].definition}</p>

          <h4>Example:</h4>

          <p>{data.meanings[0].definitions[0].example || "Tidak ada contoh"}</p>
        </div>
      )}
    </div>
  );
}

export default App;
