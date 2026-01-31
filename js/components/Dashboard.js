// Dashboard Component

const { useState, useEffect, useMemo } = React;

const Dashboard = ({ vocabulary, progress, settings, stats, onStartStudy, onStartQuiz, onRefresh, onNavigateToLibrary }) => {
    const [wordOfDay, setWordOfDay] = useState(null);
    const [didYouKnow, setDidYouKnow] = useState(null);

    const stackCounts = SRS.getStackCounts(vocabulary, progress);
    const quizAvailable = stackCounts.learning; // All Learning stack words can be quizzed
    const trulyDueCount = SRS.getDueCount(vocabulary, progress); // Words past their review date
    const newWordsAvailable = SRS.getNewWords(vocabulary, progress, settings).length;

    const WORD_GOAL = 1500;
    const progressPercent = Math.round((stackCounts.known / WORD_GOAL) * 100);

    // Daily Japanese facts
    const japaneseFacts = [
        { title: "Particle は (wa)", content: "The topic marker は is pronounced 'wa', not 'ha'. It marks the topic of the sentence, which is often (but not always) the subject." },
        { title: "Counting People", content: "Japanese has special counters for people: 一人 (hitori) = 1 person, 二人 (futari) = 2 people, then 三人 (sannin), 四人 (yonin), etc." },
        { title: "Polite vs Casual", content: "です (desu) and ます (masu) endings make speech polite. Drop them for casual speech with friends: 食べます → 食べる" },
        { title: "No Plurals", content: "Japanese nouns don't have plural forms. 本 (hon) means both 'book' and 'books'. Context tells you which!" },
        { title: "Verb at the End", content: "Japanese sentences typically end with the verb: 私はりんごを食べる (I apple eat) = I eat an apple." },
        { title: "Omitting Subjects", content: "When the subject is clear from context, Japanese speakers often omit it entirely. '食べた?' can mean 'Did you eat?'" },
        { title: "Three Writing Systems", content: "Japanese uses hiragana (native words), katakana (foreign words, emphasis), and kanji (meaning-based characters from Chinese)." },
        { title: "Double Consonants", content: "Small っ (tsu) doubles the next consonant: きって (kitte = stamp) vs きて (kite = come). It creates a short pause." },
        { title: "Long Vowels", content: "Long vowels change meaning! おばさん (obasan) = aunt, but おばあさん (obaasan) = grandmother." },
        { title: "Honorific お/ご", content: "Adding お (o) or ご (go) before words makes them more polite: 水 (mizu) → お水 (omizu) = water (polite)." },
        { title: "Particle が (ga)", content: "が marks the subject and often introduces new information or emphasizes who/what. Compare: 誰が来た? (Who came?) vs 私が行きます (I will go - emphasis on 'I')." },
        { title: "Te-form Magic", content: "The て-form connects actions: 食べて、飲んで、寝た (I ate, drank, and slept). It's one of the most useful verb forms!" },
        { title: "Pitch Accent", content: "Japanese has pitch accent, not stress accent. 橋 (はし, LH) = bridge, but 箸 (はし, HL) = chopsticks. Same sounds, different pitches!" },
        { title: "Keigo Levels", content: "Japanese has three politeness levels: casual (友達と), polite/です・ます (strangers), and honorific/humble (business, customers)." },
        { title: "Counter Madness", content: "Japanese has 500+ counters! 本 (hon) for long things, 枚 (mai) for flat things, 匹 (hiki) for small animals, 頭 (tou) for large animals..." },
        { title: "の (no) = Possessive", content: "の connects nouns like 'of' or 's: 私の本 (watashi no hon) = my book, 日本の文化 = Japan's culture." },
        { title: "い vs な Adjectives", content: "い-adjectives end in い and conjugate: 高い→高くない. な-adjectives need な before nouns: 静かな部屋 (quiet room)." },
        { title: "Giving & Receiving", content: "Japanese has different verbs for giving depending on direction: あげる (give away from me), くれる (give toward me), もらう (receive)." },
        { title: "Passive Voice", content: "The passive in Japanese often expresses being adversely affected: 雨に降られた (I was rained on - it inconvenienced me)." },
        { title: "もう vs まだ", content: "もう (mou) = already/anymore, まだ (mada) = still/not yet. もう食べた? (Already ate?) まだ食べてない (Haven't eaten yet)." },
    ];

    // Get word of the day and fact of the day (consistent for the day)
    useEffect(() => {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

        if (vocabulary.length > 0) {
            const wordIndex = seed % vocabulary.length;
            setWordOfDay(vocabulary[wordIndex]);
        }

        // Different seed for fact to avoid correlation
        const factIndex = (seed * 7) % japaneseFacts.length;
        setDidYouKnow(japaneseFacts[factIndex]);
    }, [vocabulary]);

    const handleAddWords = () => {
        Storage.addExtraWords(5);
        onRefresh();
    };

    // Play audio for word of day
    const playAudio = (word) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            // Try to get a better voice
            const voices = speechSynthesis.getVoices();
            const japaneseVoice = voices.find(v => v.lang.includes('ja')) || voices[0];
            if (japaneseVoice) utterance.voice = japaneseVoice;
            speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="dashboard">
            {/* Large Study/Quiz Buttons */}
            <div className="main-action-buttons">
                <button className="main-action-btn study" onClick={onStartStudy}>
                    <span className="main-action-icon">📖</span>
                    <span className="main-action-label">Study</span>
                    <span className="main-action-count">{newWordsAvailable} new</span>
                </button>
                <button className="main-action-btn quiz" onClick={onStartQuiz}>
                    <span className="main-action-icon">✍️</span>
                    <span className="main-action-label">Quiz</span>
                    <span className="main-action-count">{quizAvailable} cards</span>
                </button>
            </div>

            {/* Progress Overview */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="card-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">Progress to {WORD_GOAL} Words</h3>
                        {stats.streak > 0 && (
                            <div className="streak-badge">
                                <span>🔥</span>
                                <span>{stats.streak} day{stats.streak !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stackCounts.known}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>/ {WORD_GOAL}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
                        {progressPercent}% complete
                    </p>
                </div>
            </div>

            {/* Stack Overview - Clickable */}
            <div className="stats-grid clickable-stats" style={{ marginBottom: 'var(--space-lg)' }}>
                <div
                    className="stat-card stat-card-clickable"
                    onClick={() => onNavigateToLibrary('unlearned')}
                    title="Click to view in Library"
                >
                    <div className="stat-value">{stackCounts.unlearned}</div>
                    <div className="stat-label">Unlearned</div>
                </div>
                <div
                    className="stat-card stat-card-clickable"
                    onClick={() => onNavigateToLibrary('learning')}
                    title="Click to view in Library"
                >
                    <div className="stat-value warning">{stackCounts.learning}</div>
                    <div className="stat-label">Learning</div>
                </div>
                <div
                    className="stat-card stat-card-clickable"
                    onClick={() => onNavigateToLibrary('known')}
                    title="Click to view in Library"
                >
                    <div className="stat-value success">{stackCounts.known}</div>
                    <div className="stat-label">Known</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{trulyDueCount}</div>
                    <div className="stat-label">Due Today</div>
                </div>
            </div>

            {/* Word of the Day */}
            {wordOfDay && (
                <div className="card word-of-day-card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div className="card-header">
                        <h3 className="card-title">Word of the Day</h3>
                    </div>
                    <div className="word-of-day">
                        <div className="wod-main">
                            <span className="wod-kanji japanese">{wordOfDay.word}</span>
                            <button
                                className="btn-audio"
                                onClick={() => playAudio(wordOfDay.word)}
                                title="Play pronunciation"
                            >
                                🔊
                            </button>
                        </div>
                        <div className="wod-reading japanese">{wordOfDay.reading}</div>
                        <div className="wod-meaning">{wordOfDay.meaning}</div>
                    </div>
                </div>
            )}

            {/* Did You Know */}
            {didYouKnow && (
                <div className="card did-you-know-card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div className="card-header">
                        <h3 className="card-title">Did You Know?</h3>
                    </div>
                    <div className="did-you-know">
                        <div className="dyk-title">{didYouKnow.title}</div>
                        <div className="dyk-content">{didYouKnow.content}</div>
                    </div>
                </div>
            )}

            {/* Today's Stats */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="card-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">Today's Activity</h3>
                        <button
                            className="btn btn-ghost"
                            onClick={handleAddWords}
                            style={{ padding: 'var(--space-xs) var(--space-sm)', fontSize: '0.8125rem' }}
                        >
                            +5 Words
                        </button>
                    </div>
                </div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.todayNewWords}</div>
                        <div className="stat-label">Words Studied</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.todayReviews}</div>
                        <div className="stat-label">Reviews Done</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

window.Dashboard = Dashboard;
