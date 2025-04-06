import axios from 'axios';
import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [illness, setIllness] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
  const [error, setError] = useState(''); // State to store error messages

  useEffect(() => {
    axios.get('http://localhost:5000/api/hello')
      .then(response => setMessage(response.data.message))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleSubmit = () => {
    // Validate inputs
    if (!illness || !medications || !allergies) {
      setError('Please fill in all fields before submitting.');
      return; // Stop further execution if validation fails
    }

    // Clear any previous error
    setError('');
    setLoading(true); // Set loading to true before making the request

    const formData = { illness, medications, allergies };

    axios.post('http://localhost:5000/api/submit', formData)
      .then(response => {
        setResults(response.data); // Store the results from the backend
        setSubmitted(true); // Mark the form as submitted
      })
      .catch(error => {
        console.error('Error submitting data:', error);
        alert('Error submitting data. Please try again.');
      })
      .finally(() => {
        setLoading(false); // Set loading to false after the request completes
      });
  };

  const handleGoBack = () => {
    // Reset all state variables to their initial values
    setIllness('');
    setMedications('');
    setAllergies('');
    setSubmitted(false);
    setResults(null);
    setError('');
  };

  return (
    <div>
      <h1>React + Express REST API</h1>
      <p>Backend says: {message}</p>

      {!submitted ? (
        <div>
          <div>
            <label>
              Illness:
              <input 
                type="text" 
                value={illness} 
                onChange={(e) => setIllness(e.target.value)} 
              />
            </label>
          </div>
          <div>
            <label>
              Medications:
              <input 
                type="text" 
                value={medications} 
                onChange={(e) => setMedications(e.target.value)} 
              />
            </label>
          </div>
          <div>
            <label>
              Allergies:
              <input 
                type="text" 
                value={allergies} 
                onChange={(e) => setAllergies(e.target.value)} 
              />
            </label>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
          <button onClick={handleSubmit}>Check Foods</button>
        </div>
      ) : (
        <div>
          <h2>Results</h2>
          {loading ? (
            <p>Loading results...</p> // Show loading message while waiting for the response
          ) : results && results.recommendations ? (
            Object.entries(results.recommendations).map(([food, reason], index) => (
              <div key={index} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                <h3>{food}</h3>
                <p>{reason}</p>
              </div>
            ))
          ) : (
            <p>No recommendations available.</p>
          )}
          <button onClick={handleGoBack}>Go Back</button>
        </div>
      )}
    </div>
  );
}

export default App;