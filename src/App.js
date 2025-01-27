import React, { useState, useEffect } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import owl from "./owl.json";
import translationMap from "./translation.js";
import './App.css';
import logo from './heading.svg';
import search from './search.svg';
import loadingfi from './loading-fi.svg';
import success_icon from './success_icon.svg';
import wizard from "./wizard.gif";
import LoadingMessage from "./Loading-message.svg";
import wwlogo from "./ww_logo.svg";

function App() {
  const [trackingId, setTrackingId] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Load suggestions from local storage on component mount
  useEffect(() => {
    const storedSuggestions = JSON.parse(localStorage.getItem("suggestions")) || [];
    setSuggestions(storedSuggestions);
  }, []);

  // Save suggestions to local storage
  const saveSuggestion = (value) => {
    const updatedSuggestions = [...suggestions, value];
    localStorage.setItem("suggestions", JSON.stringify(updatedSuggestions));
    setSuggestions(updatedSuggestions);
  };

  // Remove a suggestion from local storage
  const removeSuggestion = (value) => {
    const updatedSuggestions = suggestions.filter((suggestion) => suggestion !== value);
    localStorage.setItem("suggestions", JSON.stringify(updatedSuggestions));
    setSuggestions(updatedSuggestions);
  };

  // Handle form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await axios.post("http://localhost:5001/api/search", {
        code: trackingId,
      });

      const events = response.data.result.toString().replaceAll("'", '"');
      if (events) {
        try {
          const eventsArray = JSON.parse(events);
          const dataForDestination = JSON.parse(events);
          eventsArray.splice(0, 2);

          // Extract the country from the first array element
          const firstRow = dataForDestination[0][0];
          const destinationCountryExtracted = firstRow.split("Təyinat ölkəsi:")[1].trim();
          setDestinationCountry(destinationCountryExtracted);

          // Replace values using the translationMap
          const translatedResult = eventsArray.map((event) => {
            return event.map((item) => {
              if (item.startsWith("Çatdırılıb, alıcı:")) {
                return item.replace("Çatdırılıb, alıcı:", "Delivered. Receiver:");
              }
              return translationMap[item] || item;
            });
          });

          setResult(translatedResult);
          if (!suggestions.includes(trackingId)) {
            saveSuggestion(trackingId); // Save the successfully searched value
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (err) {
      setError("Failed to fetch the result. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <Lottie animationData={owl} style={{ height: "24px", marginBottom: "8px" }} />
        <img className="logo" src={logo} alt="logo" />
      </div>
      <div className="content">
        <form className="form" onSubmit={handleSearch}>
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter Tracking ID (e.g., RR000000000AZ)"
            required
            disabled={loading}
          />
          <button
            className="submitBtn"
            type="submit"
            disabled={loading}
            style={{
              marginLeft: "10px",
              backgroundColor: loading ? "442E9C" : "#6647E5",
              color: "#fff",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? <img className="spinner" src={loadingfi} alt="loadingfi" /> : <img src={search} alt="search" />}
          </button>
        </form>

        {/* Chips Section */}
        <div className="chips-wrapper">
          {suggestions.map((suggestion, index) => (
            <div className="chips" key={index}>
              <span onClick={() => setTrackingId(suggestion)}>{suggestion}</span>
              <button
                className="chip-close"
                onClick={() => removeSuggestion(suggestion)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path opacity="0.7" fillRule="evenodd" clipRule="evenodd" d="M3.78 0H9.56C11.82 0 13.3333 1.58667 13.3333 3.94667V9.394C13.3333 11.7473 11.82 13.3333 9.56 13.3333H3.78C1.52 13.3333 0 11.7473 0 9.394V3.94667C0 1.58667 1.52 0 3.78 0ZM8.67333 8.66667C8.9 8.44067 8.9 8.074 8.67333 7.84733L7.48667 6.66067L8.67333 5.47333C8.9 5.24733 8.9 4.874 8.67333 4.64733C8.44667 4.42 8.08 4.42 7.84667 4.64733L6.66667 5.83333L5.48 4.64733C5.24667 4.42 4.88 4.42 4.65333 4.64733C4.42667 4.874 4.42667 5.24733 4.65333 5.47333L5.84 6.66067L4.65333 7.84067C4.42667 8.074 4.42667 8.44067 4.65333 8.66667C4.76667 8.78 4.92 8.84067 5.06667 8.84067C5.22 8.84067 5.36667 8.78 5.48 8.66667L6.66667 7.48733L7.85333 8.66667C7.96667 8.78733 8.11333 8.84067 8.26 8.84067C8.41333 8.84067 8.56 8.78 8.67333 8.66667Z" fill="#9D94BD" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {loading &&
          <div className="loading-wrapper">
            <img className="wizard" src={wizard} alt="wizard" />
            <img className="loadingMessage" src={LoadingMessage} alt="Loading, Please wait!" />
          </div>
        }

        <div style={{ marginTop: "20px" }}>
          {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
          {result && (
            <div className="list-wrapper">
              <div className="destinationElemenet">
                <span>Destination to &#10168;</span><span>{destinationCountry}</span>
              </div>
              <div className="list">
                {[...result].reverse().map((row, index) => {
                  const rowData = row[2];
                  const reasonIndex = rowData.indexOf("Reason: ");

                  let beforeReason = rowData;
                  let afterReason = "";

                  if (reasonIndex !== -1) {
                    beforeReason = rowData.slice(0, reasonIndex).trim();
                    afterReason = rowData.slice(reasonIndex + "Reason: ".length).trim();
                  }

                  return (
                    <div className="listElement" key={index}
                    style={{
                      animationDelay: `${index * 0.2}s`, // Adjust delay (0.2s for smooth stagger)
                    }}>
                      <div className="elementData">
                        <div className="left-group">
                          <img src={success_icon} alt="success" />
                          <span className="secondary-text">{row[0]} &middot; {row[1].toString().replace(".", ":")}</span>
                        </div>
                        <span className="elLocation">{row[3].toString()
                          .replace("UNITED STATES OF AMERICA", "USA")
                          .replace("RUSSIAN FEDERATION", "RF")
                          .replace("UNITED ARAB EMIRATES", "UAE")
                        }</span>
                      </div>
                      <div className="elStatus">
                        <div>{beforeReason}</div>
                        {/* Displaying after "Reason: " */}
                        {afterReason && <div className="elReason">
                          <span className="secondary-text">Reason:</span>
                          {afterReason}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      </div>
      <div className="footer">
          <img className="wwlogo" src={wwlogo} alt="Wizzly Wizards" />
        </div>
    </div>
  );
}

export default App;



