// src/components/AnimatedRoutes/AnimatedRoutes.js
import React, { useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '../../pages/Home/Home';
import About from '../../pages/About/About';
import Library from '../../pages/Library/Library';
import FunFacts from '../../pages/FunFacts/FunFacts';
import SolarSystem from '../../pages/SolarSystem/SolarSystem';
import Contact from '../../pages/Contact/Contact';
import Mercury from '../../pages/Mercury/Mercury';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './AnimatedRoutes.css';

function AnimatedRoutes() {
    const location = useLocation();
    const nodeRefs = useRef({});

    const currentKey = location.pathname;
    if (!nodeRefs.current[currentKey]) {
        nodeRefs.current[currentKey] = React.createRef();
    }


    return (
        <TransitionGroup className="transition-group">
            <CSSTransition
                key={currentKey}
                nodeRef={nodeRefs.current[currentKey]}
                classNames="fade"
                timeout={1500}
                unmountOnExit
            >
                <div ref={nodeRefs.current[currentKey]}>
                    <Routes location={location}>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/about" element={<About/>}/>
                        <Route path="/library" element={<Library/>}/>
                        <Route path="/mercury" element={<Mercury/>}/>
                        <Route path="/fun-facts" element={<FunFacts/>}/>
                        <Route path="/solar-system" element={<SolarSystem/>}/>
                        <Route path="/contact" element={<Contact/>}/>
                        {/* ... inne trasy */}
                    </Routes>
                    </div>
            </CSSTransition>
        </TransitionGroup>
);
}

export default AnimatedRoutes;
