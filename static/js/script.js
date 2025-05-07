document.addEventListener('DOMContentLoaded', () => {
    const genderFrame = document.querySelector('.gender-frame');
    const genderMarker = document.querySelector('.gender-marker');
    const popup = document.getElementById('popup');
    const popupTitle = popup.querySelector('.popup-title');
    const popupContent = popup.querySelector('.popup-content');
    const textBox = document.getElementById('text-box');
    const textBoxTitle = document.getElementById('text-box-title');
    const textBoxContent = document.getElementById('text-box-content');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const toggleBtn = document.getElementById('toggleViewBtn');
    const donutCanvas = document.getElementById('donutChart');
    const compareWrapper = document.getElementById('compareModeWrapper');

    let currentSort = 'Male';
    let currentFilter = 'all';
    let isDragging = false;
    let isBarView = true;
    let chartInstance = null;

    const reasons = Object.keys(genderPercentages);
    const totalMalePercentage = reasons.reduce((sum, reason) => sum + genderPercentages[reason]['Male'], 0);
    const avgMalePercentage = totalMalePercentage / reasons.length;
    const initialPosition = avgMalePercentage;

    genderMarker.style.left = `${initialPosition}%`;
    genderMarker.classList.remove('hidden');
    updateDisplay(avgMalePercentage, currentFilter);

    if (currentFilter === 'all') {
        compareWrapper.classList.remove('hidden');
    } else {
        compareWrapper.classList.add('hidden');
    }

    toggleBtn.addEventListener('click', () => {
        isBarView = !isBarView;
        textBox.classList.toggle('hidden', !isBarView);
        donutCanvas.classList.toggle('hidden', isBarView);
        toggleBtn.textContent = isBarView ? '📊 Switch to Donut View' : '🟦 Switch to Bar View';

        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        if (!isBarView) {
            if (currentFilter === 'all') {
                renderDonutChart(reasons);
            } else {
                renderSingleReasonPieChart(currentFilter);
            }
        }
    });

    function updateDisplay(malePercentage, filter) {
        const filteredReasons = filter === 'all' ? reasons : [filter];
        const displayName = filter === 'all' ? 'Reasons for MBA' : filter;

        let avgFemale = 0, avgOther = 0;
        filteredReasons.forEach(reason => {
            avgFemale += genderPercentages[reason]['Female'];
            avgOther += genderPercentages[reason]['Other'];
        });
        avgFemale /= filteredReasons.length;
        avgOther /= filteredReasons.length;

        const remaining = 100 - malePercentage;
        const totalRemaining = avgFemale + avgOther;
        let femalePercentage = remaining / 2;
        let otherPercentage = remaining / 2;
        if (totalRemaining > 0) {
            femalePercentage = (avgFemale / totalRemaining) * remaining;
            otherPercentage = (avgOther / totalRemaining) * remaining;
        }

        popupTitle.textContent = displayName;
        popupContent.innerHTML = `
            <div class="bars">
                <div class="gender-entry">
                    <span class="gender-label">Male</span>
                    <div class="bar male-bar" style="width: ${malePercentage.toFixed(1)}%;"></div>
                    <span class="male-percentage">${Math.round(malePercentage)}%</span>
                </div>
                <div class="gender-entry">
                    <span class="gender-label">Female</span>
                    <div class="bar female-bar" style="width: ${femalePercentage.toFixed(1)}%;"></div>
                    <span class="female-percentage">${Math.round(femalePercentage)}%</span>
                </div>
                <div class="gender-entry">
                    <span class="gender-label">Other</span>
                    <div class="bar other-bar" style="width: ${otherPercentage.toFixed(1)}%;"></div>
                    <span class="other-percentage">${Math.round(otherPercentage)}%</span>
                </div>
            </div>
        `;

        textBoxTitle.textContent = displayName;
        let html = '';

        filteredReasons.forEach(reason => {
            const male = genderPercentages[reason]['Male'];
            const female = genderPercentages[reason]['Female'];
            const other = genderPercentages[reason]['Other'];

            html += `
                <div class="reason">
                    <span class="reason-name">${reason}</span>
                    <div class="reason-bar-wrapper">
                        <div class="bar-cell">
                            <div class="percent male">${male.toFixed(1)}%</div>
                            <div class="reason-bar male" style="width: ${male * 1.5}px;"></div>
                        </div>
                        <div class="bar-cell">
                            <div class="percent female">${female.toFixed(1)}%</div>
                            <div class="reason-bar female" style="width: ${female * 1.5}px;"></div>
                        </div>
                        <div class="bar-cell">
                            <div class="percent other">${other.toFixed(1)}%</div>
                            <div class="dot other-bar"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        if (filter === 'all') {
            const sorted = reasons.slice().sort((a, b) => genderPercentages[b][currentSort] - genderPercentages[a][currentSort]).slice(0, 4);
            html += `
                <div class="top-reasons">
                    <h4>TOP ${sorted.length} REASONS</h4>
                    <div class="sort-buttons">
                        <button class="sort-btn ${currentSort === 'Male' ? 'active' : ''}" data-sort="Male">Male</button>
                        <button class="sort-btn ${currentSort === 'Female' ? 'active' : ''}" data-sort="Female">Female</button>
                        <button class="sort-btn ${currentSort === 'Other' ? 'active' : ''}" data-sort="Other">Other</button>
                    </div>
            `;
            sorted.forEach(reason => {
                const value = genderPercentages[reason][currentSort];
                html += `
                    <div class="reason-item">
                        <span>${reason}</span>
                        <span>${value.toFixed(1)}%</span>
                    </div>
                `;
            });
            html += `</div>`;
        }

        textBoxContent.innerHTML = html.trim();
        textBox.classList.remove('hidden');

        const sortButtons = textBoxContent.querySelectorAll('.sort-btn');
        sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentSort = button.dataset.sort;
                sortButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateDisplay(malePercentage, currentFilter);
            });
        });
    }

    function renderDonutChart(filteredReasons) {
        const male = [], female = [], other = [], labels = [];

        filteredReasons.forEach(reason => {
            labels.push(reason);
            male.push(genderPercentages[reason]['Male']);
            female.push(genderPercentages[reason]['Female']);
            other.push(genderPercentages[reason]['Other']);
        });

        const data = {
            labels,
            datasets: [
                { label: 'Male', data: male, backgroundColor: '#1e90ff' },
                { label: 'Female', data: female, backgroundColor: '#ff4040' },
                { label: 'Other', data: other, backgroundColor: '#ffff00' }
            ]
        };

        const config = {
            type: 'doughnut',
            data,
            options: {
                responsive: true,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            generateLabels: () => [
                                { text: 'Male', fillStyle: '#1e90ff' },
                                { text: 'Female', fillStyle: '#ff4040' },
                                { text: 'Other', fillStyle: '#ffff00' }
                            ]
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}% (${ctx.label})`
                        }
                    }
                }
            }
        };

        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(donutCanvas, config);
        donutCanvas.classList.remove('hidden');
    }

    function renderSingleReasonPieChart(reason) {
        const data = {
            labels: ['Male', 'Female', 'Other'],
            datasets: [{
                data: [
                    genderPercentages[reason]['Male'],
                    genderPercentages[reason]['Female'],
                    genderPercentages[reason]['Other']
                ],
                backgroundColor: ['#1e90ff', '#ff4040', '#ffff00'],
            }]
        };

        const config = {
            type: 'doughnut',
            data,
            options: {
                responsive: true,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            generateLabels: () => [
                                { text: 'Male', fillStyle: '#1e90ff' },
                                { text: 'Female', fillStyle: '#ff4040' },
                                { text: 'Other', fillStyle: '#ffff00' }
                            ]
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.label}: ${ctx.formattedValue}%`
                        }
                    }
                }
            }
        };

        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(donutCanvas, config);
        donutCanvas.classList.remove('hidden');
    }

    function updateMarkerPosition(event) {
        const rect = genderFrame.getBoundingClientRect();
        let clickX = event.clientX - rect.left;
        clickX = Math.max(0, Math.min(clickX, rect.width));
        const positionPercentage = (clickX / rect.width) * 100;
        genderMarker.style.left = `${positionPercentage}%`;
        genderMarker.classList.remove('hidden');
        popup.classList.remove('hidden');
        popup.style.left = `${positionPercentage}%`;
        popup.style.transform = 'translateX(-50%)';
        updateDisplay(positionPercentage, currentFilter);
    }

    genderFrame.addEventListener('click', (event) => {
        if (!isDragging) updateMarkerPosition(event);
    });

    genderMarker.addEventListener('mousedown', (event) => {
        isDragging = true;
        event.preventDefault();
    });

    document.addEventListener('mousemove', (event) => {
        if (isDragging) updateMarkerPosition(event);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedFilter = button.dataset.filter;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = selectedFilter;
            const currentPosition = parseFloat(genderMarker.style.left) || initialPosition;
            updateDisplay(currentPosition, currentFilter);

            if (selectedFilter === 'all') {
                compareWrapper.classList.remove('hidden');
            } else {
                compareWrapper.classList.add('hidden');
            }

            if (!isBarView) {
                if (selectedFilter === 'all') {
                    renderDonutChart(reasons);
                } else {
                    renderSingleReasonPieChart(selectedFilter);
                }
            }
        });
    });

    document.addEventListener('click', (event) => {
        const isClickInsideFrame = genderFrame.contains(event.target);
        const isClickOnMarker = genderMarker.contains(event.target);
        if (!isClickInsideFrame && !isClickOnMarker && !isDragging) {
            popup.classList.add('hidden');
        }
    });

    const reason1Select = document.getElementById('reason1Select');
    const reason2Select = document.getElementById('reason2Select');
    const compareBtn = document.getElementById('compareBtn');
    const compareResult = document.getElementById('compareResult');

    reasons.forEach(reason => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = reason;
        reason1Select.appendChild(opt.cloneNode(true));
        reason2Select.appendChild(opt);
    });

    compareBtn.addEventListener('click', () => {
        const r1 = reason1Select.value;
        const r2 = reason2Select.value;

        if (!r1 || !r2 || r1 === r2) {
            compareResult.innerHTML = '<p style="text-align:center; color:#999;">Please choose two <b>different</b> reasons 👀</p>';
            compareResult.classList.remove('hidden');
            return;
        }

        const genders = ['Male', 'Female', 'Other'];
        compareResult.innerHTML = genders.map(gender => {
            const val1 = genderPercentages[r1][gender];
            const val2 = genderPercentages[r2][gender];
            return `
                <div class="compare-bar">
                    <span>${gender}</span>
                    <div class="bar-group">
                        <div class="bar-box bar-reason1" style="width: ${val1}%;"></div>
                        <small>${val1.toFixed(1)}%</small>
                    </div>
                    <div class="bar-group">
                        <div class="bar-box bar-reason2" style="width: ${val2}%;"></div>
                        <small>${val2.toFixed(1)}%</small>
                    </div>
                </div>
            `;
        }).join('');
        compareResult.classList.remove('hidden');
    });
});