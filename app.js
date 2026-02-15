/* ========================================
   ENGRAM - 暗記学習アプリ JavaScript
   ======================================== */

(function () {
    'use strict';

    // ==================== UTILITY ====================
    function uuid() {
        return 'xxxx-xxxx-4xxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        }) + '-' + Date.now().toString(36);
    }

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function formatDate(ts) {
        const d = new Date(ts);
        return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    }

    // Backward-compatible helper: returns sub-tags as array (handles old subTag string + new subTags array)
    function getCardSubTags(card) {
        if (Array.isArray(card.subTags)) return card.subTags.filter(Boolean);
        if (card.subTag) return [card.subTag];
        return [];
    }

    // Cloze card helpers
    function isCloze(card) {
        return card.type === 'cloze';
    }

    function detectClozeFromCSV(front, back) {
        const words = back.split(';').map(w => w.trim()).filter(Boolean);
        if (words.length === 0) return false;
        return words.every(word => front.includes(word));
    }

    function getClozeWords(card) {
        return card.back.split(';').map(w => w.trim()).filter(Boolean);
    }

    // ==================== I18N ====================
    const STORAGE_KEY_LANG = 'engram_lang';

    const i18n = {
        ja: {
            myDecks: 'My Decks', createNewCard: '新規カード作成',
            noCardsYet: 'まだカードがありません', createFirstCard: '最初のカードを作成',
            studyNow: 'Study Now', studies: 'Studies', noCards: 'カードがありません',
            cardList: 'カード一覧', allFilter: 'すべて',
            createCard: 'カード作成', editCard: 'カード編集', save: '保存',
            questionFront: '問題（表面）', answerBack: '解答（裏面）',
            enterQuestion: '問題を入力...', enterAnswer: '解答を入力...',
            mainTag: 'メインタグ', subTag: 'サブタグ',
            mainTagExample: '例: 英語', subTagExample: '例: 文法',
            deleteThisCard: 'このカードを削除',
            tagManagement: 'タグ管理', mainTags: 'メインタグ', subTags: 'サブタグ',
            batchReplaceTag: 'タグの一斉置き換え', tagType: '対象タグ種別',
            tagBefore: '変更前のタグ', tagAfter: '変更後のタグ',
            newTagName: '新しいタグ名', executeReplace: '置き換え実行',
            openTagManagement: 'タグ管理を開く',
            noTags: 'タグがありません', noSubTags: 'サブタグがありません',
            quizSetup: 'クイズ設定', all: 'すべて', numberOfQuestions: '問題数',
            questionOrder: '出題順', random: 'ランダム', sequential: '順番通り',
            hardFirst: '苦手優先', targetCards: '対象カード', cardsUnit: '枚',
            startQuiz: 'クイズ開始', showAnswer: 'Show Answer',
            quizResult: 'クイズ結果', correctRate: '正答率', totalQuestions: '総問題数',
            tryAgain: 'もう一度', backToHome: 'ホームへ戻る',
            analytics: '学習分析', totalCards: '総カード数', quizCount: 'クイズ回数',
            avgCorrectRate: '平均正答率', scoreByTag: 'タグ別成績',
            recentHistory: '最近のクイズ履歴',
            noQuizYet: 'まだクイズを受けていません', noHistory: '履歴がありません',
            settings: '設定', languageSetting: '言語設定', themeSetting: 'カラーテーマ',
            dataManagement: 'データ管理', exportData: 'データをエクスポート',
            importData: 'データをインポート', deleteAllData: '全データを削除',
            appSubtitle: '暗記学習アプリ',
            navHome: 'ホーム', navQuiz: 'クイズ', navAnalytics: '分析', navSettings: '設定',
            cancel: 'キャンセル', confirm: '確認',
            toastCardAdded: 'カードを追加しました', toastCardUpdated: 'カードを更新しました',
            toastCardDeleted: 'カードを削除しました',
            toastEnterQuestion: '問題テキストを入力してください',
            toastEnterAnswer: '解答テキストを入力してください',
            toastExported: 'データをエクスポートしました',
            toastImported: 'データをインポートしました',
            toastImportFailed: 'インポートに失敗しました',
            toastAllDeleted: '全データを削除しました',
            toastSelectTagBefore: '変更前のタグを選択してください',
            toastEnterNewTag: '変更後のタグ名を入力してください',
            toastTagsReplaced: '枚のカードのタグを変更しました',
            toastNoCards: '対象カードがありません',
            toastNoCardsInDeck: 'カードがありません',
            toastLangChanged: '言語を日本語に変更しました',
            confirmDeleteCard: 'このカードを削除しますか？',
            confirmImport: 'インポートすると現在のデータが上書きされます。続行しますか？',
            confirmDeleteAll: 'すべてのデータを削除しますか？この操作は元に戻せません。',
            uncategorized: '未分類',
            // Auth
            account: 'アカウント',
            loginDesc: 'Googleアカウントでログインしてデータを同期',
            googleLogin: 'Googleでログイン',
            logout: 'ログアウト',
            synced: '同期済み',
            syncing: '同期中...',
            toastLoggedIn: 'ログインしました',
            toastLoggedOut: 'ログアウトしました',
            toastLoginFailed: 'ログインに失敗しました',
            toastMigrated: 'ローカルデータをクラウドに移行しました',
            confirmMigrate: 'ローカルデータをクラウドにアップロードしますか？',
            confirmQuitQuiz: 'クイズを中断しますか？',
            // Cloze
            qaMode: '一問一答', clozeMode: '穴埋め',
            clozeText: '文章', clozeWords: '穴埋め単語（;区切り）',
            clozePlaceholderText: '文章を入力...',
            clozePlaceholderWords: '穴にする単語を;区切りで入力...',
            toastClozeWordNotFound: '穴埋め単語が文章内に見つかりません: ',
            tapToReveal: 'タップして解答',
            toastEnterClozeText: '文章を入力してください',
            toastEnterClozeWords: '穴埋め単語を入力してください',
        },
        en: {
            myDecks: 'My Decks', createNewCard: 'Create New Card',
            noCardsYet: 'No cards yet', createFirstCard: 'Create First Card',
            studyNow: 'Study Now', studies: 'Studies', noCards: 'No cards',
            cardList: 'Card List', allFilter: 'All',
            createCard: 'Create Card', editCard: 'Edit Card', save: 'Save',
            questionFront: 'Question (Front)', answerBack: 'Answer (Back)',
            enterQuestion: 'Enter question...', enterAnswer: 'Enter answer...',
            mainTag: 'Main Tag', subTag: 'Sub Tag',
            mainTagExample: 'e.g. English', subTagExample: 'e.g. Grammar',
            deleteThisCard: 'Delete This Card',
            tagManagement: 'Tag Management', mainTags: 'Main Tags', subTags: 'Sub Tags',
            batchReplaceTag: 'Batch Replace Tags', tagType: 'Tag Type',
            tagBefore: 'Original Tag', tagAfter: 'New Tag',
            newTagName: 'New tag name', executeReplace: 'Replace',
            openTagManagement: 'Open Tag Manager',
            noTags: 'No tags', noSubTags: 'No sub tags',
            quizSetup: 'Quiz Setup', all: 'All', numberOfQuestions: 'Number of Questions',
            questionOrder: 'Question Order', random: 'Random', sequential: 'Sequential',
            hardFirst: 'Hardest First', targetCards: 'Target cards', cardsUnit: '',
            startQuiz: 'Start Quiz', showAnswer: 'Show Answer',
            quizResult: 'Quiz Result', correctRate: 'Correct Rate', totalQuestions: 'Total',
            tryAgain: 'Try Again', backToHome: 'Back to Home',
            analytics: 'Analytics', totalCards: 'Total Cards', quizCount: 'Quizzes',
            avgCorrectRate: 'Avg. Score', scoreByTag: 'Score by Tag',
            recentHistory: 'Recent Quiz History',
            noQuizYet: 'No quizzes taken yet', noHistory: 'No history',
            settings: 'Settings', languageSetting: 'Language', themeSetting: 'Color Theme',
            dataManagement: 'Data Management', exportData: 'Export Data',
            importData: 'Import Data', deleteAllData: 'Delete All Data',
            appSubtitle: 'Flashcard Study App',
            navHome: 'Home', navQuiz: 'Quiz', navAnalytics: 'Analytics', navSettings: 'Settings',
            cancel: 'Cancel', confirm: 'Confirm',
            toastCardAdded: 'Card added', toastCardUpdated: 'Card updated',
            toastCardDeleted: 'Card deleted',
            toastEnterQuestion: 'Please enter a question',
            toastEnterAnswer: 'Please enter an answer',
            toastExported: 'Data exported', toastImported: 'Data imported',
            toastImportFailed: 'Import failed', toastAllDeleted: 'All data deleted',
            toastSelectTagBefore: 'Select the original tag',
            toastEnterNewTag: 'Enter the new tag name',
            toastTagsReplaced: ' card(s) tag replaced',
            toastNoCards: 'No cards available',
            toastNoCardsInDeck: 'No cards in deck',
            toastLangChanged: 'Language changed to English',
            confirmDeleteCard: 'Delete this card?',
            confirmImport: 'Import will overwrite current data. Continue?',
            confirmDeleteAll: 'Delete all data? This cannot be undone.',
            uncategorized: 'Uncategorized',
            // Auth
            account: 'Account',
            loginDesc: 'Sign in with Google to sync data across devices',
            googleLogin: 'Sign in with Google',
            logout: 'Sign Out',
            synced: 'Synced',
            syncing: 'Syncing...',
            toastLoggedIn: 'Signed in',
            toastLoggedOut: 'Signed out',
            toastLoginFailed: 'Sign in failed',
            toastMigrated: 'Local data uploaded to cloud',
            confirmMigrate: 'Upload local data to cloud?',
            confirmQuitQuiz: 'Quit the quiz?',
            // Cloze
            qaMode: 'Q&A', clozeMode: 'Fill-in',
            clozeText: 'Text', clozeWords: 'Blank words (;separated)',
            clozePlaceholderText: 'Enter text...',
            clozePlaceholderWords: 'Enter words to blank out, separated by ;',
            toastClozeWordNotFound: 'Blank word not found in text: ',
            tapToReveal: 'Tap to reveal',
            toastEnterClozeText: 'Please enter the text',
            toastEnterClozeWords: 'Please enter blank words',
        }
    };

    const STORAGE_KEY_THEME = 'engram_theme';
    let currentLang = localStorage.getItem(STORAGE_KEY_LANG) || 'ja';

    function t(key) {
        return (i18n[currentLang] && i18n[currentLang][key]) || (i18n['ja'][key]) || key;
    }

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY_LANG, lang);
        document.documentElement.lang = lang;
        applyI18n();
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        renderHome();
        if (currentScreen === 'screen-analytics') renderAnalytics();
        if (currentScreen === 'screen-tags') renderTagManagement();
        if (currentScreen === 'screen-quiz-setup') renderQuizSetup();
    }

    function setTheme(theme) {
        localStorage.setItem(STORAGE_KEY_THEME, theme);
        if (theme === 'blue') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    // Apply saved theme on load
    (function () {
        const saved = localStorage.getItem(STORAGE_KEY_THEME) || 'blue';
        setTheme(saved);
    })();

    function applyI18n() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = t(el.dataset.i18nPlaceholder);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = t(el.dataset.i18nTitle);
        });
    }

    // ==================== DATA STORE ====================
    const STORAGE_KEY_CARDS = 'engram_cards';
    const STORAGE_KEY_RESULTS = 'engram_results';

    // In-memory cache for cards and results (used by both local and cloud modes)
    let cachedCards = [];
    let cachedResults = [];
    let isCloudMode = false;
    let currentUserId = null;
    let unsubCards = null;
    let unsubResults = null;

    const Store = {
        // ---- Read (always from cache) ----
        getCards() { return cachedCards; },
        getResults() { return cachedResults; },

        // ---- Write ----
        saveCards(cards) {
            cachedCards = cards;
            if (isCloudMode) {
                // Firestore batch update — we write individual docs
                // This is called for bulk operations (replaceTag, import, etc.)
                this._syncCardsToFirestore(cards);
            } else {
                localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
            }
        },
        saveResults(results) {
            cachedResults = results;
            if (isCloudMode) {
                // Results are typically only added, not bulk-replaced
            } else {
                localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
            }
        },

        addCard(card) {
            cachedCards.push(card);
            if (isCloudMode) {
                setSyncStatus('syncing');
                db.collection('users').doc(currentUserId).collection('cards').doc(card.id).set(card)
                    .then(() => setSyncStatus('synced'))
                    .catch(err => { console.error(err); setSyncStatus('synced'); });
            } else {
                localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cachedCards));
            }
        },

        updateCard(id, updates) {
            const idx = cachedCards.findIndex(c => c.id === id);
            if (idx !== -1) {
                // Remove undefined values from updates
                const cleanUpdates = {};
                for (const key in updates) {
                    if (updates[key] !== undefined) cleanUpdates[key] = updates[key];
                }
                cachedCards[idx] = { ...cachedCards[idx], ...cleanUpdates };
                // Also remove legacy subTag field from cache
                if ('subTags' in cleanUpdates) delete cachedCards[idx].subTag;
                if (isCloudMode) {
                    setSyncStatus('syncing');
                    // For Firestore, explicitly delete the legacy subTag field
                    const firestoreUpdates = { ...cleanUpdates };
                    if ('subTags' in firestoreUpdates) {
                        firestoreUpdates.subTag = firebase.firestore.FieldValue.delete();
                    }
                    db.collection('users').doc(currentUserId).collection('cards').doc(id).update(firestoreUpdates)
                        .then(() => setSyncStatus('synced'))
                        .catch(err => { console.error(err); setSyncStatus('synced'); });
                } else {
                    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cachedCards));
                }
            }
        },

        deleteCard(id) {
            cachedCards = cachedCards.filter(c => c.id !== id);
            if (isCloudMode) {
                setSyncStatus('syncing');
                db.collection('users').doc(currentUserId).collection('cards').doc(id).delete()
                    .then(() => setSyncStatus('synced'))
                    .catch(err => { console.error(err); setSyncStatus('synced'); });
            } else {
                localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cachedCards));
            }
        },

        addResult(result) {
            cachedResults.push(result);
            if (isCloudMode) {
                setSyncStatus('syncing');
                db.collection('users').doc(currentUserId).collection('results').doc(result.id).set(result)
                    .then(() => setSyncStatus('synced'))
                    .catch(err => { console.error(err); setSyncStatus('synced'); });
            } else {
                localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(cachedResults));
            }
        },

        getMainTags() {
            const tags = new Set();
            cachedCards.forEach(c => { if (c.mainTag) tags.add(c.mainTag); });
            return [...tags].sort();
        },
        getSubTags() {
            const tags = new Set();
            cachedCards.forEach(c => {
                getCardSubTags(c).forEach(st => tags.add(st));
            });
            return [...tags].sort();
        },
        getSubTagsForMain(mainTag) {
            const tags = new Set();
            cachedCards.forEach(c => {
                if (c.mainTag === mainTag) {
                    getCardSubTags(c).forEach(st => tags.add(st));
                }
            });
            return [...tags].sort();
        },

        replaceTag(type, from, to) {
            let count = 0;
            cachedCards.forEach(c => {
                if (type === 'main' && c.mainTag === from) { c.mainTag = to; count++; }
                if (type === 'sub') {
                    const st = getCardSubTags(c);
                    const idx = st.indexOf(from);
                    if (idx !== -1) { st[idx] = to; c.subTags = st; delete c.subTag; count++; }
                }
            });
            // Save all modified cards
            if (isCloudMode) {
                this._syncCardsToFirestore(cachedCards);
            } else {
                localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cachedCards));
            }
            return count;
        },

        getCardsByMainTag(mainTag) {
            return cachedCards.filter(c => c.mainTag === mainTag);
        },

        exportData() {
            return JSON.stringify({
                cards: cachedCards,
                results: cachedResults,
                exportedAt: Date.now()
            }, null, 2);
        },

        importData(json) {
            const data = JSON.parse(json);
            if (data.cards) {
                cachedCards = data.cards;
                if (isCloudMode) {
                    this._syncCardsToFirestore(data.cards);
                } else {
                    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cachedCards));
                }
            }
            if (data.results) {
                cachedResults = data.results;
                if (isCloudMode) {
                    this._syncResultsToFirestore(data.results);
                } else {
                    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(cachedResults));
                }
            }
        },

        clearAll() {
            cachedCards = [];
            cachedResults = [];
            if (isCloudMode) {
                this._deleteAllFirestoreData();
            } else {
                localStorage.removeItem(STORAGE_KEY_CARDS);
                localStorage.removeItem(STORAGE_KEY_RESULTS);
            }
        },

        // ---- Firestore helpers ----
        _syncCardsToFirestore(cards) {
            if (!currentUserId) return;
            setSyncStatus('syncing');
            const col = db.collection('users').doc(currentUserId).collection('cards');
            const batch = db.batch();
            cards.forEach(card => {
                batch.set(col.doc(card.id), card);
            });
            batch.commit()
                .then(() => setSyncStatus('synced'))
                .catch(err => { console.error(err); setSyncStatus('synced'); });
        },

        _syncResultsToFirestore(results) {
            if (!currentUserId) return;
            setSyncStatus('syncing');
            const col = db.collection('users').doc(currentUserId).collection('results');
            const batch = db.batch();
            results.forEach(r => {
                batch.set(col.doc(r.id), r);
            });
            batch.commit()
                .then(() => setSyncStatus('synced'))
                .catch(err => { console.error(err); setSyncStatus('synced'); });
        },

        _deleteAllFirestoreData() {
            if (!currentUserId) return;
            setSyncStatus('syncing');
            const userDoc = db.collection('users').doc(currentUserId);
            // Delete cards
            userDoc.collection('cards').get().then(snap => {
                const batch = db.batch();
                snap.docs.forEach(doc => batch.delete(doc.ref));
                return batch.commit();
            }).catch(console.error);
            // Delete results
            userDoc.collection('results').get().then(snap => {
                const batch = db.batch();
                snap.docs.forEach(doc => batch.delete(doc.ref));
                return batch.commit();
            }).then(() => setSyncStatus('synced')).catch(console.error);
        },

        // ---- Load from localStorage ----
        loadFromLocal() {
            try { cachedCards = JSON.parse(localStorage.getItem(STORAGE_KEY_CARDS)) || []; }
            catch { cachedCards = []; }
            try { cachedResults = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS)) || []; }
            catch { cachedResults = []; }
        }
    };

    // ==================== FIREBASE AUTH ====================
    function setSyncStatus(status) {
        const dot = document.querySelector('.sync-dot');
        const text = document.getElementById('sync-status-text');
        if (!dot || !text) return;

        if (status === 'syncing') {
            dot.className = 'sync-dot syncing';
            text.textContent = t('syncing');
        } else {
            dot.className = 'sync-dot synced';
            text.textContent = t('synced');
        }
    }

    function updateAuthUI(user) {
        const loggedOut = document.getElementById('account-logged-out');
        const loggedIn = document.getElementById('account-logged-in');
        if (!loggedOut || !loggedIn) return;

        if (user) {
            loggedOut.style.display = 'none';
            loggedIn.style.display = 'block';
            document.getElementById('account-name').textContent = user.displayName || '';
            document.getElementById('account-email').textContent = user.email || '';
            const avatar = document.getElementById('account-avatar');
            if (user.photoURL) {
                avatar.src = user.photoURL;
                avatar.style.display = 'block';
            } else {
                avatar.style.display = 'none';
            }
        } else {
            loggedOut.style.display = 'block';
            loggedIn.style.display = 'none';
        }
    }

    function startFirestoreSync(uid) {
        // Unsubscribe previous listeners
        if (unsubCards) unsubCards();
        if (unsubResults) unsubResults();

        const userDoc = db.collection('users').doc(uid);

        // Listen to cards
        unsubCards = userDoc.collection('cards').onSnapshot(snap => {
            cachedCards = snap.docs.map(doc => doc.data());
            renderHome();
            // Refresh current screen if needed
            if (currentScreen === 'screen-analytics') renderAnalytics();
            if (currentScreen === 'screen-tags') renderTagManagement();
        }, err => console.error('Cards sync error:', err));

        // Listen to results
        unsubResults = userDoc.collection('results').onSnapshot(snap => {
            cachedResults = snap.docs.map(doc => doc.data());
            if (currentScreen === 'screen-analytics') renderAnalytics();
        }, err => console.error('Results sync error:', err));
    }

    function stopFirestoreSync() {
        if (unsubCards) { unsubCards(); unsubCards = null; }
        if (unsubResults) { unsubResults(); unsubResults = null; }
    }

    async function migrateLocalToFirestore(uid) {
        // Check if localStorage has data
        let localCards = [];
        let localResults = [];
        try { localCards = JSON.parse(localStorage.getItem(STORAGE_KEY_CARDS)) || []; } catch { }
        try { localResults = JSON.parse(localStorage.getItem(STORAGE_KEY_RESULTS)) || []; } catch { }

        if (localCards.length === 0 && localResults.length === 0) return;

        // Check if Firestore already has data
        const userDoc = db.collection('users').doc(uid);
        const existingCards = await userDoc.collection('cards').limit(1).get();
        if (!existingCards.empty) return; // Already has cloud data

        const confirmed = await showConfirm(t('confirmMigrate'));
        if (!confirmed) return;

        setSyncStatus('syncing');

        // Upload cards
        if (localCards.length > 0) {
            const cardCol = userDoc.collection('cards');
            const batch = db.batch();
            localCards.forEach(card => {
                batch.set(cardCol.doc(card.id), card);
            });
            await batch.commit();
        }

        // Upload results
        if (localResults.length > 0) {
            const resultCol = userDoc.collection('results');
            const batch = db.batch();
            localResults.forEach(r => {
                batch.set(resultCol.doc(r.id), r);
            });
            await batch.commit();
        }

        setSyncStatus('synced');
        showToast(t('toastMigrated'));
    }

    async function googleLogin() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            // onAuthStateChanged will handle the rest
        } catch (err) {
            console.error('Login error:', err);
            showToast(t('toastLoginFailed'));
        }
    }

    async function googleLogout() {
        stopFirestoreSync();
        await auth.signOut();
        isCloudMode = false;
        currentUserId = null;
        // Reload from localStorage
        Store.loadFromLocal();
        updateAuthUI(null);
        renderHome();
        showToast(t('toastLoggedOut'));
    }

    function setupAuthListener() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUserId = user.uid;
                isCloudMode = true;
                updateAuthUI(user);
                // Migrate local data if needed
                await migrateLocalToFirestore(user.uid);
                // Start real-time sync
                startFirestoreSync(user.uid);
                showToast(t('toastLoggedIn'));
            } else {
                isCloudMode = false;
                currentUserId = null;
                updateAuthUI(null);
                Store.loadFromLocal();
                renderHome();
            }
        });
    }

    // ==================== NAVIGATION ====================
    let currentScreen = 'screen-home';
    const screenHistory = ['screen-home'];

    function showScreen(screenId, pushHistory = true) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');

        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.toggle('active', n.dataset.screen === screenId);
        });

        const bottomNav = document.getElementById('bottom-nav');
        bottomNav.style.display = screenId === 'screen-quiz-play' ? 'none' : 'flex';

        if (pushHistory && screenId !== currentScreen) {
            screenHistory.push(screenId);
        }
        currentScreen = screenId;
    }

    function goBack() {
        if (screenHistory.length > 1) {
            screenHistory.pop();
            const prev = screenHistory[screenHistory.length - 1];
            showScreen(prev, false);
            renderCurrentScreen(prev);
        }
    }

    function renderCurrentScreen(screenId) {
        switch (screenId) {
            case 'screen-home': renderHome(); break;
            case 'screen-analytics': renderAnalytics(); break;
            case 'screen-tags': renderTagManagement(); break;
            case 'screen-quiz-setup': renderQuizSetup(); break;
        }
    }

    // ==================== TOAST ====================
    let toastTimer = null;
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ==================== CONFIRM MODAL ====================
    let modalResolve = null;

    function showConfirm(message) {
        return new Promise(resolve => {
            modalResolve = resolve;
            document.getElementById('modal-message').textContent = message;
            document.getElementById('modal-overlay').style.display = 'flex';
        });
    }

    document.getElementById('modal-confirm').addEventListener('click', () => {
        document.getElementById('modal-overlay').style.display = 'none';
        if (modalResolve) modalResolve(true);
    });

    document.getElementById('modal-cancel').addEventListener('click', () => {
        document.getElementById('modal-overlay').style.display = 'none';
        if (modalResolve) modalResolve(false);
    });

    // ==================== HOME SCREEN ====================
    function renderHome() {
        const cards = Store.getCards();
        const deckList = document.getElementById('deck-list');
        const emptyState = document.getElementById('home-empty');

        if (cards.length === 0) {
            deckList.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        deckList.style.display = 'block';
        emptyState.style.display = 'none';

        const tagMap = {};
        cards.forEach(c => {
            const tag = c.mainTag || t('uncategorized');
            if (!tagMap[tag]) tagMap[tag] = [];
            tagMap[tag].push(c);
        });

        deckList.innerHTML = '';
        Object.keys(tagMap).sort().forEach((tag, i) => {
            const tagCards = tagMap[tag];
            const studied = tagCards.filter(c => c.stats && c.stats.lastStudied).length;
            const total = tagCards.length;
            const progress = total > 0 ? (studied / total) * 100 : 0;

            const div = document.createElement('div');
            div.className = 'deck-card';
            div.style.animationDelay = `${i * 0.05}s`;
            div.innerHTML = `
                <div class="deck-card-title">${escapeHtml(tag)}</div>
                <div class="deck-card-meta">
                    <span class="deck-card-studies">${t('studies')}: ${studied}/${total}</span>
                    <div class="deck-card-progress">
                        <div class="deck-card-progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="deck-card-actions">
                    <button class="deck-card-btn" data-tag="${escapeAttr(tag)}">${t('studyNow')}</button>
                </div>
            `;
            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('deck-card-btn')) return;
                openCardList(tag);
            });
            div.querySelector('.deck-card-btn').addEventListener('click', () => {
                startQuickStudy(tag);
            });
            deckList.appendChild(div);
        });
    }

    function openCardList(mainTag) {
        currentMainTag = mainTag;
        currentSubTagFilter = null;
        const titleEl = document.getElementById('card-list-title');
        titleEl.textContent = mainTag;
        titleEl.removeAttribute('data-i18n');
        renderCardList(mainTag);
        showScreen('screen-card-list');
    }

    // ==================== CARD LIST SCREEN ====================
    let currentMainTag = null;
    let currentSubTagFilter = null;

    function renderCardList(mainTag, subTagFilter = null) {
        const cards = Store.getCards().filter(c => {
            const cardTag = c.mainTag || t('uncategorized');
            return cardTag === mainTag;
        });
        const subTags = [...new Set(cards.flatMap(c => getCardSubTags(c)))].sort();

        const filterContainer = document.getElementById('sub-tag-filter');
        filterContainer.innerHTML = '';

        if (subTags.length > 0) {
            const allChip = document.createElement('button');
            allChip.className = 'filter-chip' + (subTagFilter === null ? ' active' : '');
            allChip.textContent = t('allFilter');
            allChip.addEventListener('click', () => {
                currentSubTagFilter = null;
                renderCardList(mainTag, null);
            });
            filterContainer.appendChild(allChip);

            subTags.forEach(st => {
                const chip = document.createElement('button');
                chip.className = 'filter-chip' + (subTagFilter === st ? ' active' : '');
                chip.textContent = st;
                chip.addEventListener('click', () => {
                    currentSubTagFilter = st;
                    renderCardList(mainTag, st);
                });
                filterContainer.appendChild(chip);
            });
        }

        let filtered = cards;
        if (subTagFilter) {
            filtered = cards.filter(c => getCardSubTags(c).includes(subTagFilter));
        }

        const listBody = document.getElementById('card-list-body');
        listBody.innerHTML = '';

        if (filtered.length === 0) {
            listBody.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><p>${t('noCards')}</p></div>`;
            return;
        }

        filtered.forEach((card, i) => {
            const item = document.createElement('div');
            item.className = 'card-item';
            item.style.animationDelay = `${i * 0.03}s`;
            item.innerHTML = `
                <div class="card-item-content">
                    <div class="card-item-front">${isCloze(card) ? '<span class="cloze-badge">穴埋め</span> ' : ''}${escapeHtml(card.front)}</div>
                    <div class="card-item-back">${escapeHtml(card.back)}</div>
                </div>
                ${getCardSubTags(card).map(st => `<span class="card-item-tag">${escapeHtml(st)}</span>`).join('')}
                <span class="card-item-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
            `;
            item.addEventListener('click', () => openCardEditor(card.id));
            listBody.appendChild(item);
        });
    }

    // ==================== CARD EDITOR ====================
    let editingCardId = null;
    let editingSubTags = [];
    let editingCardType = 'qa';

    function renderSubTagChips() {
        const container = document.getElementById('sub-tags-chips');
        container.innerHTML = '';
        editingSubTags.forEach((tag, i) => {
            const chip = document.createElement('span');
            chip.className = 'sub-tag-chip';
            chip.innerHTML = `${escapeHtml(tag)}<button class="sub-tag-chip-remove" data-index="${i}">&times;</button>`;
            chip.querySelector('.sub-tag-chip-remove').addEventListener('click', (e) => {
                e.preventDefault();
                editingSubTags.splice(i, 1);
                renderSubTagChips();
            });
            container.appendChild(chip);
        });
    }

    function addSubTag() {
        const input = document.getElementById('input-sub-tag');
        const tag = input.value.trim();
        if (tag && !editingSubTags.includes(tag)) {
            editingSubTags.push(tag);
            renderSubTagChips();
        }
        input.value = '';
        input.focus();
    }

    function setCardTypeToggle(type) {
        editingCardType = type;
        const qaBtn = document.getElementById('btn-type-qa');
        const clozeBtn = document.getElementById('btn-type-cloze');
        qaBtn.classList.toggle('active', type === 'qa');
        clozeBtn.classList.toggle('active', type === 'cloze');

        const labelFront = document.getElementById('label-front');
        const labelBack = document.getElementById('label-back');
        const inputFront = document.getElementById('input-front');
        const inputBack = document.getElementById('input-back');

        if (type === 'cloze') {
            labelFront.textContent = t('clozeText');
            labelFront.dataset.i18n = 'clozeText';
            labelBack.textContent = t('clozeWords');
            labelBack.dataset.i18n = 'clozeWords';
            inputFront.placeholder = t('clozePlaceholderText');
            inputFront.dataset.i18nPlaceholder = 'clozePlaceholderText';
            inputBack.placeholder = t('clozePlaceholderWords');
            inputBack.dataset.i18nPlaceholder = 'clozePlaceholderWords';
        } else {
            labelFront.textContent = t('questionFront');
            labelFront.dataset.i18n = 'questionFront';
            labelBack.textContent = t('answerBack');
            labelBack.dataset.i18n = 'answerBack';
            inputFront.placeholder = t('enterQuestion');
            inputFront.dataset.i18nPlaceholder = 'enterQuestion';
            inputBack.placeholder = t('enterAnswer');
            inputBack.dataset.i18nPlaceholder = 'enterAnswer';
        }
    }

    function openCardEditor(cardId = null) {
        editingCardId = cardId;
        const titleEl = document.getElementById('editor-title');
        const frontInput = document.getElementById('input-front');
        const backInput = document.getElementById('input-back');
        const noteInput = document.getElementById('input-note');
        const mainTagInput = document.getElementById('input-main-tag');
        const subTagInput = document.getElementById('input-sub-tag');
        const deleteBtn = document.getElementById('btn-delete-card');

        populateTagSuggestions();

        if (cardId) {
            const card = Store.getCards().find(c => c.id === cardId);
            if (card) {
                titleEl.textContent = t('editCard');
                titleEl.dataset.i18n = 'editCard';
                frontInput.value = card.front;
                backInput.value = card.back;
                noteInput.value = card.note || '';
                mainTagInput.value = card.mainTag || '';
                editingSubTags = [...getCardSubTags(card)];
                subTagInput.value = '';
                deleteBtn.style.display = 'flex';
                setCardTypeToggle(isCloze(card) ? 'cloze' : 'qa');
            }
        } else {
            titleEl.textContent = t('createCard');
            titleEl.dataset.i18n = 'createCard';
            frontInput.value = '';
            backInput.value = '';
            noteInput.value = '';
            mainTagInput.value = currentMainTag || '';
            editingSubTags = [];
            subTagInput.value = '';
            deleteBtn.style.display = 'none';
            setCardTypeToggle('qa');
        }

        renderSubTagChips();
        showScreen('screen-card-editor');
    }

    function populateTagSuggestions() {
        const mainDl = document.getElementById('main-tag-suggestions');
        const subDl = document.getElementById('sub-tag-suggestions');
        mainDl.innerHTML = Store.getMainTags().map(tg => `<option value="${escapeAttr(tg)}">`).join('');
        subDl.innerHTML = Store.getSubTags().map(tg => `<option value="${escapeAttr(tg)}">`).join('');
    }

    function saveCard() {
        const front = document.getElementById('input-front').value.trim();
        const back = document.getElementById('input-back').value.trim();
        const note = document.getElementById('input-note').value.trim();
        const mainTag = document.getElementById('input-main-tag').value.trim();
        // Also add any text left in the input
        const pendingSubTag = document.getElementById('input-sub-tag').value.trim();
        if (pendingSubTag && !editingSubTags.includes(pendingSubTag)) {
            editingSubTags.push(pendingSubTag);
        }
        const subTags = [...editingSubTags];
        const type = editingCardType;

        if (type === 'cloze') {
            if (!front) { showToast(t('toastEnterClozeText')); return; }
            if (!back) { showToast(t('toastEnterClozeWords')); return; }
            // Validate all blank words exist in the text
            const words = back.split(';').map(w => w.trim()).filter(Boolean);
            for (const word of words) {
                if (!front.includes(word)) {
                    showToast(t('toastClozeWordNotFound') + word);
                    return;
                }
            }
        } else {
            if (!front) { showToast(t('toastEnterQuestion')); return; }
            if (!back) { showToast(t('toastEnterAnswer')); return; }
        }

        if (editingCardId) {
            Store.updateCard(editingCardId, { front, back, note, mainTag, subTags, type });
            showToast(t('toastCardUpdated'));
        } else {
            const card = {
                id: uuid(),
                front, back, note,
                mainTag: mainTag || t('uncategorized'),
                subTags, type,
                createdAt: Date.now(),
                stats: { easy: 0, good: 0, hard: 0, lastStudied: null }
            };
            Store.addCard(card);
            showToast(t('toastCardAdded'));
        }

        goBack();
        if (currentMainTag) renderCardList(currentMainTag, currentSubTagFilter);
        renderHome();
    }

    async function deleteCard() {
        const confirmed = await showConfirm(t('confirmDeleteCard'));
        if (confirmed && editingCardId) {
            Store.deleteCard(editingCardId);
            showToast(t('toastCardDeleted'));
            goBack();
            if (currentMainTag) renderCardList(currentMainTag, currentSubTagFilter);
            renderHome();
        }
    }

    // ==================== TAG MANAGEMENT ====================
    function renderTagManagement() {
        const cards = Store.getCards();

        const mainTagMap = {};
        cards.forEach(c => {
            const tag = c.mainTag || t('uncategorized');
            mainTagMap[tag] = (mainTagMap[tag] || 0) + 1;
        });

        const mainTagList = document.getElementById('main-tag-list');
        mainTagList.innerHTML = '';
        Object.keys(mainTagMap).sort().forEach(tag => {
            const badge = document.createElement('span');
            badge.className = 'tag-badge';
            badge.innerHTML = `${escapeHtml(tag)} <span class="tag-badge-count">${mainTagMap[tag]}</span>`;
            mainTagList.appendChild(badge);
        });

        if (Object.keys(mainTagMap).length === 0) {
            mainTagList.innerHTML = `<span class="analytics-empty">${t('noTags')}</span>`;
        }

        const subTagMap = {};
        cards.forEach(c => {
            getCardSubTags(c).forEach(st => {
                subTagMap[st] = (subTagMap[st] || 0) + 1;
            });
        });

        const subTagList = document.getElementById('sub-tag-list');
        subTagList.innerHTML = '';
        Object.keys(subTagMap).sort().forEach(tag => {
            const badge = document.createElement('span');
            badge.className = 'tag-badge';
            badge.innerHTML = `${escapeHtml(tag)} <span class="tag-badge-count">${subTagMap[tag]}</span>`;
            subTagList.appendChild(badge);
        });

        if (Object.keys(subTagMap).length === 0) {
            subTagList.innerHTML = `<span class="analytics-empty">${t('noSubTags')}</span>`;
        }

        updateReplaceFromOptions();
    }

    function updateReplaceFromOptions() {
        const type = document.getElementById('replace-tag-type').value;
        const fromSelect = document.getElementById('replace-tag-from');
        const tags = type === 'main' ? Store.getMainTags() : Store.getSubTags();
        fromSelect.innerHTML = tags.map(tg => `<option value="${escapeAttr(tg)}">${escapeHtml(tg)}</option>`).join('');
    }

    function replaceTags() {
        const type = document.getElementById('replace-tag-type').value;
        const from = document.getElementById('replace-tag-from').value;
        const to = document.getElementById('replace-tag-to').value.trim();

        if (!from) { showToast(t('toastSelectTagBefore')); return; }
        if (!to) { showToast(t('toastEnterNewTag')); return; }

        const count = Store.replaceTag(type, from, to);
        showToast(`${count}${t('toastTagsReplaced')}`);
        document.getElementById('replace-tag-to').value = '';
        renderTagManagement();
        renderHome();
    }

    // ==================== QUIZ SETUP ====================
    function renderQuizSetup() {
        const mainTagSelect = document.getElementById('quiz-main-tag');
        const mainTags = Store.getMainTags();
        mainTagSelect.innerHTML = `<option value="">${t('all')}</option>` +
            mainTags.map(tg => `<option value="${escapeAttr(tg)}">${escapeHtml(tg)}</option>`).join('');
        updateQuizSubTags();
        updateQuizAvailableCount();
    }

    function updateQuizSubTags() {
        const mainTag = document.getElementById('quiz-main-tag').value;
        const subTagSelect = document.getElementById('quiz-sub-tag');
        const subTags = mainTag ? Store.getSubTagsForMain(mainTag) : Store.getSubTags();
        subTagSelect.innerHTML = `<option value="">${t('all')}</option>` +
            subTags.map(tg => `<option value="${escapeAttr(tg)}">${escapeHtml(tg)}</option>`).join('');
        updateQuizAvailableCount();
    }

    function updateQuizAvailableCount() {
        const mainTag = document.getElementById('quiz-main-tag').value;
        const subTag = document.getElementById('quiz-sub-tag').value;
        document.getElementById('quiz-count-num').textContent = getFilteredCards(mainTag, subTag).length;
    }

    function getFilteredCards(mainTag, subTag) {
        let cards = Store.getCards();
        if (mainTag) cards = cards.filter(c => c.mainTag === mainTag);
        if (subTag) cards = cards.filter(c => getCardSubTags(c).includes(subTag));
        return cards;
    }

    // ==================== QUIZ PLAY ====================
    let quizCards = [], quizIndex = 0, quizResults = [], quizMainTag = '', quizSubTag = '';
    let clozeRevealIndex = 0;

    function startQuiz() {
        const mainTag = document.getElementById('quiz-main-tag').value;
        const subTag = document.getElementById('quiz-sub-tag').value;
        const count = parseInt(document.getElementById('quiz-count').value) || 10;
        const order = document.getElementById('quiz-order').value;

        let cards = getFilteredCards(mainTag, subTag);
        if (cards.length === 0) { showToast(t('toastNoCards')); return; }

        switch (order) {
            case 'random': cards = shuffle(cards); break;
            case 'hard-first':
                cards.sort((a, b) => {
                    const aH = (a.stats?.hard || 0) - (a.stats?.easy || 0);
                    const bH = (b.stats?.hard || 0) - (b.stats?.easy || 0);
                    return bH - aH;
                });
                break;
        }

        quizCards = cards.slice(0, Math.min(count, cards.length));
        quizIndex = 0; quizResults = [];
        quizMainTag = mainTag; quizSubTag = subTag;
        showScreen('screen-quiz-play');
        renderQuizCard();
    }

    function startQuickStudy(mainTag) {
        const cards = Store.getCardsByMainTag(mainTag);
        if (cards.length === 0) { showToast(t('toastNoCardsInDeck')); return; }

        quizCards = shuffle(cards).slice(0, Math.min(10, cards.length));
        quizIndex = 0; quizResults = [];
        quizMainTag = mainTag; quizSubTag = '';
        showScreen('screen-quiz-play');
        renderQuizCard();
    }

    function renderQuizCard() {
        const card = quizCards[quizIndex];
        if (!card) return;

        const total = quizCards.length;
        document.getElementById('quiz-progress-fill').style.width = `${(quizIndex / total) * 100}%`;
        document.getElementById('quiz-progress-text').textContent = `${quizIndex + 1}/${total}`;

        const quizCard = document.getElementById('quiz-card');

        if (isCloze(card)) {
            // Cloze mode: render text with blanks on the front face only
            const words = getClozeWords(card);
            let html = escapeHtml(card.front);
            // Replace each word occurrence with a cloze blank span
            words.forEach((word, idx) => {
                const escapedWord = escapeHtml(word);
                // Replace all occurrences of this word
                const regex = new RegExp(escapedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                html = html.replace(regex, `<span class="cloze-blank" data-answer="${escapeAttr(word)}" data-index="${idx}">${'_'.repeat(Math.max(word.length, 3))}</span>`);
            });

            document.getElementById('quiz-question-text').innerHTML = html;
            document.getElementById('quiz-answer-text').textContent = '';
            document.getElementById('quiz-note-text').textContent = card.note || '';
            clozeRevealIndex = 0;

            // No flip for cloze cards
            quizCard.style.transition = 'none';
            quizCard.classList.remove('flipped');
            quizCard.dataset.cloze = 'true';
            quizCard.offsetHeight;
            quizCard.style.transition = '';

            document.getElementById('btn-show-answer').textContent = t('tapToReveal');
            document.getElementById('btn-show-answer').style.display = 'flex';
            document.getElementById('quiz-difficulty-btns').style.display = 'none';
        } else {
            // QA mode: normal flip card
            document.getElementById('quiz-question-text').textContent = card.front;
            document.getElementById('quiz-answer-text').textContent = card.back;
            document.getElementById('quiz-note-text').textContent = card.note || '';
            clozeRevealIndex = 0;

            quizCard.style.transition = 'none';
            quizCard.classList.remove('flipped');
            quizCard.dataset.cloze = 'false';
            quizCard.offsetHeight;
            quizCard.style.transition = '';

            document.getElementById('btn-show-answer').textContent = t('showAnswer');
            document.getElementById('btn-show-answer').style.display = 'flex';
            document.getElementById('quiz-difficulty-btns').style.display = 'none';
        }

        // Render tags
        const tagsContainer = document.getElementById('quiz-card-tags');
        tagsContainer.innerHTML = '';
        if (card.mainTag) {
            const tag = document.createElement('span');
            tag.className = 'quiz-tag quiz-tag-main';
            tag.textContent = card.mainTag;
            tagsContainer.appendChild(tag);
        }
        if (card.subTags && card.subTags.length > 0) {
            card.subTags.forEach(st => {
                const tag = document.createElement('span');
                tag.className = 'quiz-tag quiz-tag-sub';
                tag.textContent = st;
                tagsContainer.appendChild(tag);
            });
        }
    }

    function revealNextCloze() {
        const blanks = document.querySelectorAll('#quiz-question-text .cloze-blank:not(.revealed)');
        if (blanks.length > 0) {
            const blank = blanks[0];
            blank.textContent = blank.dataset.answer;
            blank.classList.add('revealed');
            clozeRevealIndex++;
        }
        // Check if all revealed
        const remaining = document.querySelectorAll('#quiz-question-text .cloze-blank:not(.revealed)');
        if (remaining.length === 0) {
            document.getElementById('btn-show-answer').style.display = 'none';
            document.getElementById('quiz-difficulty-btns').style.display = 'flex';
        }
    }

    function revealAllCloze() {
        const blanks = document.querySelectorAll('#quiz-question-text .cloze-blank:not(.revealed)');
        blanks.forEach(blank => {
            blank.textContent = blank.dataset.answer;
            blank.classList.add('revealed');
        });
        document.getElementById('btn-show-answer').style.display = 'none';
        document.getElementById('quiz-difficulty-btns').style.display = 'flex';
    }

    function showAnswer() {
        const card = quizCards[quizIndex];
        if (card && isCloze(card)) {
            revealNextCloze();
        } else {
            const quizCardEl = document.getElementById('quiz-card');
            quizCardEl.classList.add('flipped');
            document.getElementById('btn-show-answer').style.display = 'none';
            document.getElementById('quiz-difficulty-btns').style.display = 'flex';
        }
    }

    function toggleCard() {
        const card = quizCards[quizIndex];
        if (card && isCloze(card)) return; // No flip for cloze cards
        const quizCardEl = document.getElementById('quiz-card');
        quizCardEl.classList.toggle('flipped');
    }

    function rateDifficulty(difficulty) {
        const card = quizCards[quizIndex];

        // Update card stats
        const allCards = Store.getCards();
        const cardInStore = allCards.find(c => c.id === card.id);
        if (cardInStore) {
            if (!cardInStore.stats) cardInStore.stats = { easy: 0, good: 0, hard: 0, lastStudied: null };
            cardInStore.stats[difficulty]++;
            cardInStore.stats.lastStudied = Date.now();
            // Write update
            if (isCloudMode) {
                db.collection('users').doc(currentUserId).collection('cards').doc(card.id)
                    .update({ stats: cardInStore.stats }).catch(console.error);
            } else {
                localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(allCards));
            }
        }

        quizResults.push({ cardId: card.id, front: card.front, back: card.back, difficulty });
        quizIndex++;

        if (quizIndex >= quizCards.length) {
            finishQuiz();
        } else {
            renderQuizCard();
        }
    }

    function finishQuiz() {
        const total = quizResults.length;
        const easyCount = quizResults.filter(r => r.difficulty === 'easy').length;
        const goodCount = quizResults.filter(r => r.difficulty === 'good').length;
        const hardCount = quizResults.filter(r => r.difficulty === 'hard').length;
        const scorePercent = total > 0 ? Math.round(((easyCount + goodCount) / total) * 100) : 0;

        const result = {
            id: uuid(), date: Date.now(),
            mainTag: quizMainTag || t('all'), subTag: quizSubTag || null,
            totalQuestions: total, easyCount, goodCount, hardCount, scorePercent,
            results: quizResults
        };
        Store.addResult(result);

        document.getElementById('result-score-number').textContent = `${scorePercent}%`;
        document.getElementById('result-total').textContent = total;
        document.getElementById('result-easy').textContent = easyCount;
        document.getElementById('result-good').textContent = goodCount;
        document.getElementById('result-hard').textContent = hardCount;

        const detailList = document.getElementById('result-detail-list');
        detailList.innerHTML = '';
        quizResults.forEach((r, i) => {
            const item = document.createElement('div');
            item.className = 'result-detail-item';
            const diffLabel = r.difficulty === 'easy' ? 'Easy' : r.difficulty === 'good' ? 'Good' : 'Hard';
            item.innerHTML = `
                <span class="result-detail-num">${i + 1}</span>
                <div class="result-detail-text">
                    <div class="result-detail-question">${escapeHtml(r.front)}</div>
                    <div class="result-detail-answer">${escapeHtml(r.back)}</div>
                </div>
                <span class="result-detail-badge badge-${r.difficulty}">${diffLabel}</span>
            `;
            detailList.appendChild(item);
        });

        showScreen('screen-quiz-result');
    }

    // ==================== ANALYTICS ====================
    function renderAnalytics() {
        const cards = Store.getCards();
        const results = Store.getResults();

        document.getElementById('analytics-total-cards').textContent = cards.length;
        document.getElementById('analytics-total-quizzes').textContent = results.length;

        if (results.length > 0) {
            const avg = Math.round(results.reduce((s, r) => s + r.scorePercent, 0) / results.length);
            document.getElementById('analytics-avg-score').textContent = `${avg}%`;
        } else {
            document.getElementById('analytics-avg-score').textContent = '---';
        }

        const byTagContainer = document.getElementById('analytics-by-tag');
        if (results.length === 0) {
            byTagContainer.innerHTML = `<div class="analytics-empty">${t('noQuizYet')}</div>`;
        } else {
            const tagScores = {};
            results.forEach(r => {
                const tag = r.mainTag || t('all');
                if (!tagScores[tag]) tagScores[tag] = [];
                tagScores[tag].push(r.scorePercent);
            });

            byTagContainer.innerHTML = '';
            Object.keys(tagScores).sort().forEach(tag => {
                const scores = tagScores[tag];
                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                const row = document.createElement('div');
                row.className = 'analytics-tag-row';
                row.innerHTML = `
                    <span class="analytics-tag-name">${escapeHtml(tag)}</span>
                    <div class="analytics-bar-wrapper"><div class="analytics-bar-fill" style="width:${avg}%"></div></div>
                    <span class="analytics-tag-percent">${avg}%</span>
                `;
                byTagContainer.appendChild(row);
            });
        }

        const historyContainer = document.getElementById('analytics-history');
        if (results.length === 0) {
            historyContainer.innerHTML = `<div class="analytics-empty">${t('noHistory')}</div>`;
        } else {
            const recent = [...results].reverse().slice(0, 10);
            historyContainer.innerHTML = '';
            recent.forEach(r => {
                const item = document.createElement('div');
                item.className = 'analytics-history-item';
                item.innerHTML = `
                    <span class="analytics-history-date">${formatDate(r.date)}</span>
                    <span class="analytics-history-tag">${escapeHtml(r.mainTag)}${r.subTag ? ' / ' + escapeHtml(r.subTag) : ''}</span>
                    <span class="analytics-history-score">${r.scorePercent}%</span>
                `;
                historyContainer.appendChild(item);
            });
        }
    }

    // ==================== SETTINGS ====================
    function exportData() {
        const data = Store.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `engram_backup_${formatDate(Date.now()).replace(/\//g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(t('toastExported'));
    }

    function importData() { document.getElementById('import-file-input').click(); }

    async function handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        const confirmed = await showConfirm(t('confirmImport'));
        if (!confirmed) { e.target.value = ''; return; }

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                Store.importData(ev.target.result);
                showToast(t('toastImported'));
                renderHome();
            } catch { showToast(t('toastImportFailed')); }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    // ==================== CSV EXPORT/IMPORT ====================
    function escapeCSVField(value) {
        const str = String(value || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    function parseCSV(text) {
        const rows = [];
        let current = '';
        let inQuotes = false;
        const chars = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            if (inQuotes) {
                if (ch === '"' && chars[i + 1] === '"') {
                    current += '"';
                    i++;
                } else if (ch === '"') {
                    inQuotes = false;
                } else {
                    current += ch;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                } else if (ch === ',') {
                    rows.push(current);
                    current = '';
                } else if (ch === '\n') {
                    rows.push(current);
                    current = '';
                    if (rows.length > 0) {
                        const row = rows.splice(0);
                        if (row.some(cell => cell.trim())) {
                            parseCSV._rows.push(row);
                        }
                    }
                } else {
                    current += ch;
                }
            }
        }
        rows.push(current);
        if (rows.some(cell => cell.trim())) {
            parseCSV._rows.push(rows);
        }
    }

    function parseCSVFull(text) {
        parseCSV._rows = [];
        parseCSV(text);
        return parseCSV._rows;
    }

    function exportCSV() {
        const cards = Store.getCards();
        const header = ['問題(front)', '解答(back)', '解説(note)', 'メインタグ(mainTag)', 'サブタグ(subTags)'];
        const lines = [header.map(escapeCSVField).join(',')];

        cards.forEach(card => {
            const subTags = getCardSubTags(card).join(';');
            lines.push([
                escapeCSVField(card.front),
                escapeCSVField(card.back),
                escapeCSVField(card.note || ''),
                escapeCSVField(card.mainTag || ''),
                escapeCSVField(subTags)
            ].join(','));
        });

        const csv = lines.join('\n');
        const bom = '\uFEFF'; // BOM for Excel compatibility
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `engram_cards_${formatDate(Date.now()).replace(/\//g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('CSVをエクスポートしました');
    }

    function importCSVData() { document.getElementById('import-csv-input').click(); }

    async function handleCSVImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        const confirmed = await showConfirm('CSVをインポートします。既存のカードに追加されます。よろしいですか？');
        if (!confirmed) { e.target.value = ''; return; }

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const rows = parseCSVFull(ev.target.result);
                if (rows.length < 2) {
                    showToast('CSVにデータがありません');
                    return;
                }

                // Skip header row
                let imported = 0;
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const front = (row[0] || '').trim();
                    const back = (row[1] || '').trim();
                    if (!front || !back) continue;

                    const note = (row[2] || '').trim();
                    const mainTag = (row[3] || '').trim() || t('uncategorized');
                    const subTagsStr = (row[4] || '').trim();
                    const subTags = subTagsStr ? subTagsStr.split(';').map(s => s.trim()).filter(Boolean) : [];

                    const card = {
                        id: uuid(),
                        front, back, note,
                        mainTag,
                        subTags,
                        type: detectClozeFromCSV(front, back) ? 'cloze' : 'qa',
                        createdAt: Date.now(),
                        stats: { easy: 0, good: 0, hard: 0, lastStudied: null }
                    };
                    Store.addCard(card);
                    imported++;
                }

                showToast(`${imported}枚のカードをインポートしました`);
                renderHome();
            } catch (err) {
                console.error(err);
                showToast('CSVインポートに失敗しました');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    // ==================== UNIFIED IMPORT ====================
    function importUnified() { document.getElementById('import-unified-input').click(); }

    async function handleUnifiedImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'json') {
            const confirmed = await showConfirm(t('confirmImport'));
            if (!confirmed) { e.target.value = ''; return; }
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    Store.importData(ev.target.result);
                    showToast(t('toastImported'));
                    renderHome();
                } catch { showToast(t('toastImportFailed')); }
            };
            reader.readAsText(file);
        } else if (ext === 'csv') {
            const confirmed = await showConfirm('CSVをインポートします。既存のカードに追加されます。よろしいですか？');
            if (!confirmed) { e.target.value = ''; return; }
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const rows = parseCSVFull(ev.target.result);
                    if (rows.length < 2) {
                        showToast('CSVにデータがありません');
                        return;
                    }
                    let imported = 0;
                    for (let i = 1; i < rows.length; i++) {
                        const row = rows[i];
                        const front = (row[0] || '').trim();
                        const back = (row[1] || '').trim();
                        if (!front || !back) continue;
                        const note = (row[2] || '').trim();
                        const mainTag = (row[3] || '').trim() || t('uncategorized');
                        const subTagsStr = (row[4] || '').trim();
                        const subTags = subTagsStr ? subTagsStr.split(';').map(s => s.trim()).filter(Boolean) : [];
                        const card = {
                            id: uuid(), front, back, note, mainTag, subTags,
                            type: detectClozeFromCSV(front, back) ? 'cloze' : 'qa',
                            createdAt: Date.now(),
                            stats: { easy: 0, good: 0, hard: 0, lastStudied: null }
                        };
                        Store.addCard(card);
                        imported++;
                    }
                    showToast(`${imported}枚のカードをインポートしました`);
                    renderHome();
                } catch (err) {
                    console.error(err);
                    showToast('CSVインポートに失敗しました');
                }
            };
            reader.readAsText(file);
        } else {
            showToast('対応していないファイル形式です（.json または .csv）');
        }
        e.target.value = '';
    }

    async function clearAllData() {
        const confirmed = await showConfirm(t('confirmDeleteAll'));
        if (confirmed) {
            Store.clearAll();
            showToast(t('toastAllDeleted'));
            renderHome();
        }
    }

    // ==================== HTML ESCAPE ====================
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function escapeAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ==================== EVENT LISTENERS ====================
    function initEventListeners() {
        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.dataset.screen;
                showScreen(screen);
                renderCurrentScreen(screen);
            });
        });

        // Home
        document.getElementById('btn-add-card-home')?.addEventListener('click', () => { currentMainTag = null; openCardEditor(); });
        document.getElementById('btn-add-first-card')?.addEventListener('click', () => { currentMainTag = null; openCardEditor(); });

        // Card list
        document.getElementById('btn-back-card-list').addEventListener('click', goBack);
        document.getElementById('btn-add-card-list').addEventListener('click', () => openCardEditor());

        // Editor
        document.getElementById('btn-back-editor').addEventListener('click', goBack);
        document.getElementById('btn-save-card').addEventListener('click', saveCard);
        document.getElementById('btn-delete-card').addEventListener('click', deleteCard);
        document.getElementById('btn-add-sub-tag').addEventListener('click', addSubTag);
        document.getElementById('input-sub-tag').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); addSubTag(); }
        });
        // Card type toggle
        document.getElementById('btn-type-qa').addEventListener('click', () => setCardTypeToggle('qa'));
        document.getElementById('btn-type-cloze').addEventListener('click', () => setCardTypeToggle('cloze'));

        // Tags
        document.getElementById('btn-back-tags').addEventListener('click', goBack);
        document.getElementById('replace-tag-type').addEventListener('change', updateReplaceFromOptions);
        document.getElementById('btn-replace-tags').addEventListener('click', replaceTags);

        // Quiz setup
        document.getElementById('btn-back-quiz-setup').addEventListener('click', goBack);
        document.getElementById('quiz-main-tag').addEventListener('change', updateQuizSubTags);
        document.getElementById('quiz-sub-tag').addEventListener('change', updateQuizAvailableCount);
        document.getElementById('quiz-count').addEventListener('input', updateQuizAvailableCount);
        document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);

        // Quiz play
        document.getElementById('btn-quiz-quit').addEventListener('click', async () => {
            const confirmed = await showConfirm(t('confirmQuitQuiz'));
            if (confirmed) {
                showScreen('screen-quiz-setup');
                renderQuizSetup();
                screenHistory.length = 0;
                screenHistory.push('screen-home');
                screenHistory.push('screen-quiz-setup');
            }
        });
        document.getElementById('btn-show-answer').addEventListener('click', showAnswer);
        document.getElementById('quiz-card').addEventListener('click', () => {
            const currentCard = quizCards[quizIndex];
            if (currentCard && isCloze(currentCard)) {
                revealNextCloze();
            } else {
                const card = document.getElementById('quiz-card');
                if (!card.classList.contains('flipped')) {
                    showAnswer();
                } else {
                    toggleCard();
                }
            }
        });
        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.addEventListener('click', () => rateDifficulty(btn.dataset.difficulty));
        });

        // Quiz swipe gesture
        let quizTouchStartX = 0;
        let quizTouchStartY = 0;
        const quizContainer = document.getElementById('screen-quiz-play');
        quizContainer.addEventListener('touchstart', (e) => {
            quizTouchStartX = e.touches[0].clientX;
            quizTouchStartY = e.touches[0].clientY;
        }, { passive: true });
        quizContainer.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - quizTouchStartX;
            const dy = e.changedTouches[0].clientY - quizTouchStartY;
            // Only trigger if horizontal swipe is dominant and > 60px
            if (dx < -60 && Math.abs(dy) < Math.abs(dx)) {
                const card = document.getElementById('quiz-card');
                if (card.classList.contains('flipped') || document.getElementById('quiz-difficulty-btns').style.display === 'flex') {
                    // Card has been revealed - show difficulty selection via swipe
                    // Ensure card is flipped to answer side and difficulty buttons are visible
                    if (!card.classList.contains('flipped')) card.classList.add('flipped');
                    document.getElementById('btn-show-answer').style.display = 'none';
                    document.getElementById('quiz-difficulty-btns').style.display = 'flex';
                }
            }
        }, { passive: true });

        // Quiz result
        document.getElementById('btn-retry-quiz').addEventListener('click', () => {
            quizCards = shuffle(quizCards);
            quizIndex = 0; quizResults = [];
            showScreen('screen-quiz-play', false);
            renderQuizCard();
        });
        document.getElementById('btn-result-home').addEventListener('click', () => {
            showScreen('screen-home');
            renderHome();
            screenHistory.length = 0;
            screenHistory.push('screen-home');
        });

        // Settings
        // Unified export - show format chooser
        document.getElementById('btn-export-unified').addEventListener('click', () => {
            document.getElementById('export-format-modal').style.display = 'flex';
        });
        document.getElementById('export-format-close').addEventListener('click', () => {
            document.getElementById('export-format-modal').style.display = 'none';
        });
        document.getElementById('export-format-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
        });
        document.getElementById('btn-export-json').addEventListener('click', () => {
            document.getElementById('export-format-modal').style.display = 'none';
            exportData();
        });
        document.getElementById('btn-export-csv-option').addEventListener('click', () => {
            document.getElementById('export-format-modal').style.display = 'none';
            exportCSV();
        });

        // Unified import - auto-detect format
        document.getElementById('btn-import-unified').addEventListener('click', importUnified);
        document.getElementById('import-unified-input').addEventListener('change', handleUnifiedImport);

        document.getElementById('btn-clear-data').addEventListener('click', clearAllData);
        document.getElementById('btn-csv-info').addEventListener('click', () => {
            document.getElementById('csv-info-modal').style.display = 'flex';
        });
        document.getElementById('csv-info-close').addEventListener('click', () => {
            document.getElementById('csv-info-modal').style.display = 'none';
        });
        document.getElementById('csv-info-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
        });

        // Language toggle
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setLanguage(btn.dataset.lang);
                showToast(t('toastLangChanged'));
            });
        });

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setTheme(btn.dataset.theme);
            });
        });

        // Auth buttons
        document.getElementById('btn-google-login').addEventListener('click', googleLogin);
        document.getElementById('btn-logout').addEventListener('click', googleLogout);

        // Home title dblclick for tag management
        document.querySelector('#screen-home .screen-title').addEventListener('dblclick', () => {
            renderTagManagement();
            showScreen('screen-tags');
        });
    }

    // ==================== ADD TAG MANAGEMENT NAV ====================
    function addTagManagementLink() {
        const settingsBody = document.querySelector('#screen-settings .screen-body');
        const dataPanel = settingsBody.querySelector('[data-i18n="dataManagement"]')?.closest('.card-panel');
        if (!dataPanel) return;

        const tagPanel = document.createElement('div');
        tagPanel.className = 'card-panel';
        tagPanel.innerHTML = `
            <h3 class="panel-title" data-i18n="tagManagement">${t('tagManagement')}</h3>
            <button class="btn-secondary settings-btn" id="btn-open-tags">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                <span data-i18n="openTagManagement">${t('openTagManagement')}</span>
            </button>
        `;
        settingsBody.insertBefore(tagPanel, dataPanel);

        document.getElementById('btn-open-tags').addEventListener('click', () => {
            renderTagManagement();
            showScreen('screen-tags');
        });
    }

    // ==================== INIT ====================
    function init() {
        // Apply saved language
        document.documentElement.lang = currentLang;
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });
        applyI18n();

        // Load local data first (for immediate rendering)
        Store.loadFromLocal();

        initEventListeners();
        addTagManagementLink();
        renderHome();

        // Setup Firebase auth listener (will switch to cloud mode if user is logged in)
        setupAuthListener();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
