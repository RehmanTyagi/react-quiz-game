import styles from './ErrorBox.module.css'

function ErrorBox({ error }) {
    return <div className={styles.error}>🤖 {error}</div>
}


export default ErrorBox;