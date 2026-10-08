import React, { useRef, useState } from 'react';
import {
    Settings,
    Download,
    Upload,
    Trash2,
    RefreshCw,
    FileJson,
    FileSpreadsheet,
    AlertTriangle,
    CheckCircle,
    Keyboard,
} from 'lucide-react';
import { useCompetitors } from '../hooks/useCompetitors';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
    exportToJson,
    exportToCsv,
    downloadFile,
    parseImportedJson,
    readFileAsText,
} from '../utils/export';

const SettingsPage: React.FC = () => {
    const { competitors, userProfile, updateUserProfile, rawStorageRecovery, snapshots, resetToSeedData, clearAllData, importData } = useCompetitors();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleExportJson = () => {
        const content = exportToJson(competitors, userProfile, snapshots);
        const filename = `competitor-stalker-export-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(content, filename, 'application/json');
        toast.success('Data exported as JSON');
    };

    const handleExportCsv = () => {
        const content = exportToCsv(competitors);
        const filename = `competitors-${new Date().toISOString().split('T')[0]}.csv`;
        downloadFile(content, filename, 'text/csv');
        toast.success('Competitors exported as CSV');
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const content = await readFileAsText(file);
            const data = parseImportedJson(content);

            if (!data) {
                toast.error('Invalid file format. Please use a valid JSON export.');
                return;
            }

            // Import the data
            if (data.snapshots === undefined) importData(data.competitors, data.userProfile);
            else importData(data.competitors, data.userProfile, data.snapshots);
            toast.success(`Imported ${data.competitors.length} competitors successfully!`);
        } catch {
            toast.error('Failed to read file');
        } finally {
            // Allow the same file to be selected again after failure or success.
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleClearData = () => {
        clearAllData();
        setShowClearConfirm(false);
        toast.success('All data cleared');
    };

    const handleResetToSeed = () => {
        resetToSeedData();
        setShowResetConfirm(false);
        toast.success('Reset to sample data');
    };

    return (
        <div className="settings-page space-y-8 animate-fade-in max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="workspace-title flex items-center gap-3">
                    <Settings className="w-7 h-7 text-[var(--accent-brand)]" />
                    Settings
                </h1>
                <p className="text-[var(--text-muted)] mt-1">
                    Manage your data and preferences
                </p>
            </div>

            <section className="surface-card p-6">
                <h2 className="text-lg font-semibold mb-4">Your Business</h2>
                <Input label="Your business name" value={userProfile.name} onChange={event => updateUserProfile({ name: event.target.value })} />
            </section>

            {rawStorageRecovery && Object.keys(rawStorageRecovery).length > 0 && (
                <section className="surface-card p-6">
                    <h2 className="text-lg font-semibold mb-4">Recover Original Storage</h2>
                    <p className="text-sm text-[var(--text-muted)] mb-4">Download the unread original records before replacing data. This recovery file preserves the original text for repair; it is separate from a normal workspace backup.</p>
                    <Button variant="secondary" onClick={() => downloadFile(JSON.stringify(rawStorageRecovery, null, 2), 'stalker-original-storage.json', 'application/json')}>Download original storage</Button>
                </section>
            )}

            {/* Export */}
            <section className="surface-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Data
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                    Download your competitive intelligence data for backup or analysis.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={handleExportJson}>
                        <FileJson className="w-4 h-4" />
                        Export as JSON
                    </Button>
                    <Button variant="secondary" onClick={handleExportCsv}>
                        <FileSpreadsheet className="w-4 h-4" />
                        Export as CSV
                    </Button>
                </div>
            </section>

            {/* Import */}
            <section className="surface-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Import Data
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                    Import replaces competitors and your business profile. Full backups also replace history; older files without history keep existing snapshots. Export a backup first.
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" />
                    Choose JSON File
                </Button>
            </section>

            {/* Data Overview */}
            <section className="surface-card p-6">
                <h2 className="text-lg font-semibold mb-4">Data Overview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
                        <div className="text-2xl font-semibold data-mono">{competitors.length}</div>
                        <div className="text-sm text-[var(--text-muted)]">Competitors</div>
                    </div>
                    <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
                        <div className="text-2xl font-semibold data-mono">
                            {competitors.filter(c => c.threatLevel === 'High').length}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">High Threats</div>
                    </div>
                    <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
                        <div className="text-2xl font-semibold data-mono">
                            {competitors.reduce((acc, c) => acc + (c.weaknesses?.length || 0), 0)}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">Weaknesses</div>
                    </div>
                    <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
                        <div className="text-2xl font-semibold data-mono">
                            {competitors.reduce((acc, c) => acc + (c.strategies?.length || 0), 0)}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">Strategies</div>
                    </div>
                </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section className="surface-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Keyboard className="w-5 h-5" />
                    Keyboard Shortcuts
                </h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)]">Open Search</span>
                        <kbd className="px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-sm">
                            ⌘K
                        </kbd>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)]">Close Modal</span>
                        <kbd className="px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-sm">
                            Escape
                        </kbd>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-[var(--text-secondary)]">Navigate Search Results</span>
                        <div className="flex gap-1">
                            <kbd className="px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-sm">↑</kbd>
                            <kbd className="px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-sm">↓</kbd>
                        </div>
                    </div>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="surface-card p-6 border-[var(--accent-danger)]">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--accent-danger)]">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                </h2>

                {/* Reset to Sample Data */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-[var(--border-subtle)]">
                    <div>
                        <div className="font-medium">Reset to Sample Data</div>
                        <div className="text-sm text-[var(--text-muted)]">
                            Replace competitors and your profile with sample data, and delete saved history
                        </div>
                    </div>
                    {showResetConfirm ? (
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setShowResetConfirm(false)}>
                                Cancel
                            </Button>
                            <Button size="sm" variant="danger" onClick={handleResetToSeed}>
                                <CheckCircle className="w-4 h-4" />
                                Confirm
                            </Button>
                        </div>
                    ) : (
                        <Button variant="secondary" onClick={() => setShowResetConfirm(true)}>
                            <RefreshCw className="w-4 h-4" />
                            Reset
                        </Button>
                    )}
                </div>

                {/* Clear All Data */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                    <div>
                        <div className="font-medium">Clear All Data</div>
                        <div className="text-sm text-[var(--text-muted)]">
                            Permanently delete all competitors, profile settings and saved history
                        </div>
                    </div>
                    {showClearConfirm ? (
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setShowClearConfirm(false)}>
                                Cancel
                            </Button>
                            <Button size="sm" variant="danger" onClick={handleClearData}>
                                <Trash2 className="w-4 h-4" />
                                Delete All
                            </Button>
                        </div>
                    ) : (
                        <Button variant="danger" onClick={() => setShowClearConfirm(true)}>
                            <Trash2 className="w-4 h-4" />
                            Clear
                        </Button>
                    )}
                </div>
            </section>

            {/* Footer */}
            <div className="text-center text-sm text-[var(--text-muted)] pb-8">
                <p>Competitor Stalker v1.0.0</p>
                <p>Data is stored locally in your browser</p>
            </div>
        </div>
    );
};

export default SettingsPage;
