// Quiz Mode Component - Multiple choice for reviewing words

const { useState, useEffect, useCallback, useMemo } = React;

const StudySession = ({ vocabulary, progress, settings, onComplete, onExit }) => {
    const [session, setSession] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [options, setOptions] = useState([]);
    const [direction, setDirection] = useState(null);
    const [showGraduationModal, setShowGraduationModal] = useState(false);
    const [mnemonic, setMnemonic] = useState('');

    // Build session on mount - includes due reviews AND new words
    useEffect(() => {
        const sessionWords = SRS.buildStudySession(vocabulary, progress, settings);
        setSession(sessionWords);
    }, [vocabulary, progress, settings]);

    // Generate options for current card
    useEffect(() => {
        if (session.length > 0 && currentIndex < session.length) {
            const word = session[currentIndex];
            setMnemonic(Storage.getMnemonic(word.id));

            // Set quiz direction
            if (settings.quizDirection === 'both') {
                setDirection(Math.random() > 0.5 ? 'jp-to-en' : 'en-to-jp');
            } else {
                setDirection(settings.quizDirection);
            }

            // Generate 4 options (1 correct + 3 wrong)
            generateOptions(word);
        }
    }, [currentIndex, session, settings, vocabulary]);

    // Arrow key navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showGraduationModal) return;

            if (e.key === 'ArrowRight' && showResult) {
                handleNext();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                handlePrevious();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showResult, currentIndex, showGraduationModal]);

    // Generate multiple choice options
    const generateOptions = (correctWord) => {
        const dir = settings.quizDirection === 'both'
            ? (Math.random() > 0.5 ? 'jp-to-en' : 'en-to-jp')
            : settings.quizDirection;

        // Get 3 random wrong answers from vocabulary
        const wrongAnswers = [];
        const usedIds = new Set([correctWord.id]);

        while (wrongAnswers.length < 3 && wrongAnswers.length < vocabulary.length - 1) {
            const randomIndex = Math.floor(Math.random() * vocabulary.length);
            const randomWord = vocabulary[randomIndex];

            if (!usedIds.has(randomWord.id)) {
                usedIds.add(randomWord.id);
                wrongAnswers.push(randomWord);
            }
        }

        // Create options array
        const allOptions = [
            { word: correctWord, isCorrect: true },
            ...wrongAnswers.map(w => ({ word: w, isCorrect: false }))
        ];

        // Shuffle options
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        setOptions(allOptions);
        setDirection(dir);
    };

    const currentWord = session[currentIndex];

    // Handle answer selection
    const handleSelectAnswer = (option, index) => {
        if (showResult) return;

        setSelectedAnswer(index);
        setShowResult(true);

        // Process answer in SRS (check if word is new from buildStudySession)
        SRS.processAnswer(
            currentWord.id,
            option.isCorrect,
            currentWord.isNew || false,
            settings
        );

        // Dispatch progress update for real-time sync across pages
        window.dispatchEvent(new CustomEvent('nihongo-progress-update', {
            detail: { timestamp: Date.now(), type: 'quiz' }
        }));
    };

    // Move to next word
    const handleNext = () => {
        if (!showResult) return;

        // Check if word is ready to graduate
        const updatedProgress = Storage.getWordData(currentWord.id);
        if (updatedProgress.readyToGraduate && options[selectedAnswer]?.isCorrect) {
            setShowGraduationModal(true);
            return;
        }

        moveToNextWord();
    };

    // Previous word
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const moveToNextWord = () => {
        setShowGraduationModal(false);

        if (currentIndex + 1 >= session.length) {
            onComplete();
            return;
        }

        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    // Handle graduation decision
    const handleGraduate = (doGraduate) => {
        if (doGraduate) {
            SRS.graduateWord(currentWord.id);
        } else {
            SRS.resetWord(currentWord.id);
        }
        moveToNextWord();
    };

    // Play audio
    const playAudio = (word, e) => {
        if (e) {
            e.stopPropagation();
        }
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.75;
            const voices = speechSynthesis.getVoices();
            const japaneseVoice = voices.find(v => v.lang.includes('ja') &&
                (v.name.includes('Google') || v.name.includes('Kyoko'))) || voices.find(v => v.lang.includes('ja'));
            if (japaneseVoice) utterance.voice = japaneseVoice;
            speechSynthesis.speak(utterance);
        }
    };

    if (session.length === 0) {
        return (
            <div className="study-container">
                <div className="empty-state">
                    <div className="empty-state-icon">✍️</div>
                    <p>No words to quiz right now!</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
                        You've reached your daily limit or all words have been studied.
                    </p>
                    <button className="btn btn-secondary" onClick={onExit} style={{ marginTop: 'var(--space-lg)' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!currentWord) {
        return null;
    }

    return (
        <div className="study-container quiz-container-centered">
            {/* Progress */}
            <div className="study-progress" style={{ width: '100%', maxWidth: '600px', marginBottom: 'var(--space-lg)' }}>
                <div className="study-progress-text">
                    {currentIndex + 1} / {session.length} words
                    <span style={{ marginLeft: 'var(--space-md)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        (← → to navigate)
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${((currentIndex + 1) / session.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Card with Navigation Arrows */}
            <div className="study-card-wrapper">
                {/* Previous Arrow */}
                <button
                    className="nav-arrow nav-arrow-left"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    title="Previous (←)"
                >
                    ←
                </button>

                {/* Quiz Card */}
                <div className="study-card quiz-card">
                    {/* Question */}
                    <div className="quiz-question">
                        {direction === 'jp-to-en' ? (
                            <>
                                <div className="quiz-prompt">What does this mean?</div>
                                <div
                                    className="kanji-display japanese jp-tooltip"
                                    data-tooltip={`${currentWord.reading} (${JapaneseUtils.toRomaji(currentWord.reading)})`}
                                >
                                    {currentWord.word}
                                </div>
                                {settings.showFurigana && currentWord.reading && currentWord.word !== currentWord.reading && (
                                    <div
                                        className="reading-display jp-tooltip"
                                        data-tooltip={JapaneseUtils.toRomaji(currentWord.reading)}
                                    >
                                        {currentWord.reading}
                                    </div>
                                )}
                                <button className="btn-audio" onClick={(e) => playAudio(currentWord.word, e)} style={{ marginTop: 'var(--space-sm)' }}>
                                    🔊
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="quiz-prompt">Select the Japanese word for:</div>
                                <div className="quiz-meaning">{currentWord.meaning}</div>
                            </>
                        )}
                    </div>

                    {/* Multiple Choice Options */}
                    <div className="quiz-options">
                        {options.map((option, index) => {
                            let optionClass = 'quiz-option';
                            if (showResult) {
                                if (option.isCorrect) {
                                    optionClass += ' correct';
                                } else if (selectedAnswer === index && !option.isCorrect) {
                                    optionClass += ' incorrect';
                                }
                            } else if (selectedAnswer === index) {
                                optionClass += ' selected';
                            }

                            const isJapaneseOption = direction === 'en-to-jp';

                            return (
                                <button
                                    key={index}
                                    className={optionClass}
                                    onClick={() => handleSelectAnswer(option, index)}
                                    disabled={showResult}
                                >
                                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                    <span className={`option-text ${isJapaneseOption ? 'japanese' : ''}`}>
                                        {isJapaneseOption ? (
                                            <>
                                                <span className="option-word">{option.word.word}</span>
                                                <span className="option-reading">({option.word.reading})</span>
                                            </>
                                        ) : (
                                            option.word.meaning
                                        )}
                                    </span>
                                    {isJapaneseOption && (
                                        <button
                                            className="option-audio-btn"
                                            onClick={(e) => playAudio(option.word.word, e)}
                                            title="Play audio"
                                        >
                                            🔊
                                        </button>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Result Feedback */}
                    {showResult && (
                        <div className={`quiz-feedback ${options[selectedAnswer]?.isCorrect ? 'correct' : 'incorrect'}`}>
                            {options[selectedAnswer]?.isCorrect ? (
                                <span>✓ Correct!</span>
                            ) : (
                                <div>
                                    <span>✗ Incorrect</span>
                                    <div className="correct-answer-display">
                                        Correct answer: <strong className="japanese">{currentWord.word}</strong> ({currentWord.reading}) = {currentWord.meaning}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show mnemonic on wrong answer */}
                    {showResult && !options[selectedAnswer]?.isCorrect && mnemonic && (
                        <div className="mnemonic-reminder">
                            <div className="section-label">Your mnemonic</div>
                            <div>{mnemonic}</div>
                        </div>
                    )}

                    {/* Continue Button */}
                    {showResult && (
                        <div className="quiz-actions">
                            <button className="btn btn-primary" onClick={handleNext}>
                                Continue →
                            </button>
                        </div>
                    )}
                </div>

                {/* Next Arrow */}
                <button
                    className="nav-arrow nav-arrow-right"
                    onClick={handleNext}
                    disabled={!showResult}
                    title="Next (→)"
                >
                    →
                </button>
            </div>

            {/* Graduation Modal */}
            {showGraduationModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3 className="modal-title">Do you really know this word?</h3>
                        <div className="modal-content">
                            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                                <div
                                    className="kanji-display japanese jp-tooltip"
                                    style={{ fontSize: '2.5rem' }}
                                    data-tooltip={`${currentWord.reading} (${JapaneseUtils.toRomaji(currentWord.reading)})`}
                                >
                                    {currentWord.word}
                                </div>
                                <div
                                    className="reading-display jp-tooltip"
                                    data-tooltip={JapaneseUtils.toRomaji(currentWord.reading)}
                                >
                                    {currentWord.reading}
                                </div>
                                <div style={{ marginTop: 'var(--space-sm)' }}>{currentWord.meaning}</div>
                            </div>
                            <p>
                                You've reviewed this word {settings.graduationThreshold} times correctly.
                                Move it to "Known" and stop reviewing?
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => handleGraduate(false)}>
                                Keep Practicing
                            </button>
                            <button className="btn btn-success" onClick={() => handleGraduate(true)}>
                                Yes, I Know It!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.StudySession = StudySession;
