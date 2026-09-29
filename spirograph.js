let animationId = null;

document.addEventListener("DOMContentLoaded", function () {
    const spiroForm = document.getElementById("spiroForm");

    if (spiroForm) {
        spiroForm.addEventListener("submit", function (event) {
            event.preventDefault();
            startSpirograph();
        });
    }

    clearCanvas();
});

function startSpirograph() {
    const canvas = document.getElementById("spiroCanvas");
    const ctx = canvas.getContext("2d");
    const errorMessage = document.getElementById("spiroError");
    const valuesDisplay = document.getElementById("spiroValues");
    const outerRadiusInput = document.getElementById("outerRadius");

    errorMessage.textContent = "";

    const R = Number(outerRadiusInput.value);

    if (R < 50 || R > 180 || Number.isNaN(R)) {
        errorMessage.textContent = "Please enter an outer radius between 50 and 180.";
        return;
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    clearCanvas();

    const r = getRandomNumber(15, R - 10);
    const O = getRandomNumber(10, r);

    valuesDisplay.innerHTML =
        "Current values: <strong>R = " + R.toFixed(0) +
        "</strong>, <strong>r = " + r.toFixed(0) +
        "</strong>, <strong>O = " + O.toFixed(0) +
        "</strong>. The values for r and O were randomly generated.";

    drawSpirograph(ctx, canvas, R, r, O);
}

function clearCanvas() {
    const canvas = document.getElementById("spiroCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSpirograph(ctx, canvas, R, r, O) {
    let t = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 1.15;
    const maxSteps = 2600;
    let stepCount = 0;

    let previousPoint = getSpiroPosition(t, R, r, O, centerX, centerY, scale);

    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "#2f5d3a";

    function drawSegment() {
        if (stepCount >= maxSteps) {
            return;
        }

        t += 0.035;

        const currentPoint = getSpiroPosition(t, R, r, O, centerX, centerY, scale);

        ctx.beginPath();
        ctx.moveTo(previousPoint.x, previousPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);

        ctx.strokeStyle = getNatureColor(stepCount);
        ctx.stroke();

        previousPoint = currentPoint;
        stepCount += 1;

        animationId = requestAnimationFrame(drawSegment);
    }

    drawSegment();
}

function getSpiroPosition(t, R, r, O, centerX, centerY, scale) {
    const x = ((R + r) * Math.cos(t)) - ((r + O) * Math.cos(((R + r) / r) * t));
    const y = ((R + r) * Math.sin(t)) - ((r + O) * Math.sin(((R + r) / r) * t));

    return {
        x: centerX + (x * scale),
        y: centerY + (y * scale)
    };
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function getNatureColor(step) {
    const colors = [
        "#2f5d3a",
        "#6a994e",
        "#f28c28",
        "#f9c74f",
        "#386641"
    ];

    return colors[step % colors.length];
}