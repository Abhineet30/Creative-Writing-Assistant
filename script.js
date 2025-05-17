document.addEventListener('DOMContentLoaded', () => {
    const roleForm = document.getElementById('role-form');
    const roleSelect = document.getElementById('role-select');
    const interviewSection = document.getElementById('interview-section');
    const questionNumberSpan = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    const answerText = document.getElementById('answer-text');
    const startRecordingBtn = document.getElementById('start-recording');
    const stopRecordingBtn = document.getElementById('stop-recording');
    const audioPlayback = document.getElementById('audio-playback');
    const timerDisplay = document.getElementById('timer-display');
    const nextQuestionBtn = document.getElementById('next-question');
    const evaluationSection = document.getElementById('evaluation-section');
    const evaluationResults = document.getElementById('evaluation-results');
    const restartInterviewBtn = document.getElementById('restart-interview');

    const totalQuestions = 5;
    let currentQuestionIndex = 0;
    let questions = [];
    let answers = [];
    let timerDuration = 120; // 2 minutes per question
    let timerInterval = null;
    let timeLeft = timerDuration;

    let mediaRecorder = null;
    let audioChunks = [];

    roleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = roleSelect.value;
        if (!role) return;

        // Reset state
        currentQuestionIndex = 0;
        answers = [];
        evaluationResults.innerHTML = '';
        evaluationSection.classList.add('hidden');
        interviewSection.classList.remove('hidden');
        roleForm.classList.add('hidden');
        nextQuestionBtn.disabled = true;
        answerText.value = '';
        audioPlayback.classList.add('hidden');
        audioPlayback.src = '';

        // Fetch questions from AI (simulate here)
        questions = await fetchQuestions(role);
        displayQuestion(currentQuestionIndex);
        startTimer();
    });

    nextQuestionBtn.addEventListener('click', () => {
        saveAnswer();
        currentQuestionIndex++;
        if (currentQuestionIndex < totalQuestions) {
            displayQuestion(currentQuestionIndex);
            resetTimer();
            startTimer();
            nextQuestionBtn.disabled = true;
            answerText.value = '';
            audioPlayback.classList.add('hidden');
            audioPlayback.src = '';
        } else {
            endInterview();
        }
    });

    startRecordingBtn.addEventListener('click', async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Audio recording is not supported in this browser.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.ondataavailable = e => {
                audioChunks.push(e.data);
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayback.src = audioUrl;
                audioPlayback.classList.remove('hidden');
            };
            mediaRecorder.start();
            startRecordingBtn.disabled = true;
            stopRecordingBtn.disabled = false;
        } catch (err) {
            alert('Could not start audio recording: ' + err.message);
        }
    });

    stopRecordingBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            startRecordingBtn.disabled = false;
            stopRecordingBtn.disabled = true;
        }
    });

    function displayQuestion(index) {
        questionNumberSpan.textContent = index + 1;
        questionText.textContent = questions[index];
        nextQuestionBtn.disabled = true;
    }

    function saveAnswer() {
        const textAnswer = answerText.value.trim();
        // For simplicity, only save text answer. Audio answer can be extended later.
        answers.push({
            question: questions[currentQuestionIndex],
            answer: textAnswer
        });
    }

    function startTimer() {
        timeLeft = timerDuration;
        timerDisplay.textContent = formatTime(timeLeft);
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                nextQuestionBtn.disabled = false;
                alert("Time's up! Please proceed to the next question.");
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timeLeft = timerDuration;
        timerDisplay.textContent = formatTime(timeLeft);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    async function fetchQuestions(role) {
        // Simulate AI question generation based on role
        // In real implementation, call AI API with prompt: 
        // "Ask me five technical and behavioral interview questions for a [role] role."
        if (role === 'frontend-developer') {
            return [
                "Can you explain the box model in CSS?",
                "How do you optimize a website's performance?",
                "Describe a challenging bug you fixed in your frontend code.",
                "How do you ensure accessibility in your web applications?",
                "Tell me about a time you had to work with a difficult team member."
            ];
        } else if (role === 'backend-developer') {
            return [
                "What is REST and how do you design RESTful APIs?",
                "How do you handle database migrations?",
                "Describe a time you optimized a slow query.",
                "What are the differences between SQL and NoSQL databases?",
                "Tell me about a time you faced a critical production issue."
            ];
        } else if (role === 'designer') {
            return [
                "How do you approach user-centered design?",
                "What tools do you use for prototyping?",
                "Describe a project where you improved the user experience.",
                "How do you handle feedback from stakeholders?",
                "Tell me about a time you had to meet a tight deadline."
            ];
        } else if (role === 'product-manager') {
            return [
                "How do you prioritize features in a product roadmap?",
                "Describe a time you managed conflicting stakeholder interests.",
                "How do you measure product success?",
                "What is your approach to user research?",
                "Tell me about a challenging project you led."
            ];
        } else {
            return [
                "Tell me about yourself.",
                "What are your strengths and weaknesses?",
                "Describe a challenging situation you faced.",
                "How do you handle stress and pressure?",
                "Where do you see yourself in five years?"
            ];
        }
    }

    async function endInterview() {
        saveAnswer();
        interviewSection.classList.add('hidden');
        evaluationSection.classList.remove('hidden');

        // Simulate AI evaluation
        // In real implementation, send questions and answers to AI for evaluation and rating
        let evaluationHtml = '';
        answers.forEach((qa, index) => {
            evaluationHtml += `<h3>Question ${index + 1}:</h3><p>${qa.question}</p>`;
            evaluationHtml += `<h4>Your Answer:</h4><p>${qa.answer || '<em>No answer provided</em>'}</p>`;
            evaluationHtml += `<h4>AI Rating:</h4><p>Good</p><hr/>`;
        });
        evaluationResults.innerHTML = evaluationHtml;
    }

    restartInterviewBtn.addEventListener('click', () => {
        evaluationSection.classList.add('hidden');
        roleForm.classList.remove('hidden');
        answerText.value = '';
        audioPlayback.classList.add('hidden');
        audioPlayback.src = '';
    });

    answerText.addEventListener('input', () => {
        nextQuestionBtn.disabled = answerText.value.trim().length === 0;
    });
});
