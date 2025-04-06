import axios from 'axios';
import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [illness, setIllness] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/hello')
      .then(response => setMessage(response.data.message))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleSubmit = () => {
    // Store the input values for later use
    const formData = {
      illness,
      medications,
      allergies,
    };

    console.log('Submitted Data:', formData);

    // You can also send this data to a backend API if needed
    // axios.post('http://localhost:5000/api/submit', formData)
    //   .then(response => console.log('Data submitted successfully:', response))
    //   .catch(error => console.error('Error submitting data:', error));
    axios.post('http://localhost:5000/api/submit', formData)
    .then(response => {
      console.log('Data submitted successfully:', response.data);
      alert('Data submitted successfully!');
    })
    .catch(error => {
      console.error('Error submitting data:', error);
      alert('Error submitting data. Please try again.');
    });
  };

  return (
    <div>
      <h1>React + Express REST API</h1>
      <p>Backend says: {message}</p>
      
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
      <button onClick={handleSubmit}>Check Foods</button>
    </div>
  );
}

export default App;
