// Settings Component

const { useState } = React;

const Settings = ({ settings, onSaveSettings, stats }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportData, setExportData] = useState('');

    const handleChange = (key, value) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);
        onSaveSettings(newSettings);
    };

    const handleNumberChange = (key, value) => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0) {
            handleChange(key, num);
        }
    };

    // Export data
    const handleExport = () => {
        const data = Storage.exportData();
        setExportData(JSON.stringify(data, null, 2));
        setShowExportModal(true);
    };

    // Copy export data
    const handleCopyExport = () => {
        navigator.clipboard.writeText(exportData);
        alert('Data copied to clipboard!');
    };

    // Download export data
    const handleDownloadExport = () => {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nihongo-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Import data
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                Storage.importData(data);
                alert('Data imported successfully! Please refresh the page.');
                window.location.reload();
            } catch (err) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    };

    // Reset all data
    const handleReset = () => {
        Storage.clearAll();
        setShowResetModal(false);
        alert('All data has been reset. Refreshing page...');
        window.location.reload();
    };

    return (
        <div className="settings">
            {/* Study Settings */}
            <section className="settings-section">
                <h3>Study Settings</h3>

                <div className="setting-row">
                    <div>
                        <div className="setting-label">Daily New Words</div>
                        <div className="setting-description">How many new words to introduce each day</div>
                    </div>
                    <input
                        type="number"
                        className="input setting-input"
                        value={localSettings.dailyNewWords}
                        onChange={(e) => handleNumberChange('dailyNewWords', e.target.value)}
                        min="0"
                        max="50"
                    />
                </div>

                <div className="setting-row">
                    <div>
                        <div className="setting-label">Max Daily Reviews</div>
                        <div className="setting-description">Maximum reviews per day (0 = unlimited)</div>
                    </div>
                    <input
                        type="number"
                        className="input setting-input"
                        value={localSettings.maxDailyReviews}
                        onChange={(e) => handleNumberChange('maxDailyReviews', e.target.value)}
                        min="0"
                    />
                </div>

                <div className="setting-row">
                    <div>
                        <div className="setting-label">Graduation Threshold</div>
                        <div className="setting-description">Correct reviews needed to mark a word as "known"</div>
                    </div>
                    <input
                        type="number"
                        className="input setting-input"
                        value={localSettings.graduationThreshold}
                        onChange={(e) => handleNumberChange('graduationThreshold', e.target.value)}
                        min="1"
                        max="20"
                    />
                </div>
            </section>

            {/* Quiz Settings */}
            <section className="settings-section">
                <h3>Quiz Settings</h3>

                <div className="setting-row">
                    <div>
                        <div className="setting-label">Quiz Direction</div>
                        <div className="setting-description">How questions are presented</div>
                    </div>
                    <select
                        className="input setting-select"
                        value={localSettings.quizDirection}
                        onChange={(e) => handleChange('quizDirection', e.target.value)}
                    >
                        <option value="both">Both Directions</option>
                        <option value="jp-to-en">Japanese → English</option>
                        <option value="en-to-jp">English → Japanese</option>
                    </select>
                </div>

                <div className="setting-row">
                    <div>
                        <div className="setting-label">Show Furigana</div>
                        <div className="setting-description">Display reading hints above kanji</div>
                    </div>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            checked={localSettings.showFurigana}
                            onChange={(e) => handleChange('showFurigana', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-row">
                    <div>
                        <div className="setting-label">Show Example Sentences</div>
                        <div className="setting-description">Display sentences when reviewing</div>
                    </div>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            checked={localSettings.showSentences}
                            onChange={(e) => handleChange('showSentences', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </section>

            {/* Statistics */}
            <section className="settings-section">
                <h3>Statistics</h3>
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalWordsLearned}</div>
                            <div className="stat-label">Words Learned</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalReviews}</div>
                            <div className="stat-label">Total Reviews</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.streak}</div>
                            <div className="stat-label">Day Streak</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Management */}
            <section className="settings-section">
                <h3>Data Management</h3>

                <div className="setting-row">
                    <div>
                        <div className="setting-label">Export Data</div>
                        <div className="setting-description">Download your progress as a backup file</div>
                    </div>
                    <button className="btn btn-secondary" onClick={handleExport}>
                        Export
                    </button>
                </div>

                <div className="setting-row">
                    <div>
                        <div className="setting-label">Import Data</div>
                        <div className="setting-description">Restore from a backup file</div>
                    </div>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                        Import
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                <div className="setting-row">
                    <div>
                        <div className="setting-label">Reset All Data</div>
                        <div className="setting-description">Clear all progress and settings (cannot be undone!)</div>
                    </div>
                    <button className="btn btn-error" onClick={() => setShowResetModal(true)}>
                        Reset
                    </button>
                </div>
            </section>

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Reset All Data?</h3>
                        <div className="modal-content">
                            <p>This will permanently delete all your progress, mnemonics, and settings. This action cannot be undone.</p>
                            <p style={{ marginTop: 'var(--space-md)', fontWeight: '500' }}>Are you sure?</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowResetModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-error" onClick={handleReset}>
                                Yes, Reset Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <h3 className="modal-title">Export Data</h3>
                        <div className="modal-content">
                            <textarea
                                className="input"
                                style={{ width: '100%', height: '200px', fontFamily: 'monospace', fontSize: '0.75rem' }}
                                value={exportData}
                                readOnly
                            />
                        </div>
                        <div className="modal-actions" style={{ flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary" onClick={handleCopyExport}>
                                Copy to Clipboard
                            </button>
                            <button className="btn btn-primary" onClick={handleDownloadExport}>
                                Download File
                            </button>
                        </div>
                        <button
                            className="btn btn-ghost"
                            onClick={() => setShowExportModal(false)}
                            style={{ marginTop: 'var(--space-md)', width: '100%' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

window.Settings = Settings;
