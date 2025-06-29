// src/App.js
import React, {useRef} from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AnimatedRoutes from './components/AnimatedRoutes/AnimatedRoutes';
import Stardust from "./components/common/Stardust/Stardust";

function App() {
    const stardustRef = useRef();
    return (
        <Router>
            <Navbar />
            <Stardust ref={stardustRef} />
            <AnimatedRoutes stardustRef={stardustRef} />
            <Footer />
        </Router>
    );
}

export default App;
