document.addEventListener('DOMContentLoaded', () => {
    const timersContainer = document.getElementById('timersContainer');
    const timerCountInput = document.getElementById('timerCount');
    const updateTimersBtn = document.getElementById('updateTimers');
    const editBtnCommon = document.getElementById('editBtnCommon');
    const targetTimeCommonEl = document.getElementById('targetTimeCommon');
    const editModal = document.getElementById('editModal');
    const editTargetMinutesInput = document.getElementById('editTargetMinutes');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const setInTimeModal = document.getElementById('setInTimeModal');
    const setHoursInput = document.getElementById('setHours');
    const setMinutesInput = document.getElementById('setMinutes');
    const saveInTimeBtn = document.getElementById('saveInTimeBtn');
    const closeInTimeBtn = document.getElementById('closeInTimeBtn');

    let timers = [];
    let commonTargetMinutes = 5; // 共通の目標時間

    // タイマーのHTMLテンプレート
    const timerTemplate = (id) => `
        <div class="timer-unit">
            <div class="current-time">--:--:--</div>
            <div class="remaining-time" id="remainingTime${id}">00:00:00</div>
            <div class="time-records">
                <div class="time-record out-time">
                    <span class="label">OUT</span>
                    <span id="outTime${id}">--:--</span>
                </div>
                <div class="target-time-display">
                    <span class="label">IN</span>
                    <span id="inTime${id}">--:--</span>
                </div>
            </div>
            <div class="control-buttons">
                <button class="control-btn" data-id="${id}">IN</button>
            </div>
            <div class="edit-in-time">
                <button class="edit-in-time-btn" data-id="${id}">手動設定</button>
            </div>
        </div>
    `;

    // タイマーを生成
    function generateTimers() {
        const count = parseInt(timerCountInput.value);
        if (isNaN(count) || count < 1) {
            alert('有効なタイマーの数を入力してください。');
            return;
        }

        timersContainer.innerHTML = '';
        timers = [];

        for (let i = 1; i <= count; i++) {
            timersContainer.insertAdjacentHTML('beforeend', timerTemplate(i));
            timers.push({
                serviceInTime: null,
                elements: {
                    remainingTime: document.getElementById(`remainingTime${i}`),
                    inTime: document.getElementById(`inTime${i}`),
                    outTime: document.getElementById(`outTime${i}`),
                }
            });
        }
        
        addEventListeners();
        updateCommonDisplay();
    }
    
    // イベントリスナーを再設定
    function addEventListeners() {
        const inBtns = document.querySelectorAll('.control-btn');
        const editInTimeBtns = document.querySelectorAll('.edit-in-time-btn');

        inBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const timer = timers[id - 1];
                
                // 秒単位を切り捨てた時刻を設定
                const now = new Date();
                now.setSeconds(0, 0);
                timer.serviceInTime = now;
                
                updateTimesDisplay(timer);
            });
        });

        editInTimeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                currentEditingUnitIndex = id - 1;
                setInTimeModal.style.display = 'flex';
                
                // 現在の時刻を初期値としてセット
                const now = new Date();
                setHoursInput.value = now.getHours();
                setMinutesInput.value = now.getMinutes();
            });
        });
    }

    // 現在時刻を更新（全タイマー共通）
    function updateCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        document.querySelectorAll('.current-time').forEach(el => {
            el.textContent = `${hours}:${minutes}:${seconds}`;
        });
    }
    setInterval(updateCurrentTime, 1000);

    // 残り時間を更新（各タイマー）
    function updateRemainingTime() {
        timers.forEach(timer => {
            if (!timer.serviceInTime) return;

            const now = new Date();
            const elapsedTimeInSeconds = Math.floor((now - timer.serviceInTime) / 1000);
            const targetSeconds = commonTargetMinutes * 60;
            const remainingSeconds = targetSeconds - elapsedTimeInSeconds;

            if (remainingSeconds <= 0) {
                timer.elements.remainingTime.textContent = "00:00:00";
                timer.elements.remainingTime.style.color = 'red';
            } else {
                const displayMinutes = Math.floor(remainingSeconds / 60);
                const displaySeconds = remainingSeconds % 60;
                const displayHours = Math.floor(displayMinutes / 60);

                const formattedMinutes = (displayMinutes % 60).toString().padStart(2, '0');
                const formattedSeconds = displaySeconds.toString().padStart(2, '0');
                const formattedHours = displayHours.toString().padStart(2, '0');

                timer.elements.remainingTime.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
                timer.elements.remainingTime.style.color = '#0F0';
            }
        });
    }
    setInterval(updateRemainingTime, 1000);

    // 時間表示を更新
    function updateTimesDisplay(timer) {
        if (timer.serviceInTime) {
            const inHours = timer.serviceInTime.getHours().toString().padStart(2, '0');
            const inMinutes = timer.serviceInTime.getMinutes().toString().padStart(2, '0');
            timer.elements.inTime.textContent = `${inHours}:${inMinutes}`;

            const outTime = new Date(timer.serviceInTime.getTime() + commonTargetMinutes * 60 * 1000);
            const outHours = outTime.getHours().toString().padStart(2, '0');
            const outMinutes = outTime.getMinutes().toString().padStart(2, '0');
            timer.elements.outTime.textContent = `${outHours}:${outMinutes}`;
        }
    }

    // 共通表示を更新
    function updateCommonDisplay() {
        targetTimeCommonEl.textContent = `${commonTargetMinutes} min`;
    }

    // 共通目標時間設定
    editBtnCommon.addEventListener('click', () => {
        editModal.style.display = 'flex';
        editTargetMinutesInput.value = commonTargetMinutes;
    });

    saveEditBtn.addEventListener('click', () => {
        const newTargetMinutes = parseInt(editTargetMinutesInput.value);
        if (!isNaN(newTargetMinutes) && newTargetMinutes > 0) {
            commonTargetMinutes = newTargetMinutes;
            editModal.style.display = 'none';
            updateCommonDisplay();
            // すべてのタイマーの表示を再計算
            timers.forEach(timer => updateTimesDisplay(timer));
            updateRemainingTime();
        } else {
            alert('有効な値を入力してください。');
        }
    });

    closeModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });
    
    // サービスイン時刻手動設定
    saveInTimeBtn.addEventListener('click', () => {
        const newHours = parseInt(setHoursInput.value);
        const newMinutes = parseInt(setMinutesInput.value);
        if (currentEditingUnitIndex !== null && !isNaN(newHours) && !isNaN(newMinutes)) {
            const timer = timers[currentEditingUnitIndex];
            const now = new Date();
            timer.serviceInTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), newHours, newMinutes, 0, 0);
            setInTimeModal.style.display = 'none';
            updateTimesDisplay(timer);
            updateRemainingTime();
        } else {
            alert('有効な値を入力してください。');
        }
    });

    closeInTimeBtn.addEventListener('click', () => {
        setInTimeModal.style.display = 'none';
    });
    
    // 初期表示
    updateTimersBtn.addEventListener('click', generateTimers);
    generateTimers();
});