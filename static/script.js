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
    if (isNaN(val) || val <= 0) return;
    
    try {
        const response = await fetch("/prices");
        const data = await response.json();
        const rate = data.rate;
        const converted = val * rate;

        resultValue.innerText = converted.toFixed(2);
    } catch (error) {
        console.error("Error when searching for price:", error);
    }
}


function saveToHistory(original, converted) {
    const entry = {
        time: new Date().toLocaleTimeString(),
        original: original,
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
        li.innerHTML = `<span>Converted: <b>${item.original}</b></span> <span>Result: <b>${item.result}</b></span> <small>${item.time}</small>`;
        list.appendChild(li);
    });
}


refreshBtn.addEventListener("click", () => {
    const val = parseFloat(amountInput.value);
    const converted = parseFloat(resultValue.innerText);
    if (!isNaN(val)) {
        saveToHistory(val, converted);
    }
});

// Atualização automática (Tempo Real)
amountInput.addEventListener("input", convertCurrency);
fromSelect.addEventListener("change", convertCurrency);
toSelect.addEventListener("change", () => {
    updateSymbol();    
    convertCurrency();
});


renderHistory();
updateSymbol();