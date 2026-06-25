import { useState, useEffect } from 'react'
import APIForm from './components/APIForm'
import Gallery from './components/Gallery'
import './App.css'

const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

function App() {
  const [inputs, setInputs] = useState({
    url: "",
    format: "",
    no_ads: "",
    no_cookie_banners: "",
    width: "",
    height: "",
  });

  // The screenshot returned by the most recent successful query
  const [currentImage, setCurrentImage] = useState("");
  // Every screenshot the user has queried so far
  const [prevImages, setPrevImages] = useState([]);
  // Stretch: our remaining ApiFlash queries for the month
  const [quota, setQuota] = useState(null);

  // Check our quota once when the app loads.
  useEffect(() => {
    getQuota();
  }, []);

  // Handles the form submission: fills in defaults, validates, then queries.
  const submitForm = () => {
    let defaultValues = {
      format: "jpeg",
      no_ads: "true",
      no_cookie_banners: "true",
      width: "1920",
      height: "1080",
    };

    if (inputs.url === "") {
      alert("Please enter a URL before taking a screenshot!");
    } else {
      const updatedInputs = { ...inputs };
      for (const [key, value] of Object.entries(inputs)) {
        if (value === "") {
          updatedInputs[key] = defaultValues[key];
        }
      }
      setInputs(updatedInputs);
      // Pass the resolved inputs straight through: setInputs is async, so
      // `inputs` in this closure is still the old (pre-default) values.
      makeQuery(updatedInputs);
    }
  };

  // Assembles the full ApiFlash query string and kicks off the API call.
  const makeQuery = (activeInputs) => {
    let wait_until = "network_idle";
    let response_type = "json";
    let fail_on_status = "400%2C404%2C500-511";
    let url_starter = "https://";
    let fullURL = url_starter + activeInputs.url;

    let query = `https://api.apiflash.com/v1/urltoimage?access_key=${ACCESS_KEY}&url=${fullURL}&format=${activeInputs.format}&width=${activeInputs.width}&height=${activeInputs.height}&no_cookie_banners=${activeInputs.no_cookie_banners}&no_ads=${activeInputs.no_ads}&wait_until=${wait_until}&response_type=${response_type}&fail_on_status=${fail_on_status}`;

    callAPI(query).catch(console.error);
  };

  // Makes the actual API call and stores the resulting screenshot.
  const callAPI = async (query) => {
    const response = await fetch(query);
    const json = await response.json();
    // console.log(json);

    if (!json.url) {
      alert(
        "Sorry, a screenshot couldn't be taken with those inputs. Double-check your URL and try again!"
      );
    } else {
      setCurrentImage(json.url);
      setPrevImages((images) => [...images, json.url]);
      reset();
      getQuota();
    }
  };

  // Clears the form after a successful query.
  const reset = () => {
    setInputs({
      url: "",
      format: "",
      no_ads: "",
      no_cookie_banners: "",
      width: "",
      height: "",
    });
  };

  // Stretch: asks ApiFlash how many queries we have left this month.
  const getQuota = async () => {
    const response = await fetch(
      `https://api.apiflash.com/v1/urltoimage/quota?access_key=${ACCESS_KEY}`
    );
    const json = await response.json();
    setQuota(json);
  };

  return (
    <div className="whole-page">
      {quota && (
        <p className="quota">
          Queries left: {quota.remaining} / {quota.limit}
        </p>
      )}

      <h1>Build Your Own Screenshot! 📸</h1>

      <APIForm
        inputs={inputs}
        handleChange={(e) =>
          setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value.trim(),
          }))
        }
        onSubmit={submitForm}
      />
      <br></br>

      {currentImage ? (
        <img
          className="screenshot"
          src={currentImage}
          alt="Screenshot returned"
        />
      ) : (
        <div> </div>
      )}

      <div className="container">
        <h3> Current Query Status: </h3>
        <p>
          https://api.apiflash.com/v1/urltoimage?access_key=ACCESS_KEY
          <br></br>
          &url={inputs.url} <br></br>
          &format={inputs.format} <br></br>
          &width={inputs.width}
          <br></br>
          &height={inputs.height}
          <br></br>
          &no_cookie_banners={inputs.no_cookie_banners}
          <br></br>
          &no_ads={inputs.no_ads}
          <br></br>
        </p>
      </div>

      <br></br>

      <div className="container">
        <Gallery images={prevImages} />
      </div>
    </div>
  );
}

export default App
