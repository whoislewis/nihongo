// Kana Quiz Component
// Tracks individual kana mastery - each of 46 hiragana/katakana must be answered correctly
// Keyboard-first design for speed learning

const { useState, useEffect, useMemo, useCallback, useRef } = React;

const KanaQuiz = ({ onComplete, onExit }) => {
    const [quizType, setQuizType] = useState('hiragana'); // 'hiragana', 'katakana'
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizComplete, setQuizComplete] = useState(false);

    // Current question state
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [sessionMastered, setSessionMastered] = useState([]); // Kana mastered THIS session
    const [sessionWrong, setSessionWrong] = useState([]); // Wrong answers for review

    const autoAdvanceRef = useRef(null);

    // Kana data - 46 basic hiragana
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
    ];

    const TOTAL_KANA = 46;

    // Get current kana data based on quiz type
    const kanaPool = quizType === 'hiragana' ? hiraganaData : katakanaData;

    // Get already mastered kana from storage
    const getMasteredKana = useCallback(() => {
        const mastery = Storage.getKanaMastery();
        return quizType === 'hiragana' ? mastery.masteredHiragana : mastery.masteredKatakana;
    }, [quizType]);

    // Get unmastered kana (not yet answered correctly)
    const getUnmasteredKana = useCallback(() => {
        const mastered = getMasteredKana();
        return kanaPool.filter(k => !mastered.includes(k.kana));
    }, [kanaPool, getMasteredKana]);

    // Generate next question from unmastered kana
    const generateNextQuestion = useCallback(() => {
        const unmastered = getUnmasteredKana();

        if (unmastered.length === 0) {
            // All mastered!
            setQuizComplete(true);
            return null;
        }

        // Pick random unmastered kana
        const item = unmastered[Math.floor(Math.random() * unmastered.length)];

        // Generate 4 options including correct answer
        const otherOptions = kanaPool
            .filter(k => k.romaji !== item.romaji)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(k => k.romaji);

        const options = [...otherOptions, item.romaji].sort(() => Math.random() - 0.5);

        return { ...item, options };
    }, [getUnmasteredKana, kanaPool]);

    // Start quiz - generate first question
    const startQuiz = useCallback(() => {
        setQuizStarted(true);
        setSessionMastered([]);
        setSessionWrong([]);
        setCurrentQuestion(generateNextQuestion());
        setAnswered(false);
        setSelectedAnswer(null);
    }, [generateNextQuestion]);

    // Handle answer selection
    const handleAnswer = useCallback((answer) => {
        if (answered || !currentQuestion) return;

        const isCorrect = answer === currentQuestion.romaji;

        setSelectedAnswer(answer);
        setAnswered(true);

        if (isCorrect) {
            // Mark this kana as mastered
            Storage.masterKana(currentQuestion.kana, quizType);
            setSessionMastered(prev => [...prev, currentQuestion.kana]);

            // Auto-advance after 0.6 seconds for correct answers
            autoAdvanceRef.current = setTimeout(() => {
                handleNext();
            }, 600);
        } else {
            setSessionWrong(prev => [...prev, {
                kana: currentQuestion.kana,
                correct: currentQuestion.romaji,
                selected: answer
            }]);
        }
    }, [answered, currentQuestion, quizType]);

    // Move to next question
    const handleNext = useCallback(() => {
        if (autoAdvanceRef.current) {
            clearTimeout(autoAdvanceRef.current);
            autoAdvanceRef.current = null;
        }

        const nextQ = generateNextQuestion();
        if (nextQ) {
            setCurrentQuestion(nextQ);
            setAnswered(false);
            setSelectedAnswer(null);
        } else {
            setQuizComplete(true);
        }
    }, [generateNextQuestion]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (autoAdvanceRef.current) {
                clearTimeout(autoAdvanceRef.current);
            }
        };
    }, []);

    // Keyboard controls
    useEffect(() => {
        if (!quizStarted || quizComplete) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onExit();
                return;
            }

            // Number keys 1-4 to select answer
            if (!answered && currentQuestion) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 4 && currentQuestion.options[num - 1]) {
                    e.preventDefault();
                    handleAnswer(currentQuestion.options[num - 1]);
                    return;
                }
            }

            // Enter or Space to continue after wrong answer
            if ((e.key === 'Enter' || e.key === ' ') && answered) {
                e.preventDefault();
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [quizStarted, quizComplete, answered, currentQuestion, handleAnswer, handleNext, onExit]);

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

    // Calculate current progress
    const mastery = Storage.getKanaMastery();
    const masteredCount = quizType === 'hiragana' ? mastery.hiraganaCount : mastery.katakanaCount;
    const masteredPercent = quizType === 'hiragana' ? mastery.hiraganaPercent : mastery.katakanaPercent;
    const remaining = TOTAL_KANA - masteredCount;

    // Start screen
    if (!quizStarted) {
        return (
            <div className="kana-quiz-start">
                <div className="quiz-start-card">
                    <h2>Kana Mastery</h2>
                    <p>Master all 46 characters to unlock vocabulary and grammar</p>

                    <div className="quiz-type-selection">
                        <h4>Select Quiz Type</h4>
                        <div className="quiz-type-buttons">
                            <button
                                className={`quiz-type-btn ${quizType === 'hiragana' ? 'active' : ''}`}
                                onClick={() => setQuizType('hiragana')}
                            >
                                <span className="japanese">ひらがな</span>
                                <span>Hiragana</span>
                                <span className="quiz-type-progress">
                                    {mastery.hiraganaCount} / 46
                                    {mastery.hiraganaComplete && ' ✓'}
                                </span>
                            </button>
                            <button
                                className={`quiz-type-btn ${quizType === 'katakana' ? 'active' : ''}`}
                                onClick={() => setQuizType('katakana')}
                            >
                                <span className="japanese">カタカナ</span>
                                <span>Katakana</span>
                                <span className="quiz-type-progress">
                                    {mastery.katakanaCount} / 46
                                    {mastery.katakanaComplete && ' ✓'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="quiz-info">
                        <p style={{ fontWeight: '500' }}>
                            {remaining > 0 ? `${remaining} ${quizType} characters remaining` : `All ${quizType} mastered!`}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            Each character must be answered correctly at least once
                        </p>
                        <p style={{ marginTop: 'var(--space-md)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Keyboard: 1-4 to answer, Enter to continue, ESC to exit
                        </p>
                    </div>

                    <div className="quiz-start-actions">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={startQuiz}
                            disabled={remaining === 0}
                        >
                            {remaining > 0 ? 'Start Quiz' : 'All Complete!'}
                        </button>
                        <button className="btn btn-ghost" onClick={onExit}>
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz complete screen
    if (quizComplete) {
        return (
            <div className="kana-quiz-results">
                <div className="quiz-results-card">
                    <div className="result-icon passed">🎉</div>
                    <h2>All {quizType} Mastered!</h2>
                    <div className="result-score">
                        <span className="score-number">46 / 46</span>
                        <span className="score-label">Characters Mastered</span>
                    </div>

                    <p className="result-message success">
                        You've completed {quizType} mastery!
                    </p>

                    {sessionMastered.length > 0 && (
                        <div className="session-summary">
                            <p>This session: {sessionMastered.length} new characters mastered</p>
                        </div>
                    )}

                    {sessionWrong.length > 0 && (
                        <div className="wrong-answers-review">
                            <h4>Characters to Review</h4>
                            <div className="wrong-answers-grid">
                                {sessionWrong.map((item, i) => (
                                    <div key={i} className="wrong-answer-item" onClick={() => playAudio(item.kana)}>
                                        <span className="wa-kana japanese">{item.kana}</span>
                                        <span className="wa-correct">{item.correct}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="result-actions">
                        {!mastery.totalComplete && (
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setQuizType(quizType === 'hiragana' ? 'katakana' : 'hiragana');
                                    setQuizStarted(false);
                                    setQuizComplete(false);
                                }}
                            >
                                Start {quizType === 'hiragana' ? 'Katakana' : 'Hiragana'}
                            </button>
                        )}
                        <button className="btn btn-ghost" onClick={() => onComplete()}>
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz question screen
    if (!currentQuestion) return null;

    return (
        <div className="kana-quiz">
            <div className="quiz-header">
                <button className="btn btn-ghost btn-sm" onClick={onExit} title="Press ESC to exit">
                    ← Exit
                </button>
                <div className="quiz-progress">
                    <span>{masteredCount} / {TOTAL_KANA} mastered</span>
                    <div className="quiz-progress-bar">
                        <div
                            className="quiz-progress-fill"
                            style={{ width: `${masteredPercent}%` }}
                        />
                    </div>
                </div>
                <div className="quiz-score">
                    +{sessionMastered.length} this session
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
                                title={`Press ${i + 1} to select`}
                            >
                                <span className="option-number">{i + 1}</span>
                                {option}
                            </button>
                        );
                    })}
                </div>

                {answered && (
                    <div className="quiz-feedback">
                        {selectedAnswer === currentQuestion.romaji ? (
                            <span className="feedback-correct">Correct! ✓</span>
                        ) : (
                            <>
                                <span className="feedback-incorrect">
                                    The answer is <strong>{currentQuestion.romaji}</strong>
                                </span>
                                <button className="btn btn-primary" onClick={handleNext}>
                                    Try Another →
                                </button>
                            </>
                        )}
                    </div>
                )}

                <div className="quiz-keyboard-hints">
                    <span>1-4: Select</span>
                    <span>Enter: Continue</span>
                    <span>ESC: Exit</span>
                </div>
            </div>
        </div>
    );
};

window.KanaQuiz = KanaQuiz;
