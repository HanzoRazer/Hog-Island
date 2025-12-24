import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PracticeRange from "./components/game/PracticeRange";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PracticeRange />} />
          <Route path="/practice" element={<PracticeRange />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
