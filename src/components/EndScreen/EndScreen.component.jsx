import styles from '../ReactQuiz.module.css'
function EndScreen({ dispatch, points, totalQuestions, index, rightAnswers }) {
    const totalPoints = totalQuestions.reduce((accumulator, currentValue) => accumulator + currentValue.points, 0)
    console.log(typeof index)
    return (
        <div className={styles.end_screen}>
            <h1 className={styles.end_screen_title}>game has ended</h1>
            <p>you attempted {index + 1} questions and your total right {rightAnswers} questions and total wrong {totalQuestions.length - rightAnswers} questions</p>
            <span><strong>Total Score:</strong> {points} Points / {totalPoints} Points</span>
            <button onClick={() => dispatch({ type: "restartGame" })} className={styles.button}>Start Over</button>
        </div>
    );
}

export default EndScreen;