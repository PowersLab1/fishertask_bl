document.addEventListener('DOMContentLoaded', () => {
    const instructionsDiv = document.getElementById('instructions');
    const imageElement = document.getElementById('image');
    const feedbackDiv = document.getElementById('feedback');
    const colors = ["red", "blue", "green"];
    // const baseUrl = "https://raw.githubusercontent.com/maxsupergreenwald/FisherResources/main/resources/";
    let experimentData = [];
    let currentBlock = 0;
    let currentTrial = 0;
    let instructionStage = 0; // Tracks instruction stages (introduction vs. practice-to-experiment transition)
    let sessionType = 'practice'; // Alternates between 'practice' and 'real'
    let blockTrials; // Will hold trials for the current block
    
    // Set block orders for practice and real experiment
    const practiceOrder = (Math.random() < 0.5) ? [practiceTrials1, practiceTrials2] : [practiceTrials2, practiceTrials1]; // randomize practice block order
    const blockOrderA = [mainTrials1, mainTrials2, mainTrials3, mainTrials4, mainTrials5, mainTrials6, mainTrials7, mainTrials8, mainTrials9, mainTrials10];
    const blockOrderB = [mainTrials10, mainTrials2, mainTrials8, mainTrials3, mainTrials1, mainTrials4, mainTrials5, mainTrials7, mainTrials9, mainTrials6];
    const blockOrderC = [mainTrials6, mainTrials7, mainTrials8, mainTrials1, mainTrials2, mainTrials4, mainTrials3, mainTrials9, mainTrials5, mainTrials10];
    let blockOrder;
    setBlockOrder(); 
    console.log("blockOrder: " + blockOrder)
    function setBlockOrder() {
        const randomIndex = Math.floor(Math.random() * 3);
        switch (randomIndex) {
            case 0: blockOrder = blockOrderA; break;
            case 1: blockOrder = blockOrderB; break;
            case 2: blockOrder = blockOrderC; break;
        }
    }
    
    // Generate trials for practice and real experiment
    const practiceTrialsInfo = generateJStrials(practiceOrder);
    const realTrialsInfo = generateJStrials(blockOrder);
    let trialsInfo = practiceTrialsInfo;

    function generateJStrials(blocksArray) {
        let allTrials = [];
        
        for (let blockIndex = 0; blockIndex < blocksArray.length; blockIndex++) {
            let blockTrials = blocksArray[blockIndex];
            allTrials = allTrials.concat([blockTrials]);
            console.log("allTrials 1: " + allTrials)
        }
        console.log("allTrials 2: " + allTrials)
        return allTrials;
    }

    // Instructions text for each of the screens
    const initialInstructionTexts = [
        "Welcome to the Which Pond? Game"+
            "\n\nPress SPACE bar to continue.",
        "Which Pond? Fishing Game"+
            "\n\nImagine a boy that goes fishing for 10 days." +
            "\n\nThere are three ponds, each containing fish of different colors: blue, yellow, and green." +
            "\n\nIn each pond the majority of the fish are of a single color."+
            "\n\nPress SPACE bar to proceed.",
        "Each day, the boy catches 15 fish. He will show you the fish he catches one by one, shown in the black square." +
            '\n\nEach turn, you will guess from which pond he is fishing.' +
            '\n\nThe boy will pick a different pond at the beginning of a new day, and he may or may not change ponds within the same day.' + 
            '\n\nPress SPACE bar to proceed.',
        'A correct guess is rewarded with $1, while an incorrect guess earns $0.' +
            '\n\nAt the end of the game, you will receive the total bonus from one randomly selected session.' + 
            '\n\nThe maximum bonus you can receive from this game is $15, if you guess correctly for all trials.' +
            '\n\nPress SPACE bar to continue',
        'Press LEFT, UP or RIGHT arrows on your keyboard to select your pond.' +
            '\n\nPress SPACE bar to start the practice session.'
    ];
    
    const interSessionInstructionTexts = [
        "Practice session complete." +
            "\n\nPress SPACE bar to continue.",
        "The real experiment will now begin." +
            '\n\nPress LEFT, UP or RIGHT arrows on your keyboard to select your pond.' +
            "\n\nTry to respond as quickly and accurately as possible." +
            "\n\nPress SPACE bar to start."
    ];

    const endInstructionText = "Thank you for completing the experiment. You may close the window now.";
    
    // Display the first set of instructions initially
    instructionsDiv.textContent = initialInstructionTexts[0];
    
    // Function to start the practice or real experiment session
    function startSession(sessionType) {
        
        console.log("trialsInfo: " + trialsInfo)
        
        // Reset trials and blocks for the new session
        currentBlock = 1;
        currentTrial = 0;
        
        if (sessionType === "practice") {
            blockTrials = practiceTrialsInfo[currentBlock]; // Initialize with your actual trials data    
        } else {
            blockTrials = realTrialsInfo[currentBlock]; // Initialize with your actual trials data    
        }
        console.log("blockTrials: " + JSON.stringify(blockTrials))

        instructionsDiv.style.display = 'none';
        // Start trials or display inter-session instructions
        if (sessionType === 'practice' || sessionType === 'real') {
            nextTrial();
        } else if (sessionType === 'inter-session') {
            instructionStage = 0; // Reset instruction stage for inter-session instructions
            instructionsDiv.textContent = interSessionInstructionTexts[instructionStage];
            instructionsDiv.style.display = 'block';
        }
    }

    // Function to handle the transition to the next trial or block
    function nextTrial() {
        if (currentTrial < blockTrials.length) {
            console.log("blockTrials[currentTrial]: " + blockTrials[currentTrial])
            displayTrial(blockTrials[currentTrial]);
            currentTrial++;
        } else if (currentBlock < (sessionType === 'practice' ? practiceOrder.length : blockOrder.length)) { // number of blocks per practice/real session
            currentBlock++;
            currentTrial = 0;
            // Show resting display for 5 seconds before the next block
            feedbackDiv.textContent = 'Rest for a moment. The next block will start in 5 seconds.';
            feedbackDiv.style.display = 'block';
            setTimeout(() => {
                feedbackDiv.style.display = 'none';
                // blockTrials = trialsInfo.sessionType.slice(currentBlock * 20, (currentBlock + 1) * 20);
                blockTrials = blockTrials.slice(currentBlock * 20, (currentBlock + 1) * 20);
                startSession(sessionType);
            }, 5000);
        } else if (sessionType === 'practice') {
            // Transition from practice to real experiment
            sessionType = 'real';
            currentBlock = 0;
            currentTrial = 0;
            transitionToRealExperiment()
        } else {
            // Experiment complete
            endExperiment();
        }
    }

    // Function to display a trial and handle its timing and response capture
    function displayTrial(trial) {
        let startTime = Date.now();
        
        // Show ponds and arrow images
        document.getElementById('pondsImage').style.display = 'block';
        document.getElementById('arrowImage').style.display = 'block';
        
        // Reset fish images container for new trial
        // const fishImagesContainer = document.getElementById('fishImagesContainer');
        // fishImagesContainer.innerHTML = ''; // Clear existing fish images
        
        // Add border box
        document.getElementById('fish1Container').style.border = '2px solid black';

        // Add fish images in specified order
        const fishOrder = [trial.fish1, trial.fish2, trial.fish3, trial.fish4, trial.fish5];
        let counter = 1;
        fishOrder.forEach(fish => {
            let elementId = 'fish' + counter.toString() + 'Image';
            console.log("elementId: " + elementId)
            let fishImage = document.getElementById(elementId);
            fishImage.src = fish;
            fishImage.style.display = 'block';
            counter += 1;
            // imgElement.src = fish;
            // fishImagesContainer.appendChild(imgElement);
        });
        
        // imageElement.src = trial.fish1;
        // imageElement.style.display = 'block';
        // Set feedback dive to none
        feedbackDiv.style.display = 'none';

        // Handle key response or timeout within the displayTrial function
        const responseHandler = (event) => {
            if (['ArrowLeft', 'ArrowUp', 'ArrowRight'].includes(event.key)) {
                document.removeEventListener('keydown', responseHandler);
                clearTimeout(timeoutHandle);
                let reactionTime = Date.now() - startTime;
                // let correct = event.key === trial.correctKey;
                console.log("event.key: " + event.key)
                let correct = event.key.toLowerCase().includes(trial.pond3);
                recordResult(trial, reactionTime, event.key, correct);
                feedback(correct);
            }
        };

        // Set a timeout for the trial
        const timeoutHandle = setTimeout(() => {
            document.removeEventListener('keydown', responseHandler);
            feedbackDiv.textContent = 'Oops! Too slow.';
            feedbackDiv.style.display = 'block';
            recordResult(trial, 2000, 'none', false);
            setTimeout(nextTrial, 1000); // Move to next trial after 1 second
        }, 2000);

        document.addEventListener('keydown', responseHandler);
    }

    // Function to provide feedback and move to the next trial
    function feedback(correct) {
        if (sessionType === 'practice') {
            feedbackDiv.textContent = correct ? 'Correct!' : 'Incorrect!';
            feedbackDiv.style.display = 'block';
            setTimeout(() => {
                // imageElement.style.display = 'none';
                feedbackDiv.style.display = 'none';
                nextTrial();
            }, 1000); // Show feedback for 1 second
        } else {
            // imageElement.style.display = 'none';
            nextTrial();
        }
        
    }

    // Function to record the result of a trial
    function recordResult(trial, reactionTime, keyPress, correct) {
        experimentData.push({
            block: currentBlock,
            trial: currentTrial,
            image: trial.image1,
            reactionTime,
            keyPress,
            correct,
            timestamp: new Date().toISOString(),
            session: sessionType
        });
    }

    // Start the experiment when the spacebar is pressed
    // Handle key press events
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            if (sessionType === 'practice' && instructionStage < initialInstructionTexts.length) {
                // Display the next initial instruction
                instructionsDiv.textContent = initialInstructionTexts[instructionStage];
                instructionStage++;
            } else if (sessionType === 'practice' && instructionStage === initialInstructionTexts.length) {
                // Start practice session after the last initial instruction
                startSession('practice');
            } else if (sessionType === 'inter-session' && instructionStage < interSessionInstructionTexts.length) {
                // Display the next inter-session instruction
                instructionsDiv.textContent = interSessionInstructionTexts[instructionStage];
                instructionStage++;
            } else if (sessionType === 'inter-session' && instructionStage === interSessionInstructionTexts.length) {
                // Start real experiment after the last inter-session instruction
                startSession('real');
            }
        }
    });


    // Transition to inter-session instructions
    function transitionToRealExperiment() {
        sessionType = 'inter-session';
        instructionsDiv.style.display = 'block';
        document.getElementById("experimentContainer").style.display = 'none';
        instructionStage = 0; // Reset instruction stage for inter-session
        instructionsDiv.textContent = interSessionInstructionTexts[instructionStage];
    }

    // Function to end the experiment and send data to the server
    function endExperiment() {
        instructionsDiv.style.display = 'block';
        instructionsDiv.textContent = endInstructionText;
        // Placeholder for sending data to the server
        console.log('Experiment complete. Data:', experimentData);
        // Implement data submission to server here
    }
});
