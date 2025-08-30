document.addEventListener('DOMContentLoaded', () => {
    const timersContainer = document.getElementById('timersContainer');
    const timerCountInput = document.getElementById('timerCount');
    const updateTimersBtn = document.getElementById('updateTimers');
    const editModal = document.getElementById('editModal');
    const editHoursInput = document.getElementById('editHours');
    const editMinutesInput = document.getElementById('editMinutes');
    const editTargetMinutesInput = document.getElementById('editTargetMinutes');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    let timers = [];
    let currentEditingUnitIndex = null;

    // タイマーのHTMLテンプレート
    const timerTemplate = (id) => `
        <div class="timer-unit">
            <div class="current-time" id="currentTime${id}">--:--:--</div>
            <div class="remaining-time" id="remainingTime${id}">00:00:00</div>
            <div class="time-records">
                <div class="time-record out-time">
                    <span class="label">OUT</span>
                    <span id="outTime${id}">--:--</span>
                </div>
                <div class="target-time-display">
                    <span class="label">Target Time</span>
                    <span id="targetTime${id}">--:--</span>
                    <span class="edit-icon" data-id="${id}">✏️</span>
                </div>
                <div class="time-record in-time">
                    <span class="label">IN</span>
                    <span id="inTime${id}">--:--</span>
                </div>
            </div>
            <div class="control-buttons">
                <button class="control-btn" data-id="${id}">IN</button>
            </div>
        </div>
    `;

    // タイマーを生成してイベントリスナーを設定する関数
    function generateTimers() {
        const count = parseInt(timerCountInput.value);
        if (isNaN(count) || count < 1) {
            alert('有効なタイマーの数を入力してください。');
            return;
        }

        // 既存のタイマーをクリア
        timersContainer.innerHTML = '';
        timers = [];

        for (let i = 1; i <= count; i++) {
            timersContainer.insertAdjacentHTML('beforeend', timerTemplate(i));
            timers.push({
                serviceInTime: null,
                targetMinutes: 5,
                elements: {
                    remainingTime: document.getElementById(`remainingTime${i}`),
                    inTime: document.getElementById(`inTime${i}`),
                    outTime: document.getElementById(`outTime${i}`),
                    targetTime: document.getElementById(`targetTime${i}`)
                }
            });
        }
        
        // 新しく生成されたボタンにイベントリスナーを再設定
        addEventListeners();
    }
    
    // イベントリスナーをボタンに動的に設定する関数
    function addEventListeners() {
        const inBtns = document.querySelectorAll('.control-btn');
        const editBtns = document.querySelectorAll('.edit-icon');

        inBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const timer = timers[id - 1];
                timer.serviceInTime = new Date();
                updateTimesDisplay(timer);
                updateRemainingTime();
            });
        });

        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                currentEditingUnitIndex = id - 1;
                const timer = timers[currentEditingUnitIndex];
                
                editModal.style.display = 'flex';
                
                if (timer.serviceInTime) {
                    editHoursInput.value = timer.serviceInTime.getHours();
                    editMinutesInput.value = timer.serviceInTime.getMinutes();
                } else {
                    const now = new Date();
                    editHoursInput.value = now.getHours();
                    editMinutesInput.value = now.getMinutes();
                }
                editTargetMinutesInput.value = timer.targetMinutes;
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
            const targetSeconds = timer.targetMinutes * 60;
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

            const outTime = new Date(timer.serviceInTime.getTime() + timer.targetMinutes * 60 * 1000);
            const outHours = outTime.getHours().toString().padStart(2, '0');
            const outMinutes = outTime.getMinutes().toString().padStart(2, '0');
            timer.elements.outTime.textContent = `${outHours}:${outMinutes}`;
        }
        timer.elements.targetTime.textContent = `${timer.targetMinutes} min`;
    }

    // イベントリスナーの設定
    updateTimersBtn.addEventListener('click', generateTimers);

    saveEditBtn.addEventListener('click', () => {
        const newHours = parseInt(editHoursInput.value);
        const newMinutes = parseInt(editMinutesInput.value);
        const newTargetMinutes = parseInt(editTargetMinutesInput.value);

        if (currentEditingUnitIndex !== null && !isNaN(newHours) && !isNaN(newMinutes) && !isNaN(newTargetMinutes) && newTargetMinutes > 0) {
            const timer = timers[currentEditingUnitIndex];
            const now = new Date();
            timer.serviceInTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), newHours, newMinutes, 0, 0);
            timer.targetMinutes = newTargetMinutes;
            
            editModal.style.display = 'none';
            updateTimesDisplay(timer);
            updateRemainingTime();
        } else {
            alert('有効な値を入力してください。');
        }
    });

    closeModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });
    
    // 初期表示
    generateTimers();
    updateCurrentTime();
});