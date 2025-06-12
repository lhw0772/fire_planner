import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import './index.css';

function App() {
  return (
    <div className="App">
      <Home />
      <Analytics />
    </div>
  );
}

export default App; 