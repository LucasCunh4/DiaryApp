document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const body = document.body;
    const menuBtn = document.getElementById('menu-btn');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    const mainContent = document.getElementById('main-content');
    const cover = document.getElementById('cover');
    const pageEl = document.getElementById('page');
    const navigationControls = document.getElementById('navigation-controls');
    const bookCoverTitle = document.getElementById('book-cover-title');
    const currentBookTitle = document.getElementById('current-book-title');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageDateEl = document.getElementById('page-date');
    const pageContentEl = document.getElementById('page-content');
    const pageMoodEl = document.getElementById('page-mood');
    const bookListEl = document.getElementById('book-list');
    const newBookNameInput = document.getElementById('new-book-name');
    const addBookBtn = document.getElementById('add-book-btn');
    const moodOptions = document.querySelector('.mood-options');
    const moodTrackerEl = document.getElementById('mood-tracker');
    const themeSwatches = document.querySelectorAll('.theme-swatch');
    const pinLockScreen = document.getElementById('pin-lock-screen');
    const pinDisplay = document.getElementById('pin-display');
    const pinKeypad = document.querySelector('.pin-keypad');
    const pinSettingsBtn = document.getElementById('pin-settings-btn');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file-input');
    const searchInput = document.getElementById('search-input');
    const searchResultsEl = document.getElementById('search-results');
    const emojiStatsEl = document.getElementById('emoji-stats');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalEl = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalInput = document.getElementById('modal-input');
    const modalOkBtn = document.getElementById('modal-ok-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const calendarOverlay = document.getElementById('calendar-overlay');
    const calendarModal = document.getElementById('calendar-modal');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarPrevMonthBtn = document.getElementById('calendar-prev-month');
    const calendarNextMonthBtn = document.getElementById('calendar-next-month');
    const calendarDaysGrid = document.getElementById('calendar-days-grid');
    const calendarCancelBtn = document.getElementById('calendar-cancel-btn');
    const calendarSelectBtn = document.getElementById('calendar-select-btn');


    // --- ESTADO DA APLICAÇÃO ---
    let db;
    let currentBookId = localStorage.getItem('currentBookId') || null;
    let currentBookData = null;
    let currentDate = new Date();
    let currentMood = null;
    let pinInput = '';
    let calendarCurrentDate = new Date();
    let calendarSelectedDate = new Date();

    // --- LÓGICA DE MODAL CUSTOMIZADO ---
    const customModal = (title, text, options = {}) => {
        modalTitle.textContent = title;
        modalText.textContent = text;
        
        modalInput.style.display = options.prompt ? 'block' : 'none';
        modalInput.value = options.defaultValue || '';

        modalCancelBtn.style.display = options.confirm || options.prompt ? 'inline-block' : 'none';
        modalOkBtn.textContent = options.okText || 'OK';

        modalOverlay.classList.add('visible');

        return new Promise((resolve) => {
            const onOk = () => {
                cleanup();
                resolve(options.prompt ? modalInput.value : true);
            };
            const onCancel = () => {
                cleanup();
                resolve(options.prompt ? null : false);
            };
            const onOverlayClick = (e) => {
                if (e.target === modalOverlay) {
                    onCancel();
                }
            };

            modalOkBtn.onclick = onOk;
            modalCancelBtn.onclick = onCancel;
            modalOverlay.onclick = onOverlayClick;

            function cleanup() {
                modalOverlay.classList.remove('visible');
                modalOkBtn.onclick = null;
                modalCancelBtn.onclick = null;
                modalOverlay.onclick = null;
            }
        });
    };
    const customAlert = (text, title = "Aviso") => customModal(title, text);
    const customConfirm = (text, title = "Confirmação") => customModal(title, text, { confirm: true, okText: 'Confirmar' });
    const customPrompt = (text, title = "Entrada") => customModal(title, text, { prompt: true });

    // --- LÓGICA DO CALENDÁRIO CUSTOMIZADO ---
    function renderCalendar(year, month) {
        calendarCurrentDate = new Date(year, month, 1);
        const monthName = calendarCurrentDate.toLocaleString('pt-BR', { month: 'long' });
        calendarMonthYear.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

        calendarDaysGrid.innerHTML = '';
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            calendarDaysGrid.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day';
            dayCell.textContent = i;
            const cellDate = new Date(year, month, i);

            if (isSameDay(cellDate, new Date())) {
                dayCell.classList.add('today');
            }
            if (isSameDay(cellDate, calendarSelectedDate)) {
                dayCell.classList.add('selected');
            }
            dayCell.onclick = () => {
                calendarSelectedDate = new Date(year, month, i);
                renderCalendar(year, month);
            };
            calendarDaysGrid.appendChild(dayCell);
        }
    }

    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    const showCalendarPicker = (initialDate = new Date()) => {
        calendarSelectedDate = initialDate;
        renderCalendar(initialDate.getFullYear(), initialDate.getMonth());
        calendarOverlay.classList.add('visible');

        return new Promise(resolve => {
            const onSelect = () => { cleanup(); resolve(calendarSelectedDate); };
            const onCancel = () => { cleanup(); resolve(null); };
            const onPrev = () => renderCalendar(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() - 1);
            const onNext = () => renderCalendar(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() + 1);

            calendarSelectBtn.onclick = onSelect;
            calendarCancelBtn.onclick = onCancel;
            calendarPrevMonthBtn.onclick = onPrev;
            calendarNextMonthBtn.onclick = onNext;

            function cleanup() {
                calendarOverlay.classList.remove('visible');
                calendarSelectBtn.onclick = null;
                calendarCancelBtn.onclick = null;
                calendarPrevMonthBtn.onclick = null;
                calendarNextMonthBtn.onclick = null;
            }
        });
    };

    // --- INICIALIZAÇÃO E DB ---
    function initDB() {
        const request = indexedDB.open('DiarioPWA_DB', 4);
        request.onerror = (event) => console.error('Erro:', event.target.error);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            const oldVersion = event.oldVersion;
            const transaction = event.target.transaction;
            
            if (oldVersion < 1) {
                db.createObjectStore('diaries', { keyPath: 'id', autoIncrement: true });
            }
            if (oldVersion < 2) {
                if (!db.objectStoreNames.contains('entries')) {
                    const entriesStore = db.createObjectStore('entries', { keyPath: ['diaryId', 'date'] });
                    entriesStore.createIndex('diaryId_idx', 'diaryId', { unique: false });
                }
            }
            if (oldVersion < 3) {
                if (transaction.objectStoreNames.contains('diaries')) {
                    const diariesStore = transaction.objectStore('diaries');
                    diariesStore.openCursor().onsuccess = (e) => {
                        const cursor = e.target.result;
                        if (cursor) {
                            const book = cursor.value;
                            if (book.emojisEnabled === undefined) {
                                book.emojisEnabled = true;
                            }
                            cursor.update(book);
                            cursor.continue();
                        }
                    };
                }
            }
             if (oldVersion < 4) {
                if (transaction.objectStoreNames.contains('diaries')) {
                    const diariesStore = transaction.objectStore('diaries');
                    diariesStore.openCursor().onsuccess = (e) => {
                        const cursor = e.target.result;
                        if (cursor) {
                            const book = cursor.value;
                            if (!book.startDate) {
                                book.startDate = new Date().toISOString().split('T')[0];
                            }
                            cursor.update(book);
                            cursor.continue();
                        }
                    };
                }
            }
        };
        request.onsuccess = (event) => {
            db = event.target.result;
            checkPin();
        };
    }

    function initialLoad() {
        loadBooks();
        setupTheme();
        setupEventListeners();
    }

    // --- LÓGICA DE LIVROS E ENTRADAS ---
    async function loadBooks() {
        if (!db) return;
        const allBooks = await new Promise(r => db.transaction('diaries').objectStore('diaries').getAll().onsuccess = e => r(e.target.result));

        bookListEl.innerHTML = '';
        if (allBooks.length === 0) {
            await addBook('Meu Primeiro Livro');
            return;
        }

        allBooks.forEach(book => {
            const li = document.createElement('li');
            const bookNameSpan = document.createElement('span');
            bookNameSpan.className = 'book-name';
            bookNameSpan.textContent = book.name;
            bookNameSpan.onclick = () => selectBook(book.id);
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-book-btn';
            deleteBtn.innerHTML = '&#128465;';
            deleteBtn.title = `Excluir livro "${book.name}"`;
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteBook(book.id, book.name);
            };
            li.appendChild(bookNameSpan);
            li.appendChild(deleteBtn);
            li.dataset.id = book.id;
            bookListEl.appendChild(li);
        });

        if (!currentBookId || !allBooks.some(b => b.id == currentBookId)) {
            currentBookId = allBooks.length > 0 ? allBooks[0].id : null;
        }

        if (currentBookId) {
            selectBook(currentBookId);
        } else {
            currentBookTitle.textContent = "Nenhum Livro";
            bookCoverTitle.textContent = "Crie um Livro";
            displayEmojiStats({});
            closeBook(true);
        }
    }

    async function addBook(name) {
        const bookName = name.trim();
        if (!db || !bookName) return;

        const emojisEnabled = await customConfirm("Deseja habilitar o registro de humor (emojis) para este livro?", "Novo Livro");
        
        const startDate = await showCalendarPicker(new Date());
        if (startDate === null) {
            return;
        }

        const transaction = db.transaction('diaries', 'readwrite');
        const newBook = { 
            name: bookName,
            emojisEnabled: emojisEnabled,
            startDate: startDate.toISOString().split('T')[0]
        };
        await new Promise(r => transaction.objectStore('diaries').add(newBook).onsuccess = e => {
            currentBookId = e.target.result;
            newBookNameInput.value = '';
            r();
        });
        loadBooks();
    }
    
    async function deleteBook(bookId, bookName) {
        const confirmed = await customConfirm(`Tem certeza que deseja excluir o livro "${bookName}" e todas as suas anotações? Esta ação não pode ser desfeita.`);
        if (!confirmed) return;

        const transaction = db.transaction(['diaries', 'entries'], 'readwrite');
        const diariesStore = transaction.objectStore('diaries');
        const entriesStore = transaction.objectStore('entries');
        
        diariesStore.delete(Number(bookId));
        
        const range = IDBKeyRange.bound([Number(bookId), ''], [Number(bookId), 'z']);
        const request = entriesStore.openCursor(range);
        request.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        transaction.oncomplete = () => {
            console.log(`Livro ${bookId} excluído com sucesso.`);
            if (String(currentBookId) === String(bookId)) {
                currentBookId = null;
                localStorage.removeItem('currentBookId');
            }
            loadBooks();
        };
        transaction.onerror = (event) => {
            console.error('Erro ao excluir o livro:', event.target.error);
        };
    }

    async function selectBook(id) {
        currentBookId = id;
        localStorage.setItem('currentBookId', id);
        
        currentBookData = await new Promise(r => db.transaction('diaries').objectStore('diaries').get(Number(id)).onsuccess = e => r(e.target.result));
        
        if (currentBookData) {
            bookCoverTitle.textContent = currentBookData.name;
            currentBookTitle.textContent = currentBookData.name;
            calculateEmojiStats(id).then(displayEmojiStats);
        }
        document.querySelectorAll('#book-list li').forEach(li => li.classList.toggle('active', li.dataset.id == id));
        closeDrawer();
        closeBook(true);
    }
    
    async function loadPage(date) {
        const entry = await getEntry(date);
        pageDateEl.textContent = formatDate(date);
        pageContentEl.value = entry ? entry.content : '';
        pageMoodEl.textContent = entry ? entry.mood || '' : '';
        updateMoodSelection(entry ? entry.mood : null);
        
        const showEmojis = currentBookData && currentBookData.emojisEnabled;
        moodTrackerEl.style.display = showEmojis ? 'block' : 'none';
        pageMoodEl.style.display = showEmojis ? 'block' : 'none';
        emojiStatsEl.style.display = showEmojis ? 'flex' : 'none';

        const isFuture = isDateInFuture(date);
        pageContentEl.disabled = isFuture;
        
        await updateNavButtons();
    }
    
    async function calculateEmojiStats(bookId) {
        if (!bookId) return {};
        const stats = {};
        const transaction = db.transaction('entries', 'readonly');
        const store = transaction.objectStore('entries');
        const range = IDBKeyRange.bound([Number(bookId), ''], [Number(bookId), 'z']);
        const request = store.openCursor(range);

        return new Promise(resolve => {
            request.onsuccess = event => {
                const cursor = event.target.result;
                if (cursor) {
                    const entry = cursor.value;
                    if (entry.mood) {
                        stats[entry.mood] = (stats[entry.mood] || 0) + 1;
                    }
                    cursor.continue();
                } else {
                    resolve(stats);
                }
            };
            request.onerror = () => resolve({});
        });
    }

    function displayEmojiStats(stats) {
        emojiStatsEl.innerHTML = '';
        if (currentBookData && !currentBookData.emojisEnabled) {
            return;
        }

        const sortedEmojis = Object.entries(stats).sort(([,a],[,b]) => b-a);
        if (sortedEmojis.length === 0) {
            const emptySpan = document.createElement('span');
            emptySpan.textContent = 'Sem humores registrados';
            emojiStatsEl.appendChild(emptySpan);
            return;
        }
        sortedEmojis.forEach(([emoji, count]) => {
            const statSpan = document.createElement('span');
            statSpan.textContent = `${emoji} ${count}`;
            emojiStatsEl.appendChild(statSpan);
        });
    }

    async function openBook() {
        if (!currentBookId) {
            await customAlert("Crie ou selecione um livro primeiro.");
            return;
        }
        
        currentDate = new Date();
        
        await loadPage(currentDate);
        
        cover.classList.add('open');
        pageEl.style.display = 'flex';
        setTimeout(() => { navigationControls.style.display = 'flex'; }, 500);
    }

    function closeBook(force = false) {
        if (!cover.classList.contains('open') && !force) return;
        cover.classList.remove('open');
        pageEl.style.display = 'none';
        navigationControls.style.display = 'none';
    }

    async function prevPage() {
        if (prevPageBtn.disabled) return;
        saveCurrentEntry();
        currentDate.setDate(currentDate.getDate() - 1);
        await loadPage(currentDate);
    }

    async function nextPage() {
        if (nextPageBtn.disabled) return;
        saveCurrentEntry();
        currentDate.setDate(currentDate.getDate() + 1);
        await loadPage(currentDate);
    }

    async function updateNavButtons() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentDay = new Date(currentDate);
        currentDay.setHours(0, 0, 0, 0);

        nextPageBtn.disabled = currentDay >= today;
        
        let limitDate = new Date();
        if (currentBookData && currentBookData.startDate) {
            limitDate = new Date(currentBookData.startDate.replace(/-/g, '/'));
        }
        
        const limitDay = new Date(limitDate);
        limitDay.setHours(0, 0, 0, 0);
        
        prevPageBtn.disabled = currentDay <= limitDay;
    }
    
    async function navigateToDate(date) {
        saveCurrentEntry();
        currentDate = new Date(date);
        await loadPage(currentDate);
        if(!cover.classList.contains('open')) {
            openBook();
        }
    }
    
    function getEntry(date) {
        return new Promise((resolve) => {
            const dateString = date.toISOString().split('T')[0];
            const request = db.transaction('entries').objectStore('entries').get([Number(currentBookId), dateString]);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    }

    function saveCurrentEntry() {
        if (isDateInFuture(currentDate) || !currentBookId) return;
        const dateString = currentDate.toISOString().split('T')[0];
        const content = pageContentEl.value;
        const entry = { diaryId: Number(currentBookId), date: dateString, content: content, mood: currentMood };
        db.transaction('entries', 'readwrite').objectStore('entries').put(entry);
    }
    
    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    function isDateInFuture(date) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date > today;
    }

    function formatDate(date) {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const debouncedSave = debounce(saveCurrentEntry, 1000);

    function updateMoodSelection(mood) {
        currentMood = mood;
        document.querySelectorAll('.mood').forEach(m => {
            m.classList.toggle('selected', m.dataset.mood === mood);
        });
    }

    function setupTheme() {
        const savedTheme = localStorage.getItem('diary_theme') || 'theme-classic';
        applyTheme(savedTheme);
    }
    
    function applyTheme(themeName) {
        body.className = '';
        body.classList.add(themeName);
    }

    function checkPin() {
        const savedPin = localStorage.getItem('diary_pin');
        if (savedPin) {
            pinLockScreen.classList.add('visible');
        } else {
            initialLoad();
        }
    }

    function handlePinInput(key) {
        if (pinInput.length < 4) {
            pinInput += key;
            pinDisplay.textContent = '•'.repeat(pinInput.length);
        }
        if (pinInput.length === 4) {
            const savedPin = localStorage.getItem('diary_pin');
            if (pinInput === savedPin) {
                pinLockScreen.classList.remove('visible');
                initialLoad();
            } else {
                pinDisplay.textContent = 'Incorreto';
                setTimeout(() => { pinInput = ''; pinDisplay.textContent = ''; }, 1000);
            }
        }
    }

    async function setPin() {
        const newPin = await customPrompt("Digite um novo PIN de 4 dígitos (deixe em branco para remover):", "Definir PIN");
        if (newPin === null) return;
        if (newPin === '') {
            localStorage.removeItem('diary_pin');
            await customAlert('PIN removido com sucesso!');
        } else if (/^\d{4}$/.test(newPin)) {
            localStorage.setItem('diary_pin', newPin);
            await customAlert('PIN definido com sucesso!');
        } else {
            await customAlert('PIN inválido. Por favor, use 4 dígitos numéricos.');
        }
    }
    
    async function performSearch(query) {
         if (!query || query.length < 2) {
            searchResultsEl.innerHTML = '';
            return;
        }
        const lowerQuery = query.toLowerCase();
        const results = [];
        const books = await new Promise(r => db.transaction('diaries').objectStore('diaries').getAll().onsuccess = e => r(e.target.result));
        const bookMap = new Map(books.map(b => [b.id, b.name]));

        const transaction = db.transaction('entries', 'readonly');
        const store = transaction.objectStore('entries');
        store.openCursor().onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
                const entry = cursor.value;
                if (entry.content.toLowerCase().includes(lowerQuery)) {
                    results.push(entry);
                }
                cursor.continue();
            } else {
                renderSearchResults(results, bookMap);
            }
        };
    }
    
    function renderSearchResults(results, bookMap) {
        searchResultsEl.innerHTML = '';
        if (results.length === 0) {
            searchResultsEl.innerHTML = '<li>Nenhum resultado encontrado.</li>';
            return;
        }
        results.slice(0, 10).forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${entry.content.substring(0, 40)}...
                <small>${bookMap.get(entry.diaryId)} - ${formatDate(new Date(entry.date.replace(/-/g, '/')))}</small>
            `;
            li.onclick = async () => {
                await selectBook(entry.diaryId);
                navigateToDate(entry.date.replace(/-/g, '/'));
            };
            searchResultsEl.appendChild(li);
        }
        );
    }

    async function exportData() {
        const confirmed = await customConfirm('Isso irá baixar um arquivo com todos os seus livros e notas. Continuar?');
        if (!confirmed) return;

        const diaries = await new Promise(r => db.transaction('diaries').objectStore('diaries').getAll().onsuccess = e => r(e.target.result));
        const entries = await new Promise(r => db.transaction('entries').objectStore('entries').getAll().onsuccess = e => r(e.target.result));
        
        const backupData = JSON.stringify({ diaries, entries }, null, 2);
        const blob = new Blob([backupData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `livros_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    async function importData() {
        const confirmed = await customConfirm('ATENÇÃO: Isso irá substituir TODOS os dados atuais. Esta ação não pode ser desfeita. Deseja continuar?');
        if (!confirmed) return;
        importFileInput.click();
    }
    
    async function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        const text = await file.text();
        try {
            const data = JSON.parse(text);
            if (!data.diaries || !data.entries) throw new Error('Arquivo de backup inválido.');
            
            const diaryTx = db.transaction('diaries', 'readwrite');
            await new Promise((resolve, reject) => {
                const request = diaryTx.objectStore('diaries').clear();
                request.onsuccess = resolve;
                request.onerror = reject;
            });
            for (const diary of data.diaries) {
                if (diary.emojisEnabled === undefined) {
                    diary.emojisEnabled = true;
                }
                if (diary.startDate === undefined) {
                    diary.startDate = new Date().toISOString().split('T')[0];
                }
                await new Promise((resolve, reject) => {
                    const request = diaryTx.objectStore('diaries').put(diary);
                    request.onsuccess = resolve;
                    request.onerror = reject;
                });
            }
            
            const entryTx = db.transaction('entries', 'readwrite');
            await new Promise((resolve, reject) => {
                const request = entryTx.objectStore('entries').clear();
                request.onsuccess = resolve;
                request.onerror = reject;
            });
            for (const entry of data.entries) {
                await new Promise((resolve, reject) => {
                    const request = entryTx.objectStore('entries').put(entry);
                    request.onsuccess = resolve;
                    request.onerror = reject;
                });
            }

            await customAlert('Importação concluída com sucesso! O aplicativo será recarregado.');
            location.reload();
        } catch (e) {
            console.error('Falha na importação:', e);
            await customAlert('Erro ao importar o arquivo. Verifique se o arquivo é um backup válido.');
        }
    }
    
    function openDrawer() {
        drawer.classList.add('open');
        overlay.classList.add('visible');
        mainContent.classList.add('drawer-open');
    }

    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('visible');
        mainContent.classList.remove('drawer-open');
        searchInput.value = '';
        searchResultsEl.innerHTML = '';
    }

    function setupEventListeners() {
        cover.addEventListener('click', () => { if (!cover.classList.contains('open')) openBook(); });
        currentBookTitle.addEventListener('click', () => closeBook(true));
        menuBtn.addEventListener('click', openDrawer);
        overlay.addEventListener('click', closeDrawer);
        addBookBtn.addEventListener('click', () => addBook(newBookNameInput.value));
        prevPageBtn.addEventListener('click', prevPage);
        nextPageBtn.addEventListener('click', nextPage);
        pageContentEl.addEventListener('keyup', debouncedSave);
        moodOptions.addEventListener('click', (e) => {
            if (e.target.classList.contains('mood')) {
                updateMoodSelection(e.target.dataset.mood);
                debouncedSave();
            }
        });
        themeSwatches.forEach(swatch => swatch.addEventListener('click', () => applyTheme(swatch.dataset.theme)));
        pinSettingsBtn.addEventListener('click', setPin);
        pinKeypad.addEventListener('click', e => {
            if(e.target.classList.contains('key')) {
                if(e.target.id === 'pin-clear') { pinInput = ''; pinDisplay.textContent = ''; }
                else if(e.target.id === 'pin-backspace') { pinInput = pinInput.slice(0, -1); pinDisplay.textContent = '•'.repeat(pinInput.length); }
                else { handlePinInput(e.target.textContent); }
            }
        });
        exportBtn.addEventListener('click', exportData);
        importBtn.addEventListener('click', importData);
        importFileInput.addEventListener('change', handleFileImport);
        searchInput.addEventListener('input', e => performSearch(e.target.value));
    }
    
    initDB();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('ServiceWorker registrado com sucesso: ', registration.scope);
    }, err => {
      console.log('Registro do ServiceWorker falhou: ', err);
    });
  });
}
