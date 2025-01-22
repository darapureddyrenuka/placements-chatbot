let placementData = null;

// Fetch data dynamically from data.json
async function loadData() {
    try {
        // Fetch the JSON file
        const response = await fetch('./data.json');
        
        // Check if the fetch was successful
        if (!response.ok) {
            throw new Error('Failed to load data.json');
        }

        // Parse JSON data and store it
        placementData = await response.json();
        console.log("Data loaded successfully:", placementData);

        // Enable the "Ask" button after data is loaded
        document.getElementById("askButton").disabled = false;

    } catch (error) {
        console.error("Error loading data.json:", error);
    }
}

// Function to handle user input and display answers
function askQuestion() {
    const userInput = document.getElementById("userInput").value.trim();
    const chatBox = document.getElementById("chatBox");

    if (!userInput) return;  // If input is empty, don't proceed

    // Display the user's question in the chat box
    const userMessage = document.createElement("div");
    userMessage.classList.add("chat-message", "user-message");
    userMessage.innerHTML = `<strong>User:</strong> ${userInput}`;
    chatBox.appendChild(userMessage);

    // Process the question and get the answer dynamically
    const answer = answerPlacementQuestion(userInput);

    // Display the bot's response
    const botMessage = document.createElement("div");
    botMessage.classList.add("chat-message", "bot-message");
    botMessage.innerHTML = `<strong>Bot:</strong> ${answer}`;
    chatBox.appendChild(botMessage);

    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;

    // Clear the input box after submission
    document.getElementById("userInput").value = "";
}

// Function to process placement-related questions dynamically
function answerPlacementQuestion(question) {
    if (!placementData) {
        return "Error: Data is not loaded. Please refresh the page.";
    }

    question = question.toLowerCase();
    const companyMatch = question.match(/students placed in ([a-zA-Z\s]+)/);
    const salaryMatch = question.match(/students with salary more than (\d+(\.\d+)?) lpa/);
    const highestSalaryMatch = question.includes("highest salary");

    // Handling company-based query
    if (companyMatch) {
        const company = companyMatch[1].trim();
        const placement = placementData.placements.find(p => p.company.toLowerCase() === company.toLowerCase());
        return placement
            ? `Students placed in ${company}: ${placement.students.map(s => s.name).join(', ')}.`
            : `No data found for students placed in ${company}.`;
    }

    // Handling salary-based query
    if (salaryMatch) {
        const salary = parseFloat(salaryMatch[1]);
        const students = placementData.placements
            .flatMap(p => p.students)
            .filter(s => s.salary > salary);
        return students.length > 0
            ? `Students with salary more than ${salary} LPA: ${students.map(s => `${s.name} (${s.salary} LPA)`).join(', ')}.`
            : `No students with salary more than ${salary} LPA.`;
    }

    // Handling query for the highest salary
    if (highestSalaryMatch) {
        const highestSalaryStudent = placementData.placements
            .flatMap(p => p.students)
            .reduce((max, student) => (student.salary > max.salary ? student : max));
        return `The student with the highest salary is ${highestSalaryStudent.name} with ${highestSalaryStudent.salary} LPA.`;
    }
    if (question.includes("what are the companies")) {
        const companies = placementData.placements.map(p => p.company);
        return companies.length > 0 
            ? `The companies are: ${companies.join(', ')}.`
            : "No companies found in the data.";
    }
    const moreThanSalaryMatch = question.match(/more than (\d+(\.\d+)?) lpa/);
    if (moreThanSalaryMatch) {
        const salary = parseFloat(moreThanSalaryMatch[1]);
        const students = placementData.placements
            .flatMap(p => p.students)
            .filter(s => s.salary > salary);
        return students.length > 0
            ? `Students with salary more than ${salary} LPA: ${students.map(s => `${s.name} (${s.salary} LPA)`).join(', ')}.`
            : `No students with salary more than ${salary} LPA.`;
    }
    if (question.includes("what is the average salary")) {
        const allSalaries = placementData.placements
            .flatMap(p => p.students)
            .map(s => s.salary);
        const averageSalary = allSalaries.reduce((sum, salary) => sum + salary, 0) / allSalaries.length;
        return `The average salary is ${averageSalary.toFixed(2)} LPA.`;
    }
    
    if (question.match(/how many students were placed in ([a-zA-Z\s]+)/)) {
        const company = question.match(/how many students were placed in ([a-zA-Z\s]+)/)[1].trim();
        const companyData = placementData.placements.find(p => p.company.toLowerCase() === company.toLowerCase());
        return companyData 
            ? `${companyData.students.length} students were placed in ${company}.`
            : `No data found for ${company}.`;
    }
    if (question.includes("what is the total salary of all students")) {
        const totalSalary = placementData.placements
            .flatMap(p => p.students)
            .reduce((sum, student) => sum + student.salary, 0);
        return `The total salary of all students is ${totalSalary.toFixed(2)} LPA.`;
    }
    
    
    // If no specific pattern is matched
    return "Sorry, I couldn't understand your question. Please try asking in a different way!";
}

// Attach the askQuestion function to the button click event
document.getElementById("askButton").addEventListener("click", askQuestion);

// Load the placement data when the page loads
window.onload = loadData;
