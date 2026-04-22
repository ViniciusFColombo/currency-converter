let myChart;

const symbols = {
    "BRL": "R$",
    "EUR": "€",
    "USD": "$"
};

const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from_currency");
const toSelect = document.getElementById("to_currency");
const resultValue = document.getElementById("converted-value");
const refreshBtn = document.getElementById("refresh-btn");
const processChange = debounce(() => convertCurrency());


function updateSymbol() {
    const selectedCurrency = toSelect.value;
    document.getElementById("currency-symbol").innerText = symbols[selectedCurrency];
}


async function convertCurrency() {
    if (amountInput.value === "") {
        resultValue.innerText = "0.00";
        return;
    }
    
    const val = parseFloat(amountInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;
    if (isNaN(val) || val <= 0) return;
    
    try {
        const response = await fetch(`/prices?from_curr=${from}&to_curr=${to}`);
        const data = await response.json();
        const rate = data.rate;
        const converted = val * rate;

        resultValue.innerText = converted.toFixed(2);
    } catch (error) {
        console.error("Error when searching for price:", error);
    }

}

function saveToHistory(original, converted, from, to) {
    const entry = {
        time: new Date().toLocaleTimeString(),
        original: original,
        from: from,
        to: to,
        result: converted.toFixed(2)
    };

    let history = JSON.parse(localStorage.getItem("conversions")) || [];
    history.unshift(entry);
    localStorage.setItem("conversions", JSON.stringify(history.slice(0, 5)));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = "";

    const history = JSON.parse(localStorage.getItem("conversions")) || [];
    history.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<span>Converted: <b>${item.original} ${item.from}</b></span><span> → </span><span>Result: <b>${item.result} ${item.to}</b></span> <small>${item.time}</small>`;
        list.appendChild(li);
    });
}

async function updateChart(from, to) {
    try {
        const response = await fetch(`/history/${from}/${to}`);
        const data = await response.json();

        const labels = data.map(item => {
            const date = new Date(item.timestamp * 1000);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        
        const prices = data.map(item => parseFloat(item.bid));

        const ctx = document.getElementById('currencyChart').getContext('2d');

        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${from} to ${to} Variation (Last 7 Days)`, 
                    data: prices,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: { color: '#7f8c8d' }
                    },
                    x: {
                        ticks: { color: '#7f8c8d' }
                    }
                }
            }
        });

        generateAIInsight(prices, from, to);
    } catch (error) {
        console.error("Error loading chart and insight:", error);
    }
}

function generateAIInsight(prices, from, to) {
    const todayPrice = prices[prices.length - 1];
    const yesterdayPrice = prices[prices.length - 2];

    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length;

    let message = "";
    let color = "";

    if (todayPrice < avg) {
        message = `<b>AI Insight:</b> Good time to buy <b>${from}</b>. It's currently below the weekly average.`;
        color = "#27ae60";
    } else if (todayPrice > avg * 1.05) {
        message = `<b>AI Insight:</b> <b>${from}</b> is quite high today. Maybe wait for a dip before buying`;
        color = "#e67e22";
    } else {
        message = `<b>AI Insight:</b> <b>${from}</b> is stable compared to the weekly trend`;
        color = "#34495e";
    }

    const insightElement = document.getElementById("ai-insight");
    insightElement.innerHTML = message;
    insightElement.style.borderLeft = `5px solid ${color}`;
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

refreshBtn.addEventListener("click", () => {
    const val = parseFloat(amountInput.value);
    const converted = parseFloat(resultValue.innerText);
    const from = fromSelect.value;
    const to = toSelect.value;

    if (!isNaN(val)) {
        saveToHistory(val, converted, from, to);
    }
});

amountInput.addEventListener("input", processChange);
fromSelect.addEventListener("change", () => {    
    convertCurrency();
    updateChart(fromSelect.value, toSelect.value);
});
toSelect.addEventListener("change", () => {
    updateSymbol();    
    convertCurrency();
    updateChart(fromSelect.value, toSelect.value);
});


updateChart(fromSelect.value, toSelect.value);
renderHistory();
updateSymbol();
