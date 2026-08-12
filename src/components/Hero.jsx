import React from 'react';
import './Hero.css';
import LightRays from './LightRays';
import SpecularButton from './SpecularButton';
import SplitText from './SplitText';
import DepthText from './DepthText';
import TextType from './TextType';
import ShinyText from './ShinyText';

const handleAnimationComplete = () => {
    console.log('All leters have animated!');
};

const Hero = () => {
    return (
        <section className='hero'>
            <div className='hero-div'>
                <LightRays
                raysOrigin="top-center"
                raysColor="#ffffff"
                raysSpeed={1.5}
                lightSpread={1}
                rayLength={10}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0}
                distortion={0}
                className="custom-rays"
                pulsating={false}
                fadeDistance={1}
                saturation={2}
                />
                {/* <DepthText
                text="<Rayan SAMA/>"
                layers={34}
                depth={2.4}
                faceColor="#f8fafc"
                depthColor="#0000ff"
                tilt={7.5}
                pointerTracking
                smoothing={0.14}
                perspective={900}
                autoOrbit
                orbitSpeed={0.35}
                fontSize="clamp(3rem, 12vw, 7rem)"
                fontWeight={900}
                shadow
                /> */}
                {/*<SplitText
                text="<Rayan SAMA/>"
                className="text-2xl font-semibold text-center"
                delay={50}
                duration={1.25}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
                onLetterAnimationComplete={handleAnimationComplete}
                showCallback
                />*/}
                <ShinyText
                text="Rayan SAMA"
                speed={2}
                delay={0}
                color="#b5b5b5"
                shineColor="#ffffff"
                spread={120}
                direction="left"
                yoyo className='first-name'
                pauseOnHover={false}
                disabled={false}
                />
                <ShinyText
                text="SAMA"
                speed={2}
                delay={0}
                color="#b5b5b5"
                shineColor="#ffffff"
                spread={120}
                direction="left"
                yoyo
                pauseOnHover={false}
                disabled={false}
                />
                {/* <div className='name'>
                    <h1>
                        <span className='left-bra'>
                            {'<'}
                        </span>
                        Rayan &nbsp;&nbsp;SAMA
                        <span className='right-bra'>
                            {'/>'}
                        </span>
                    </h1>
                </div> */}
                <TextType
                text={["The journey of a thousand miles begins whith a single step"]}
                typingSpeed={80}
                pauseDuration={3500}
                showCursor
                cursorCharacter="_"
                // texts={["Welcome to React Bits! Good to see you!","Build some amazing experiences!"]}
                deletingSpeed={10}
                variableSpeedEnabled={false}
                variableSpeedMin={60}
                variableSpeedMax={120}
                cursorBlinkDuration={0.5}
                />
                {/* <div className='infos'>
                    <SpecularButton
                    size="lg"
                    radius={18}
                    tint="#ffffff"
                    tintOpacity={0}
                    blur={0}
                    textColor="#f5f5f5"
                    lineColor="#0000ff"
                    baseColor="#ffffff"
                    intensity={1}
                    shineSize={23}
                    shineFade={51}
                    thickness={1}
                    speed={0.35}
                    followMouse
                    proximity={250}
                    autoAnimate
                    onClick={() => console.log('clicked')}
                    >
                        Get Started
                    </SpecularButton>
                </div> */}
            </div>
        </section>
    );
}

export default Hero;
