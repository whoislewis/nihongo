// Kana Quiz Component
// Interactive quiz to test hiragana and katakana recognition

const { useState, useEffect, useMemo, useCallback } = React;

const KanaQuiz = ({ onComplete, onExit }) => {
    const [quizType, setQuizType] = useState('hiragana'); // 'hiragana', 'katakana', 'both'
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizComplete, setQuizComplete] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState([]);

    const QUIZ_LENGTH = 20;

    // Kana data
    const hiraganaData = [
        { kana: 'あ', romaji: 'a' }, { kana: 'い', romaji: 'i' }, { kana: 'う', romaji: 'u' }, { kana: 'え', romaji: 'e' }, { kana: 'お', romaji: 'o' },
        { kana: 'か', romaji: 'ka' }, { kana: 'き', romaji: 'ki' }, { kana: 'く', romaji: 'ku' }, { kana: 'け', romaji: 'ke' }, { kana: 'こ', romaji: 'ko' },
        { kana: 'さ', romaji: 'sa' }, { kana: 'し', romaji: 'shi' }, { kana: 'す', romaji: 'su' }, { kana: 'せ', romaji: 'se' }, { kana: 'そ', romaji: 'so' },
        { kana: 'た', romaji: 'ta' }, { kana: 'ち', romaji: 'chi' }, { kana: 'つ', romaji: 'tsu' }, { kana: 'て', romaji: 'te' }, { kana: 'と', romaji: 'to' },
        { kana: 'な', romaji: 'na' }, { kana: 'に', romaji: 'ni' }, { kana: 'ぬ', romaji: 'nu' }, { kana: 'ね', romaji: 'ne' }, { kana: 'の', romaji: 'no' },
        { kana: 'は', romaji: 'ha' }, { kana: 'ひ', romaji: 'hi' }, { kana: 'ふ', romaji: 'fu' }, { kana: 'へ', romaji: 'he' }, { kana: 'ほ', romaji: 'ho' },
        { kana: 'ま', romaji: 'ma' }, { kana: 'み', romaji: 'mi' }, { kana: 'む', romaji: 'mu' }, { kana: 'め', romaji: 'me' }, { kana: 'も', romaji: 'mo' },
        { kana: 'や', romaji: 'ya' }, { kana: 'ゆ', romaji: 'yu' }, { kana: 'よ', romaji: 'yo' },
        { kana: 'ら', romaji: 'ra' }, { kana: 'り', romaji: 'ri' }, { kana: 'る', romaji: 'ru' }, { kana: 'れ', romaji: 're' }, { kana: 'ろ', romaji: 'ro' },
        { kana: 'わ', romaji: 'wa' }, { kana: 'を', romaji: 'wo' }, { kana: 'ん', romaji: 'n' },
        // Dakuten
        { kana: 'が', romaji: 'ga' }, { kana: 'ぎ', romaji: 'gi' }, { kana: 'ぐ', romaji: 'gu' }, { kana: 'げ', romaji: 'ge' }, { kana: 'ご', romaji: 'go' },
        { kana: 'ざ', romaji: 'za' }, { kana: 'じ', romaji: 'ji' }, { kana: 'ず', romaji: 'zu' }, { kana: 'ぜ', romaji: 'ze' }, { kana: 'ぞ', romaji: 'zo' },
        { kana: 'だ', romaji: 'da' }, { kana: 'ぢ', romaji: 'ji' }, { kana: 'づ', romaji: 'zu' }, { kana: 'で', romaji: 'de' }, { kana: 'ど', romaji: 'do' },
        { kana: 'ば', romaji: 'ba' }, { kana: 'び', romaji: 'bi' }, { kana: 'ぶ', romaji: 'bu' }, { kana: 'べ', romaji: 'be' }, { kana: 'ぼ', romaji: 'bo' },
        { kana: 'ぱ', romaji: 'pa' }, { kana: 'ぴ', romaji: 'pi' }, { kana: 'ぷ', romaji: 'pu' }, { kana: 'ぺ', romaji: 'pe' }, { kana: 'ぽ', romaji: 'po' },
    ];

    const katakanaData = [
        { kana: 'ア', romaji: 'a' }, { kana: 'イ', romaji: 'i' }, { kana: 'ウ', romaji: 'u' }, { kana: 'エ', romaji: 'e' }, { kana: 'オ', romaji: 'o' },
        { kana: 'カ', romaji: 'ka' }, { kana: 'キ', romaji: 'ki' }, { kana: 'ク', romaji: 'ku' }, { kana: 'ケ', romaji: 'ke' }, { kana: 'コ', romaji: 'ko' },
        { kana: 'サ', romaji: 'sa' }, { kana: 'シ', romaji: 'shi' }, { kana: 'ス', romaji: 'su' }, { kana: 'セ', romaji: 'se' }, { kana: 'ソ', romaji: 'so' },
        { kana: 'タ', romaji: 'ta' }, { kana: 'チ', romaji: 'chi' }, { kana: 'ツ', romaji: 'tsu' }, { kana: 'テ', romaji: 'te' }, { kana: 'ト', romaji: 'to' },
        { kana: 'ナ', romaji: 'na' }, { kana: 'ニ', romaji: 'ni' }, { kana: 'ヌ', romaji: 'nu' }, { kana: 'ネ', romaji: 'ne' }, { kana: 'ノ', romaji: 'no' },
        { kana: 'ハ', romaji: 'ha' }, { kana: 'ヒ', romaji: 'hi' }, { kana: 'フ', romaji: 'fu' }, { kana: 'ヘ', romaji: 'he' }, { kana: 'ホ', romaji: 'ho' },
        { kana: 'マ', romaji: 'ma' }, { kana: 'ミ', romaji: 'mi' }, { kana: 'ム', romaji: 'mu' }, { kana: 'メ', romaji: 'me' }, { kana: 'モ', romaji: 'mo' },
        { kana: 'ヤ', romaji: 'ya' }, { kana: 'ユ', romaji: 'yu' }, { kana: 'ヨ', romaji: 'yo' },
        { kana: 'ラ', romaji: 'ra' }, { kana: 'リ', romaji: 'ri' }, { kana: 'ル', romaji: 'ru' }, { kana: 'レ', romaji: 're' }, { kana: 'ロ', romaji: 'ro' },
        { kana: 'ワ', romaji: 'wa' }, { kana: 'ヲ', romaji: 'wo' }, { kana: 'ン', romaji: 'n' },
        // Dakuten
        { kana: 'ガ', romaji: 'ga' }, { kana: 'ギ', romaji: 'gi' }, { kana: 'グ', romaji: 'gu' }, { kana: 'ゲ', romaji: 'ge' }, { kana: 'ゴ', romaji: 'go' },
        { kana: 'ザ', romaji: 'za' }, { kana: 'ジ', romaji: 'ji' }, { kana: 'ズ', romaji: 'zu' }, { kana: 'ゼ', romaji: 'ze' }, { kana: 'ゾ', romaji: 'zo' },
        { kana: 'ダ', romaji: 'da' }, { kana: 'ヂ', romaji: 'ji' }, { kana: 'ヅ', romaji: 'zu' }, { kana: 'デ', romaji: 'de' }, { kana: 'ド', romaji: 'do' },
        { kana: 'バ', romaji: 'ba' }, { kana: 'ビ', romaji: 'bi' }, { kana: 'ブ', romaji: 'bu' }, { kana: 'ベ', romaji: 'be' }, { kana: 'ボ', romaji: 'bo' },
        { kana: 'パ', romaji: 'pa' }, { kana: 'ピ', romaji: 'pi' }, { kana: 'プ', romaji: 'pu' }, { kana: 'ペ', romaji: 'pe' }, { kana: 'ポ', romaji: 'po' },
    ];

    // Generate quiz questions
    const questions = useMemo(() => {
        let pool = [];
        if (quizType === 'hiragana') pool = hiraganaData;
        else if (quizType === 'katakana') pool = katakanaData;
        else pool = [...hiraganaData, ...katakanaData];

        // Shuffle and pick QUIZ_LENGTH questions
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, QUIZ_LENGTH).map(item => {
            // Generate 4 options including the correct answer
            const otherOptions = pool
                .filter(k => k.romaji !== item.romaji)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(k => k.romaji);

            const options = [...otherOptions, item.romaji].sort(() => Math.random() - 0.5);

            return {
                ...item,
                options
            };
        });
    }, [quizType, quizStarted]);

    const currentQuestion = questions[currentIndex];

    // Handle answer selection
    const handleAnswer = (answer) => {
        if (answered) return;

        setSelectedAnswer(answer);
        setAnswered(true);

        if (answer === currentQuestion.romaji) {
            setScore(prev => prev + 1);
        } else {
            setWrongAnswers(prev => [...prev, {
                kana: currentQuestion.kana,
                correct: currentQuestion.romaji,
                selected: answer
            }]);
        }
    };

    // Move to next question
    const handleNext = () => {
        if (currentIndex < QUIZ_LENGTH - 1) {
            setCurrentIndex(prev => prev + 1);
            setAnswered(false);
            setSelectedAnswer(null);
        } else {
            // Quiz complete
            setQuizComplete(true);
            const finalScore = Math.round((score / QUIZ_LENGTH) * 100);

            // Save progress if score >= 90%
            if (finalScore >= 90) {
                if (quizType === 'both') {
                    Storage.updateKanaScore('hiragana', finalScore);
                    Storage.updateKanaScore('katakana', finalScore);
                } else {
                    Storage.updateKanaScore(quizType, finalScore);
                }
            }
        }
    };

    // Play audio
    const playAudio = (text) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    // Start screen
    if (!quizStarted) {
        return (
            <div className="kana-quiz-start">
                <div className="quiz-start-card">
                    <h2>Kana Quiz</h2>
                    <p>Test your knowledge of Japanese characters</p>

                    <div className="quiz-type-selection">
                        <h4>Select Quiz Type</h4>
                        <div className="quiz-type-buttons">
                            <button
                                className={`quiz-type-btn ${quizType === 'hiragana' ? 'active' : ''}`}
                                onClick={() => setQuizType('hiragana')}
                            >
                                <span className="japanese">ひらがな</span>
                                <span>Hiragana</span>
                            </button>
                            <button
                                className={`quiz-type-btn ${quizType === 'katakana' ? 'active' : ''}`}
                                onClick={() => setQuizType('katakana')}
                            >
                                <span className="japanese">カタカナ</span>
                                <span>Katakana</span>
                            </button>
                            <button
                                className={`quiz-type-btn ${quizType === 'both' ? 'active' : ''}`}
                                onClick={() => setQuizType('both')}
                            >
                                <span className="japanese">両方</span>
                                <span>Both</span>
                            </button>
                        </div>
                    </div>

                    <div className="quiz-info">
                        <p>{QUIZ_LENGTH} questions</p>
                        <p>Score 90% or higher to complete the stage</p>
                    </div>

                    <div className="quiz-start-actions">
                        <button className="btn btn-primary btn-large" onClick={() => setQuizStarted(true)}>
                            Start Quiz
                        </button>
                        <button className="btn btn-ghost" onClick={onExit}>
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Results screen
    if (quizComplete) {
        const percentage = Math.round((score / QUIZ_LENGTH) * 100);
        const passed = percentage >= 90;

        return (
            <div className="kana-quiz-results">
                <div className="quiz-results-card">
                    <div className={`result-icon ${passed ? 'passed' : 'failed'}`}>
                        {passed ? '🎉' : '📚'}
                    </div>
                    <h2>{passed ? 'Congratulations!' : 'Keep Practicing!'}</h2>
                    <div className="result-score">
                        <span className="score-number">{percentage}%</span>
                        <span className="score-label">{score} / {QUIZ_LENGTH} correct</span>
                    </div>

                    {passed ? (
                        <p className="result-message success">
                            You've mastered {quizType === 'both' ? 'hiragana and katakana' : quizType}!
                        </p>
                    ) : (
                        <p className="result-message">
                            You need 90% to pass. Review the characters below and try again.
                        </p>
                    )}

                    {wrongAnswers.length > 0 && (
                        <div className="wrong-answers-review">
                            <h4>Review These Characters</h4>
                            <div className="wrong-answers-grid">
                                {wrongAnswers.map((item, i) => (
                                    <div key={i} className="wrong-answer-item" onClick={() => playAudio(item.kana)}>
                                        <span className="wa-kana japanese">{item.kana}</span>
                                        <span className="wa-correct">{item.correct}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="result-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setQuizStarted(false);
                                setQuizComplete(false);
                                setCurrentIndex(0);
                                setScore(0);
                                setWrongAnswers([]);
                            }}
                        >
                            Try Again
                        </button>
                        <button className="btn btn-ghost" onClick={onExit}>
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz question screen
    return (
        <div className="kana-quiz">
            <div className="quiz-header">
                <button className="btn btn-ghost btn-sm" onClick={onExit}>
                    ← Exit
                </button>
                <div className="quiz-progress">
                    <span>{currentIndex + 1} / {QUIZ_LENGTH}</span>
                    <div className="quiz-progress-bar">
                        <div
                            className="quiz-progress-fill"
                            style={{ width: `${((currentIndex + 1) / QUIZ_LENGTH) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="quiz-score">
                    Score: {score}
                </div>
            </div>

            <div className="quiz-card">
                <div className="quiz-question">
                    <span
                        className="quiz-kana japanese"
                        onClick={() => playAudio(currentQuestion.kana)}
                    >
                        {currentQuestion.kana}
                    </span>
                    <button className="btn-audio" onClick={() => playAudio(currentQuestion.kana)}>
                        🔊
                    </button>
                </div>

                <div className="quiz-options">
                    {currentQuestion.options.map((option, i) => {
                        let optionClass = 'quiz-option';
                        if (answered) {
                            if (option === currentQuestion.romaji) {
                                optionClass += ' correct';
                            } else if (option === selectedAnswer) {
                                optionClass += ' incorrect';
                            }
                        }

                        return (
                            <button
                                key={i}
                                className={optionClass}
                                onClick={() => handleAnswer(option)}
                                disabled={answered}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {answered && (
                    <div className="quiz-feedback">
                        {selectedAnswer === currentQuestion.romaji ? (
                            <span className="feedback-correct">Correct!</span>
                        ) : (
                            <span className="feedback-incorrect">
                                The answer is <strong>{currentQuestion.romaji}</strong>
                            </span>
                        )}
                        <button className="btn btn-primary" onClick={handleNext}>
                            {currentIndex < QUIZ_LENGTH - 1 ? 'Next' : 'See Results'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

window.KanaQuiz = KanaQuiz;
