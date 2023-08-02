import { useEffect } from "react";
import styles from '../ReactQuiz.module.css'

function Timer({ remainingTime, dispatch }) {
    useEffect(function () {
        const timer = setInterval(() => dispatch({ type: "tick" }), 1000)
        return () => clearInterval(timer)
    }, [dispatch])

    return (
        <div className={styles.timer}>
            {remainingTime}
        </div>
    );
}

export default Timer;