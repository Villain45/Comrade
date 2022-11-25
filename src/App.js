import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import EditorPage from "./pages/EditorPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
    <div>
      <Toaster position="top-center"/>
    </div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/codeEditor/:roomId" element={<EditorPage />}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
