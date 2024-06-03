import { React, useState, useEffect } from "react";
import Axios from "axios";
import "./App.css";
import { FaSearch } from "react-icons/fa";
import { FcSpeaker } from "react-icons/fc";
import { MdDarkMode } from "react-icons/md";
// import { MDBFooter } from "mdb-react-ui-kit";

function App() {
  // Setting up the initial states using react hook 'useState'
  const [data, setData] = useState("");
  const [searchWord, setSearchWord] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Function to toggle dark mode
  // Takes the previous state and negates it
  // Updates the isDarkMode state
  // Syntax: setState((prevState) => newState)
  // In this case, newState is the negation of prevState
  const handleToggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Function to fetch information on button
  // click, and set the data accordingly
  function getMeaning() {
    if (searchWord.trim() !== "") {
      Axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en_US/${searchWord}`
      )
        .then((response) => {
          setData(response.data[0]);
          setShowAlert(false);
        })
        .catch((error) => {
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
        <button onClick={handleToggleDarkMode} className="toggle-theme-btn">
          {isDarkMode ? <MdDarkMode /> : <MdDarkMode />}
        </button>
      </div>
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
              Mohon isi kata yang ingin dicari Atau Isi Dengan Benar
            </p>
          </div>
        )}
      </div>
      {data && (
        <div className="showResults">
          <h2>
            {data.word}{" "}
            <button
              onClick={() => {
                playAudio();
              }}
            >
              <FcSpeaker size="22px" />
            </button>
          </h2>
          <h3>Parts of speech:</h3>

          <p>{data.meanings[0].partOfSpeech}</p>

          <h3>Definition:</h3>

          <p>{data.meanings[0].definitions[0].definition}</p>

          <h3>Example:</h3>

          <p>{data.meanings[0].definitions[0].example || "Tidak ada contoh"}</p>
        </div>
      )}
      <div className="footer" >
        © 2024 Copyright:
        <a style={{ color: isDarkMode ? 'white' : 'black', fontSize:'17px', textDecoration:'none' }} href="https://github.com/AlpianPPLG"> Alpian</a>
      </div>

    </div>
  );
}

export default App;
