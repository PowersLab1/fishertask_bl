document.addEventListener('DOMContentLoaded', () => {
    const instructionsDiv = document.getElementById('instructions');
    const feedbackDiv = document.getElementById('feedback');
    const experimentDiv = document.getElementById("experimentContainer");
    const pondsImage = document.getElementById('pondsImage');
    // Call resizeOverlays function when the image has loaded
    
    
    pondsImage.addEventListener('load', resizeOverlays);
    

    // Call resizeOverlays function when the window is resized
    window.addEventListener('resize', resizeOverlays);
    
    // const colors = ["red", "blue", "green"];
    // const baseUrl = "https://raw.githubusercontent.com/maxsupergreenwald/FisherResources/main/resources/";
    let experimentData = []; // Will hold JSON data from experiment trials
    let currentBlock = 0;
    let currentTrial = 0;
    let instructionStage = 0; // Tracks instruction stages (introduction vs. practice-to-experiment transition)
    let sessionType = 'practice'; // Transitions from 'practice' to 'intersession' to 'real'
    let blockTrials; // Will hold trials for the current block
    
    // Set block orders for practice and real experiment
    const practiceOrder = (Math.random() < 0.5) ? [practiceTrials1, practiceTrials2] : [practiceTrials2, practiceTrials1]; // randomize practice block order
    const blockOrderA = [mainTrials1, mainTrials2, mainTrials3, mainTrials4, mainTrials5, mainTrials6, mainTrials7, mainTrials8, mainTrials9, mainTrials10];
    const blockOrderB = [mainTrials10, mainTrials2, mainTrials8, mainTrials3, mainTrials1, mainTrials4, mainTrials5, mainTrials7, mainTrials9, mainTrials6];
    const blockOrderC = [mainTrials6, mainTrials7, mainTrials8, mainTrials1, mainTrials2, mainTrials4, mainTrials3, mainTrials9, mainTrials5, mainTrials10];
    let blockOrder;
    setBlockOrder(); 
    
    function setBlockOrder() {
        const randomIndex = Math.floor(Math.random() * 3);
        console.log("randomIndex: " + randomIndex)
        switch (randomIndex) {
            case 0: blockOrder = blockOrderA; break;
            case 1: blockOrder = blockOrderB; break;
            case 2: blockOrder = blockOrderC; break;
        }
    }

    
    // Generate trials for practice and real experiment
    const practiceTrialsInfo = generateJStrials(practiceOrder);
    const realTrialsInfo = generateJStrials(blockOrder);

    function generateJStrials(blocksArray) {
        let allTrials = [];
        
        for (let blockIndex = 0; blockIndex < blocksArray.length; blockIndex++) {
            let blockTrials = blocksArray[blockIndex];
            allTrials = allTrials.concat([blockTrials]);
        }
        return allTrials;
    }

    // Instructions text for each of the screens
    const initialInstructionTexts = [
        "Welcome to the Which Pond? Game"+
            "<br><br><br>Press SPACE bar to continue.",
        "Which Pond? Fishing Game"+
            "<br><br>Imagine a boy that goes fishing for 10 days." +
            "<br><br>There are three ponds, each containing fish of different colors: blue, yellow, and green." +
            "<br><br>In each pond the majority of the fish are of a single color."+
            "<br><br><br>Press SPACE bar to proceed.",
        "Each day, the boy catches 15 fish. He will show you the fish he catches one by one, shown in the black square." +
            '<br><br>Each turn, you will guess from which pond he is fishing.' +
            '<br><br>The boy will pick a different pond at the beginning of a new day, and he may or may not change ponds within the same day.' + 
            '<br><br><br>Press SPACE bar to proceed.',
        'A correct guess is rewarded with $1, while an incorrect guess earns $0.' +
            '<br><br>At the end of the game, you will receive the total bonus from one randomly selected session.' + 
            '<br><br>The maximum bonus you can receive from this game is $15, if you guess correctly for all trials.' +
            '<br><br><br>Press SPACE bar to continue',
        'Press LEFT, UP or RIGHT arrows on your keyboard to select your pond.' +
            '<br><br><br>Press SPACE bar to start the practice session.'
    ];
    
    const interSessionInstructionTexts = [
        "Practice session complete." +
            "<br><br><br>Press SPACE bar to continue.",
        "The real experiment will now begin." +
            '<br><br>Press LEFT, UP or RIGHT arrows on your keyboard to select your pond.' +
            "<br><br>Try to respond as quickly and accurately as possible." +
            "<br><br><br>Press SPACE bar to start."
    ];

    const endInstructionText = " ";
    // const endInstructionText = "Thank you for completing the experiment. You may close the window now.";
    
    // Display the first set of instructions initially
    instructionsDiv.innerHTML = initialInstructionTexts[0];
    
    // Function to start the practice or real experiment session
    function startSession(sessionType) {

        if (sessionType === "practice") {
            blockTrials = practiceTrialsInfo[currentBlock]; // Initialize with your actual trials data    
        } else {
            blockTrials = realTrialsInfo[currentBlock]; // Initialize with your actual trials data    
        }
        
        console.log("currentBlock 1: " + currentBlock)
    
        instructionsDiv.style.display = 'none';
        // Start trials or display inter-session instructions
        if (sessionType === 'practice' || sessionType === 'real') {
            nextTrial();
        } else if (sessionType === 'inter-session') {
            instructionStage = 0; // Reset instruction stage for inter-session instructions
            instructionsDiv.innerHTML = interSessionInstructionTexts[instructionStage];
            instructionsDiv.style.display = 'block';
        }
    }

    // Function to handle the transition to the next trial or block
    function nextTrial() {
        experimentDiv.style.display = 'block';
        document.getElementById('leftPondOverlay').style.border = 'none';
        document.getElementById('middlePondOverlay').style.border = 'none';
        document.getElementById('rightPondOverlay').style.border = 'none';
        
        console.log("currentTrial: " + currentTrial)

        if (currentTrial < blockTrials.length) {
            displayTrial(blockTrials[currentTrial]);
            currentTrial++;
        } else if (currentBlock+1 < (sessionType === 'practice' ? practiceOrder.length : blockOrder.length)) { // number of blocks per practice/real session
            currentBlock++;
            currentTrial = 0;
            // Hide trials div
            experimentDiv.style.display = 'none';
            // Show resting display for 5 seconds before the next block
            instructionsDiv.style.display = 'block';
            instructionsDiv.innerHTML = 'Rest for a moment. Next day starts in 5 seconds.'

            setTimeout(() => {
                feedbackDiv.style.display = 'none';
                blockTrials = blockTrials.slice(currentBlock * 20, (currentBlock + 1) * 20); // update blockTrials array
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
    // function displayTrial(trial) {
    //     let startTime = Date.now();
        
    //     // Show ponds and arrow images
    //     document.getElementById('pondsContainer').style.display = 'block';
    //     document.getElementById('arrowImage').style.display = 'block';
        
    //     // Add border box
    //     document.getElementById('fish1Container').style.border = '2px solid black';
    //     let boxTimeout = setTimeout(() => document.getElementById('fish1Container').style.border = '2px solid white', 2000);

    //     // Add fish images in specified order
    //     const fishOrder = [trial.fish1, trial.fish2, trial.fish3, trial.fish4, trial.fish5];
    //     let counter = 1;
    //     fishOrder.forEach(fish => {
    //         let elementId = 'fish' + counter.toString() + 'Image';
    //         let fishImage = document.getElementById(elementId);
    //         fishImage.src = fish;
    //         fishImage.style.display = 'block';
    //         counter += 1;
    //     });
        
    //     // Clear feedback div every trial
    //     feedbackDiv.style.display = 'none';

    //     // Handle key response or timeout within the displayTrial function
    //     const responseHandler = (event) => {
    //         if (['ArrowLeft', 'ArrowUp', 'ArrowRight'].includes(event.key)) {
    //             resizeOverlays();
    //             if      (event.key === 'ArrowLeft')    {document.getElementById('leftPondOverlay').style.border = '3px solid black'; } 
    //             else if (event.key === 'ArrowUp')      {document.getElementById('middlePondOverlay').style.border = '3px solid black'; }
    //             else if (event.key === 'ArrowRight')   {document.getElementById('rightPondOverlay').style.border = '3px solid black'; }

    //             document.getElementById('fish1Container').style.border = '2px solid white'
    //             document.removeEventListener('keydown', responseHandler);
    //             clearTimeout(timeoutHandle);
    //             let reactionTime = Date.now() - startTime;
    //             console.log("event.key: " + event.key)
    //             let correct = event.key.toLowerCase().includes(trial.pond3);
    //             recordResult(trial, reactionTime, event.key, correct);
    //             clearTimeout(boxTimeout);
    //             feedback(correct);
    //         }
    //     };

    //     // Set a timeout for the trial
    //     const timeoutHandle = setTimeout(() => {
    //         document.removeEventListener('keydown', responseHandler);
    //         feedbackDiv.innerHTML = 'Oops! Too slow.';
    //         feedbackDiv.style.display = 'block';
    //         recordResult(trial, 2000, 'none', false);
    //         clearTimeout(boxTimeout);
    //         setTimeout(nextTrial, 1000); // Move to next trial after 1 second
    //     }, 2000);

    //     document.addEventListener('keydown', responseHandler);
    // }
    // Store the responseHandler function outside of displayTrial
let responseHandler;
let keyHeldDown = false; // Flag to track if a key is being held down

function displayTrial(trial) {
    let startTime = Date.now();
    let keydownHandled = false; // Flag to track if a key press has been handled
    let prematureKeyPress = false; // Flag to track if the key press was premature

    // Show ponds and arrow images
    document.getElementById('pondsContainer').style.display = 'block';
    document.getElementById('arrowImage').style.display = 'block';

    // Add border box
    document.getElementById('fish1Container').style.border = '2px solid black';
    let boxTimeout = setTimeout(() => document.getElementById('fish1Container').style.border = '2px solid white', 2000);

    // Add fish images in specified order
    const fishOrder = [trial.fish1, trial.fish2, trial.fish3, trial.fish4, trial.fish5];
    let counter = 1;
    fishOrder.forEach(fish => {
        let elementId = 'fish' + counter.toString() + 'Image';
        let fishImage = document.getElementById(elementId);
        fishImage.src = fish;
        fishImage.style.display = 'block';
        counter += 1;
    });

    // Clear feedback div every trial
    feedbackDiv.style.display = 'none';

    // Handle premature key press
    const prematureResponseTimeout = setTimeout(() => {
        prematureKeyPress = false;
    }, 200);

    // Set a timeout for the trial duration (2 seconds)
    const trialDurationTimeout = setTimeout(() => {
        document.removeEventListener('keydown', responseHandler); // Remove the stored responseHandler
        document.removeEventListener('keyup', keyUpHandler); // Remove the keyup handler
        let reactionTime = Date.now() - startTime;
        let keyPress = 'none';
        let correct = false;

        if (keydownHandled && !prematureKeyPress && !keyHeldDown) {
            // User responded within the trial duration
            keyPress = lastKeyPressed;
            correct = lastKeyPressed.toLowerCase().includes(trial.pond3);
        }

        recordResult(trial, reactionTime, keyPress, correct);
        clearTimeout(boxTimeout);
        feedback(correct);
    }, 2000);

    // Handle key response
    let lastKeyPressed = '';
    responseHandler = (event) => {
        if (['ArrowLeft', 'ArrowUp', 'ArrowRight'].includes(event.key) && !keydownHandled && !keyHeldDown) {
            if (prematureKeyPress) {
                // Premature key press
                feedbackDiv.innerHTML = 'You pressed too soon! 5 seconds waiting period now starts.';
                feedbackDiv.style.display = 'block';
                clearTimeout(trialDurationTimeout);
                clearTimeout(prematureResponseTimeout);
                setTimeout(() => {
                    feedbackDiv.style.display = 'none';
                    displayTrial(trial); // Restart the trial after 5 seconds
                }, 5000);
                return;
            }

            keydownHandled = true; // Set the flag to true to indicate a key press has been handled
            keyHeldDown = true; // Set the flag to indicate a key is being held down
            document.removeEventListener('keydown', responseHandler); // Remove the stored responseHandler

            resizeOverlays();
            if (event.key === 'ArrowLeft') {
                document.getElementById('leftPondOverlay').style.border = '3px solid black';
            } else if (event.key === 'ArrowUp') {
                document.getElementById('middlePondOverlay').style.border = '3px solid black';
            } else if (event.key === 'ArrowRight') {
                document.getElementById('rightPondOverlay').style.border = '3px solid black';
            }

            document.getElementById('fish1Container').style.border = '2px solid white';
            lastKeyPressed = event.key;
        }
    };

    // Handle key release
    const keyUpHandler = (event) => {
        if (['ArrowLeft', 'ArrowUp', 'ArrowRight'].includes(event.key)) {
            keyHeldDown = false; // Reset the keyHeldDown flag when the key is released
        }
    };

    document.addEventListener('keydown', responseHandler);
    document.addEventListener('keyup', keyUpHandler);
    }


    // Function to provide feedback and move to the next trial
    function feedback(correct) {
        if (sessionType === 'practice') {
            feedbackDiv.innerHTML = correct ? 'Correct!' : 'Incorrect!';
            feedbackDiv.style.display = 'block';
            setTimeout(() => {
                feedbackDiv.style.display = 'none';
                nextTrial();
            }, 1000); // Show feedback for 1 second
        } else {
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
                instructionsDiv.innerHTML = initialInstructionTexts[instructionStage];
                instructionStage++;
            } else if (sessionType === 'practice' && instructionStage === initialInstructionTexts.length) {
                // Start practice session after the last initial instruction
                startSession('practice');
            } else if (sessionType === 'inter-session' && instructionStage < interSessionInstructionTexts.length) {
                // Display the next inter-session instruction
                instructionsDiv.innerHTML = interSessionInstructionTexts[instructionStage];
                instructionStage++;
            } else if (sessionType === 'inter-session' && instructionStage === interSessionInstructionTexts.length) {
                // Start real experiment after the last inter-session instruction
                sessionType = 'real';
                startSession('real');
            }
        }
    });


    // Transition to inter-session instructions
    function transitionToRealExperiment() {
        sessionType = 'inter-session';
        instructionsDiv.style.display = 'block';
        experimentDiv.style.display = 'none';
        instructionStage = 0; // Reset instruction stage for inter-session
        instructionsDiv.innerHTML = interSessionInstructionTexts[instructionStage];
    }

    // Function to end the experiment and send data to the server
    function endExperiment() {
        experimentDiv.style.display = 'none';
        instructionsDiv.style.display = 'block';
        instructionsDiv.innerHTML = endInstructionText;
        
        // Implement data submission to server here
        console.log('Experiment complete. Data:', experimentData);
        window.postMessage({
            type: 'labjs.data',
            json: JSON.stringify(experimentData)
        }, '*');
    }

    function resizeOverlays() {
        setTimeout(function() {
            const imageWidth = pondsImage.offsetWidth;
            const imageLeft = pondsImage.getBoundingClientRect().left - 5;
            const overlayWidth = Math.min(imageWidth / 3 - 5, 333);
            
            console.log("imageLeft: " + imageLeft);
    
            leftPondOverlay.style.width = `${overlayWidth}px`;
            middlePondOverlay.style.width = `${overlayWidth}px`;
            rightPondOverlay.style.width = `${overlayWidth}px`;
    
            leftPondOverlay.style.left = `${imageLeft}px`;
            middlePondOverlay.style.left = `${imageLeft + overlayWidth}px`;
            rightPondOverlay.style.left = `${imageLeft + 2*overlayWidth}px`;
        }, 500); // Even a 0ms timeout can help by pushing the function to the end of the call stack
    }

});
