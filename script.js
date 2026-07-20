const prism = document.getElementById('prism');
const audio = document.getElementById('bgMusic');
const submitBtn = document.getElementById('submitBtn');
const serverMsg = document.getElementById('serverMsg');

let currentAngle = 0;
let isAudioPlaying = false;

const savedData = {
    date: '', time: '', answer1: '', answer2: '', choice: ''
};

function movePrism(direction) {
    if (!isAudioPlaying) {
        audio.play().catch(e => console.log("Audio waiting"));
        isAudioPlaying = true;
    }

    if (direction === 'next') {
        currentAngle -= 45;
    } else if (direction === 'prev') {
        currentAngle += 45;
    }
    prism.style.transform = `rotateY(${currentAngle}deg)`;
}

const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        if (button.classList.contains('next-step-btn')) {
            const step = event.target.getAttribute('data-step');
            if (step === '1') {
                savedData.date = document.getElementById('dateInput').value;
                savedData.time = document.getElementById('timeInput').value;
            } else if (step === '2') {
                savedData.answer1 = document.getElementById('answer1').value;
            } else if (step === '3') {
                savedData.answer2 = document.getElementById('answer2').value;
            } else if (step === '4') {
                savedData.choice = document.getElementById('choiceSelect').value;
            }
        }
        const dir = event.target.getAttribute('data-dir');
        movePrism(dir);
    });
});


submitBtn.addEventListener('click', async () => {
    if (!savedData.date) {
        serverMsg.style.color = '#e74c3c';
        serverMsg.textContent = 'Błąd: Cofnij się i podaj datę!';
        return;
    }

    try {
        serverMsg.style.color = '#f1c40f';
        serverMsg.textContent = 'Wysyłanie...';

        const response = await fetch('https://prism-backend-ch5h.onrender.com/api/save-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(savedData)
        });

        if (response.ok) {
            serverMsg.textContent = '';

            // 1. Zakończono sukcesem - idziemy na ekran "Dziękujemy"
            movePrism('next');

            // 2. Po 3 sekundach obrót na ostatnią (czarną) kartę
            setTimeout(() => {
                movePrism('next');

                // 3. Po ułamku sekundy, gdy karta pojawi się na środku ekranu, rozszerzamy ją!
                setTimeout(() => {
                    const finalScreen = document.getElementById('finalScreen');
                    if(finalScreen) {
                        finalScreen.classList.add('expand');
                    }
                }, 600);

                // Płynne wyciszenie muzyki
                let vol = 1;
                const fadeOut = setInterval(() => {
                    if (vol > 0.05) {
                        vol -= 0.05;
                        audio.volume = vol;
                    } else {
                        audio.pause();
                        clearInterval(fadeOut);
                    }
                }, 100);

            }, 3000);

        } else {
            serverMsg.style.color = '#e74c3c';
            serverMsg.textContent = 'Błąd serwera.';
        }
    } catch (error) {
        serverMsg.style.color = '#e74c3c';
        serverMsg.textContent = 'Brak połączenia z serwerem.';
    }
});
