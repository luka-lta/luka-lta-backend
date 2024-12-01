import {JSX, useEffect} from "react";
import '@/style/StarBackground.css';

export default function StarBackground(): JSX.Element {
    useEffect(() => {
        const starsContainer = document.getElementById('stars');
        const numStars = 60;

        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('div');
            star.classList.add('star');

            const size = Math.random() * 3 + 1;
            const left = Math.random() * 100;
            const delay = Math.random() * 10;
            const duration = Math.random() * 5 + 7;

            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${left}vw`;
            star.style.animationDuration = `${duration}s`;
            star.style.animationDelay = `${delay}s`;

            if (starsContainer !== null) {
                starsContainer.appendChild(star);
            }
        }
    }, []);

    return (
        <>
            <div className="stars -z-[0]" id="stars"></div>
        </>
    )
}