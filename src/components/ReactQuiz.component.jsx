import Styles from "./ReactQuiz.module.css"

import LoadingSpinner from "./LoadingSpinner/LoadingSpinner.component"
import ErrorBox from "./ErrorBox/ErrorBox.component"
import { useEffect, useReducer } from "react";

const initialState = {
    questions: [],
    status: 'loading',
    index: 0,
    userAnswer: null
}

function reducer(state, action) {
    switch (action.type) {
        case 'dataRecieved': return { ...state, questions: action.payload, status: 'Data Ready' }
        case 'dataFailed': return { ...state, status: 'Fetch Failed' }
        case 'gameStart': return { ...state, status: 'Game Started' }
        case 'userAnswer': return { ...state, userAnswer: action.payload }
        case 'nextQuestion': return { ...state, index: state.index + 1, userAnswer: null }
        default: throw new Error("uknown error")
    }
}

function ReactQuiz() {

    const [state, dispatch] = useReducer(reducer, initialState)
    const { questions, status, index, userAnswer } = state

    useEffect(function () {
        fetch('http://localhost:5000/questions').then(res => res.json()).then(data => dispatch({ type: "dataRecieved", payload: data })).catch(() => dispatch({ type: "dataFailed" }))
    }, [])

    return (
        <div className={Styles.quiz_app}>
            <AppHeader />
            {status === "loading" && <LoadingSpinner />}
            {status === "Fetch Failed" && <ErrorBox error={`${status}, sorry for this issue, we are fixing it`} />}
            {status === "Data Ready" && <StartGameScreen dispatch={dispatch} title="Welcome to the React Quiz" description="this is a cool QNA game for react learners" buttonContent="Start Quiz" />}
            {status === "Game Started" && <QuestionsScreen dispatch={dispatch} userAnswer={userAnswer} totalQuestions={questions} index={index} quizQuestion={questions.at(index)} />}
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

function QuestionsScreen({ dispatch, quizQuestion, userAnswer, totalQuestions, index }) {
    const { options, question, correctOption } = quizQuestion
    return (
        <div className={Styles.question_container}>
            <h2>{question}</h2>
            <UserProgress index={index} totalQuestions={totalQuestions} />
            <Options userAnswer={userAnswer} dispatch={dispatch} options={options} correctAnswer={correctOption} />
        </div>
    )
}

function Options({ dispatch, options, correctAnswer, userAnswer }) {
    const hasAnswered = userAnswer !== null
    return (
        <div>
            <div className={Styles.game_options}>
                {
                    options.map((option, index) => <button disabled={hasAnswered} onClick={() => dispatch({ type: "userAnswer", payload: index })} key={option} className={`${hasAnswered ? correctAnswer === index ? Styles.answer_correct : Styles.answer_wrong : ""} ${!hasAnswered ? Styles.on_hover : ""} ${hasAnswered ? userAnswer === index && userAnswer !== correctAnswer ? Styles.selected_answer : "" : ""}  ${Styles.button}`}>{option}</button>)
                }
            </div>
            {
                hasAnswered && <button onClick={() => dispatch({ type: "nextQuestion" })} style={{ float: "right", borderRadius: "10px" }} className={Styles.button}>Next</button>
            }
        </div>

    )
}

function UserProgress({ totalQuestions, index }) {
    return (
        <div>
            <progress style={{ width: "100%" }} value={index} max={totalQuestions.length}></progress>
            <div className={Styles.user_progress_container}>
                <span>{`${index} ${index > 1 ? "questions" : "question"} / ${totalQuestions.length} questions`}</span>
                <span>X points / X points</span>
            </div>
        </div>
    )
}