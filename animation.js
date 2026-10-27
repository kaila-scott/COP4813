
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gardenCanvas");
    const ctx = canvas.getContext("2d");
    const message = document.getElementById("gardenMessage");
    const restart = document.getElementById("restartGarden");

    const pet = {
        x: 160,
        y: 160,
        radius: 48,
        dx: 2.7,
        dy: 2.1
    };

    let hearts = [];
    let lastTime = 0;

    // Draw a little garden leaf.
    function drawLeaf(x, y, size, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = "#86a96a";
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size / 2, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#426b3d";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-size, 3);
        ctx.lineTo(size, -3);
        ctx.stroke();
        ctx.restore();
    }

    // Draw the decorative background.
    function drawGarden() {
        ctx.fillStyle = "#fff7e9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#e4edcd";
        ctx.fillRect(0, 395, canvas.width, 55);

        for (let i = 0; i < 12; i++) {
            const x = 25 + i * 68;
            drawLeaf(x, 32, 13, i * 0.6);
            drawLeaf(x + 18, 420, 12, -i * 0.5);
        }

        ctx.fillStyle = "#f2dcae";
        for (let i = 0; i < 14; i++) {
            ctx.beginPath();
            ctx.arc(25 + i * 59, 75 + (i % 3) * 90, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw our cartoon capybara with Canvas.
    function drawCapybara() {
        ctx.save();
        ctx.translate(pet.x, pet.y);

        // Turn its face toward the direction of travel.
        if (pet.dx < 0) {
            ctx.scale(-1, 1);
        }

        // Feet
        ctx.fillStyle = "#8a583b";
        ctx.beginPath();
        ctx.ellipse(-21, 33, 12, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(20, 33, 12, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rounded body
        ctx.fillStyle = "#bd8557";
        ctx.beginPath();
        ctx.ellipse(0, 7, 49, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = "#98613f";
        ctx.beginPath();
        ctx.ellipse(13, -31, 9, 13, -0.2, 0, Math.PI * 2);
        ctx.ellipse(38, -26, 8, 11, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = "#cd9565";
        ctx.beginPath();
        ctx.ellipse(23, -8, 35, 30, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Muzzle
        ctx.fillStyle = "#dfae80";
        ctx.beginPath();
        ctx.ellipse(46, 5, 16, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#30251f";
        ctx.beginPath();
        ctx.arc(19, -13, 3.5, 0, Math.PI * 2);
        ctx.arc(43, -10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.beginPath();
        ctx.ellipse(57, 1, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Happy smile
        ctx.strokeStyle = "#603c2b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(47, 5, 8, 0.1, 1.3);
        ctx.stroke();

        // Pink cheek
        ctx.fillStyle = "#e9a08e";
        ctx.beginPath();
        ctx.arc(28, 4, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawHearts(delta) {
        for (const heart of hearts) {
            heart.y -= delta * 0.9;
            heart.life -= delta;

            ctx.save();
            ctx.globalAlpha = Math.max(0, heart.life / 65);
            ctx.fillStyle = "#ed8d88";
            ctx.font = "25px sans-serif";
            ctx.fillText("♥", heart.x, heart.y);
            ctx.restore();
        }

        hearts = hearts.filter(heart => heart.life > 0);
    }

    function animate(time) {
        const delta = lastTime
            ? Math.min((time - lastTime) / 16.67, 3)
            : 1;
        lastTime = time;

        pet.x += pet.dx * delta;
        pet.y += pet.dy * delta;

        // Bounce at the left and right boundaries.
        const limit = 65;
        if (pet.x < limit || pet.x > canvas.width - limit) {
            pet.dx *= -1;
            pet.x = Math.max(limit, Math.min(canvas.width - limit, pet.x));
        }

        // Bounce at the top and bottom boundaries.
        if (pet.y < limit || pet.y > canvas.height - limit) {
            pet.dy *= -1;
            pet.y = Math.max(limit, Math.min(canvas.height - limit, pet.y));
        }

        drawGarden();
        drawCapybara();
        drawHearts(delta);

        requestAnimationFrame(animate);
    }

    canvas.addEventListener("click", event => {
        const rect = canvas.getBoundingClientRect();

        // Convert browser coordinates to canvas coordinates.
        const mouseX = (event.clientX - rect.left)
            * canvas.width / rect.width;
        const mouseY = (event.clientY - rect.top)
            * canvas.height / rect.height;

        const distance = Math.hypot(mouseX - pet.x, mouseY - pet.y);

        // Only react when the capybara itself is clicked.
        if (distance <= 58) {
            pet.dx *= -1;
            pet.dy *= -1;

            for (let i = 0; i < 8; i++) {
                hearts.push({
                    x: pet.x + (Math.random() - 0.5) * 80,
                    y: pet.y - Math.random() * 35,
                    life: 65
                });
            }

            message.textContent =
                "💕 You pet the capybara! It changed direction!";
        }
    });

    restart.addEventListener("click", () => {
        pet.x = 160;
        pet.y = 160;
        pet.dx = 2.7;
        pet.dy = 2.1;
        hearts = [];

        message.textContent =
            "🍃 A fresh start! Click the capybara to give it some love.";
    });

    requestAnimationFrame(animate);
});
