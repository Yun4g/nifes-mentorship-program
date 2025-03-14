import React from 'react';
import Navbar from './homecomponents/Navbar'
import Hero from './homecomponents/Hero';
import Footer from './homecomponents/Footer';
import AfterHero from './homecomponents/AfterHero';

function LandingPage() {
    return (
        <div className=''>
            <Navbar/>
            <Hero/>
            <AfterHero/>
            <Footer/>
        </div>
    );
}

export default LandingPage;