let voltageChart = null;

document.addEventListener("DOMContentLoaded", function () {
    const plotForm = document.getElementById("plotForm");

    if (plotForm) {
        plotForm.addEventListener("submit", function (event) {
            event.preventDefault();
            calculateAndPlot();
        });

        calculateAndPlot();
    }
});

function calculateVoltage(supplyVoltage, resistance, capacitance, time) {
    return supplyVoltage * (1 - Math.exp(-time / (resistance * capacitance)));
}

function calculateAndPlot() {
    const errorMessage = document.getElementById("plotError");
    const results = document.getElementById("results");
    const circuitSummary = document.getElementById("circuitSummary");

    errorMessage.textContent = "";
    results.innerHTML = "";

    const supplyVoltage = Number(document.getElementById("voltage").value);
    const resistance = Number(document.getElementById("resistance").value);
    const capacitance = Number(document.getElementById("capacitance").value);
    const startTime = Number(document.getElementById("startTime").value);
    const endTime = Number(document.getElementById("endTime").value);
    const timeStep = Number(document.getElementById("timeStep").value);

    if (supplyVoltage <= 0 || resistance <= 0 || capacitance <= 0) {
        errorMessage.textContent = "Voltage, resistance, and capacitance must be greater than zero.";
        return;
    }

    if (startTime < 0 || endTime <= startTime || timeStep <= 0) {
        errorMessage.textContent = "Please enter a valid time range. End time must be greater than start time.";
        return;
    }

    if ((endTime - startTime) / timeStep > 200) {
        errorMessage.textContent = "Please use a larger time step or smaller time range to keep the scatter plot readable.";
        return;
    }

    const scatterPoints = [];
    const tableRows = [];
    const timeConstant = resistance * capacitance;
    const voltageAtTau = calculateVoltage(supplyVoltage, resistance, capacitance, timeConstant);
    const percentAtTau = (voltageAtTau / supplyVoltage) * 100;

    for (let time = startTime; time <= endTime + 0.000001; time += timeStep) {
        const roundedTime = Number(time.toFixed(3));
        const voltage = calculateVoltage(supplyVoltage, resistance, capacitance, roundedTime);
        const roundedVoltage = Number(voltage.toFixed(4));

        scatterPoints.push({
            x: roundedTime,
            y: roundedVoltage
        });

        tableRows.push(
            "<tr><td>" + roundedTime + "</td><td>" + roundedVoltage + "</td></tr>"
        );
    }

    circuitSummary.innerHTML =
        "For this circuit, the time constant is <strong>τ = " +
        timeConstant.toFixed(4) +
        " seconds</strong>. At one time constant, the capacitor reaches about <strong>" +
        percentAtTau.toFixed(1) +
        "%</strong> of the supply voltage.";

    displayChart(scatterPoints, supplyVoltage);
    displayResults(tableRows);
}

function displayChart(scatterPoints, supplyVoltage) {
    const chartCanvas = document.getElementById("voltageChart");

    if (voltageChart) {
        voltageChart.destroy();
    }

    voltageChart = new Chart(chartCanvas, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Capacitor Voltage V(t)",
                data: scatterPoints,
                showLine: true,
                borderColor: "#2f5d3a",
                backgroundColor: "#f28c28",
                pointBorderColor: "#2f5d3a",
                pointBackgroundColor: "#f28c28",
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.25
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "RC Circuit Charging Scatter Plot"
                },
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return "Time: " + context.parsed.x + " sec, Voltage: " + context.parsed.y + " V";
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Time in seconds"
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: "Voltage in volts"
                    },
                    beginAtZero: true,
                    suggestedMax: supplyVoltage
                }
            }
        }
    });
}

function displayResults(tableRows) {
    const results = document.getElementById("results");

    results.innerHTML =
        "<table class='data-table'>" +
        "<thead>" +
        "<tr><th>Time (seconds)</th><th>Voltage (volts)</th></tr>" +
        "</thead>" +
        "<tbody>" +
        tableRows.join("") +
        "</tbody>" +
        "</table>";
}