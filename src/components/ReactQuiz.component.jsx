import Styles from "./ReactQuiz.module.css"
import { useEffect, useReducer } from "react";

import LoadingSpinner from "./LoadingSpinner/LoadingSpinner.component"
import ErrorBox from "./ErrorBox/ErrorBox.component"
import EndScreen from "./EndScreen/EndScreen.component";
import Timer from "./TimerClock/Timer.component";

const initialState = {
    questions: [],
    status: 'loading',
    index: 0,
    userAnswer: null,
    points: 0,
    rightAnswers: 0,
    remainingTime: 300
}

function reducer(state, action) {
    switch (action.type) {
        case 'dataRecieved':
            return { ...state, questions: action.payload, status: 'Data Ready' }
        case 'dataFailed':
            return { ...state, status: 'Fetch Failed' }
        case 'gameStart':
            return { ...state, status: 'Game Started' }
        case 'userAnswer':
            const question = state.questions.at(state.index)
            return { ...state, userAnswer: action.payload, points: action.payload === question.correctOption ? state.points + question.points : state.points, rightAnswers: action.payload === question.correctOption ? state.rightAnswers + 1 : state.rightAnswers }
        case 'nextQuestion':
            return { ...state, index: state.index + 1, userAnswer: null }
        case 'restartGame':
            return { ...state, index: 0, userAnswer: null, status: "Data Ready", remainingTime: initialState.remainingTime }
        case 'finished':
            return { ...state, userAnswer: null, status: "finished" }
        case 'tick':
            return { ...state, remainingTime: state.remainingTime - 1, status: state.remainingTime === 0 ? "finished" : state.status }
        default: throw new Error("uknown error")
    }
}

function ReactQuiz() {

    const [state, dispatch] = useReducer(reducer, initialState)
    const { rightAnswers, questions, status, index, userAnswer, points, remainingTime } = state

    useEffect(function () {
        fetch('http://localhost:5000/questions').then(res => res.json()).then(data => dispatch({ type: "dataRecieved", payload: data })).catch(() => dispatch({ type: "dataFailed" }))
    }, [])

    return (
        <div className={Styles.quiz_app}>
            <AppHeader />
            {status === "loading" && <LoadingSpinner />}
            {status === "Fetch Failed" && <ErrorBox error={`${status}, sorry for this issue, we are fixing it`} />}
            {status === "Data Ready" && <StartGameScreen dispatch={dispatch} title="Welcome to the React Quiz" description="this is a cool QNA game for react learners" buttonContent="Start Quiz" />}
            {status === "Game Started" && <QuestionsScreen remainingTime={remainingTime} points={points} dispatch={dispatch} userAnswer={userAnswer} totalQuestions={questions} index={index} quizQuestion={questions.at(index)} />}
            {status === "finished" && <EndScreen index={index} points={points} dispatch={dispatch} rightAnswers={rightAnswers} totalQuestions={questions} />}
        </div>
    )
}

export default ReactQuiz;


function AppHeader() {
    return <div className={Styles.header}><h1>ReactQuiz</h1><p>developed by Rehmann Tyagi</p></div>
}

function StartGameScreen({ title, description, buttonContent, dispatch }) {
    return (
        <div className={Styles.game_start_screen}>
            <h1>{title}</h1>
            <p style={{ fontWeight: '600' }}>{description}</p>
            <button onClick={() => dispatch({ type: "gameStart" })} className={Styles.button}>{buttonContent}</button>
        </div>
    )
}

function QuestionsScreen({ remainingTime, dispatch, quizQuestion, userAnswer, totalQuestions, index, points }) {
    const { options, question, correctOption } = quizQuestion
    return (
        <div className={Styles.question_container}>
            <h2>{question}</h2>
            <UserProgress points={points} index={index} totalQuestions={totalQuestions} />
            <Options remainingTime={remainingTime} index={index} totalQuestions={totalQuestions} userAnswer={userAnswer} dispatch={dispatch} options={options} correctAnswer={correctOption} />
        </div>
    )
}

function Options({ remainingTime, dispatch, options, correctAnswer, userAnswer, index, totalQuestions }) {
    const hasAnswered = userAnswer !== null
    return (
        <div>
            <div className={Styles.game_options}>
                {
                    options.map((option, index) => <button disabled={hasAnswered} onClick={() => dispatch({ type: "userAnswer", payload: index })} key={option} className={`${hasAnswered ? correctAnswer === index ? Styles.answer_correct : Styles.answer_wrong : ""} ${!hasAnswered ? Styles.on_hover : ""} ${hasAnswered ? userAnswer === index && userAnswer !== correctAnswer ? Styles.selected_answer : "" : ""}  ${Styles.button}`}>{option}</button>)
                }
            </div>
            {
                hasAnswered && index !== totalQuestions.length - 1 && <button onClick={() => dispatch({ type: "nextQuestion" })} style={{ float: "right", borderRadius: "10px" }} className={Styles.button}>Next</button>
            }
            {
                hasAnswered && index === totalQuestions.length - 1 && <button onClick={() => dispatch({ type: "finished" })} style={{ float: "right", borderRadius: "10px" }} className={Styles.button}>Finish</button>
            }

            <Timer dispatch={dispatch} remainingTime={remainingTime} />
        </div>

    )
}

function UserProgress({ totalQuestions, index, points }) {
    const totalPoints = totalQuestions.reduce((accumulator, currentValue) => accumulator + currentValue.points, 0)
    return (
        <div>
            <progress style={{ width: "100%" }} value={index} max={totalQuestions.length}></progress>
            <div className={Styles.user_progress_container}>
                <span>{`${index} ${index > 1 ? "questions" : "question"} / ${totalQuestions.length} questions`}</span>
                <span>{points} points / {totalPoints} points</span>
            </div>
        </div>
    )
}