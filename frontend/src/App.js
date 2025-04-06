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
    </div>
  );
}

export default App;
