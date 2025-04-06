import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';

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
    <div className='background'>
      <div className='background2'>
        <h1 className='title'>MEDI-DINE</h1>

        {!submitted ? (
          <div  className='form'>
            <div>
              <label className='form-label'>
                Illness: 
                <input 
                  className='form-input'
                  type="text" 
                  value={illness} 
                  onChange={(e) => setIllness(e.target.value)} 
                />
              </label>
            </div>
            <div>
              <label className='form-label'>
                Medications: 
                <input 
                  className='form-input'
                  type="text" 
                  value={medications} 
                  onChange={(e) => setMedications(e.target.value)} 
                />
              </label>
            </div>
            <div>
              <label className='form-label'>
                Allergies: 
                <input 
                  className='form-input'
                  type="text" 
                  value={allergies} 
                  onChange={(e) => setAllergies(e.target.value)} 
                />
              </label>
            </div>
            <div className='button-container'>
              <button className='button' onClick={handleSubmit}>Search Foods to Avoid</button>
              {error && <p style={{ fontSize: '12px', color: 'red' }}>{error}</p>} {/* Display error message */}
            </div>
          </div>

        ) : (
          <div>
            <div className='h2-container'>
              <h2>Top 4 Foods to <span style={{ color: '#b0200c', marginLeft: '2px'}}>AVOID</span></h2>
            </div>
            {loading ? (
              <p>Loading results...</p> // Show loading message while waiting for the response
            ) : results && results.recommendations ? (
              Object.entries(results.recommendations).map(([food, reason], index) => (
                <div key={index} className='food-card'>
                  <h3 style={{ color: '#b0200c', margin: '5px'}}>{food}</h3>
                  <p style={{ color: '#405d72', fontSize: '12', margin: '5px'}}>{reason}</p>
                </div>
              ))
            ) : (
              <p>No recommendations available.</p>
            )}
            <div className='button-container'>
              <button className='button' onClick={handleGoBack}>Go Back</button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default App;