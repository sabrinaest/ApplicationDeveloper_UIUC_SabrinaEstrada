const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

/**
 * Reads and parses the training data from a JSON file.
 * @param {string} file - The path to the file containing the training data.
 * @returns {Object} - Parsed training data in JSON format.
 */
async function readTrainingData(file) {
    try {
        const data = await fsp.readFile(file, 'utf8', null);
        return JSON.parse(data);
    } catch(err) {
        console.error('Error reading training data:', err);
    }
}

/**
 * Processes the training data to ensure only the most recent completion for each training is stored.
 * @param {Object} trainingData - The parsed training data.
 * @returns {Array} - Processed training data (updates the training with the latests completions).
 */
async function processTrainingData(trainingData) {
    const processedData = [];

    trainingData.forEach(employee => {
        const latestTraining = {};

        employee.completions.forEach(completion => {
            const trainingName = completion.name;
            const completionDate = new Date(completion.timestamp);

            if (!latestTraining[trainingName] || completionDate > new Date(latestTraining[trainingName].timestamp)) {
                latestTraining[trainingName] = completion;
            }
        });

        processedData.push({
            name: employee.name,
            completions: Object.values(latestTraining) 
        });
    });

    return processedData;
}

/**
 * Counts how many times each training has been completed across all employees.
 * @param {Array} trainingData - The processed training data.
 * @returns {Object} - Training completion count data written to the completed_training_count file.
 */
async function completeledTrainingCount(trainingData) {
    const completedTrainingMap = {};

    trainingData.forEach(employee => {
        employee.completions.forEach(training => {
            const trainingName = training.name;
            completedTrainingMap[trainingName] = (completedTrainingMap[trainingName] || 0) + 1;
        });
    });

    const trainings = [];

    for (const [name, count] of Object.entries(completedTrainingMap)) {
        trainings.push({ name, count });
    }

    const outputFilePath = path.join(__dirname, '../output/completed_training_count.json');

    const outputData = { trainings };

    try {
        await fsp.writeFile(outputFilePath, JSON.stringify(outputData, null, 2), 'utf8');

    } catch (err) {
        console.error('Error writing to the completed_training_count file:', err);
    }

    return outputData;

}

/**
 * Generates a file of training completions within a given fiscal year.
* @param {Array} trainingData - The processed training data.
 * @param {Array} trainings - List of specific trainings to track.
 * @param {number} fiscalYear - The fiscal year to filter completions by.
 * @returns {Object} - Training completion data by fiscal year written to the trainin_completions_fy_year file.
 */
async function completedTrainingByFiscalYear(trainingData, trainings, fiscalYear) {
    const startDate = new Date(`07/01/${fiscalYear - 1}`);
    const endDate = new Date(`06/30/${fiscalYear}`);

    const trainingCompletions = {
        trainings: []
    };
    
    trainings.forEach(trainingName => {
        const completedBy = [];

        trainingData.forEach(employee => {
            const completedTrainings = employee.completions.filter(completion => 
                completion.name === trainingName &&
                new Date(completion.timestamp) >= startDate && new Date(completion.timestamp) <= endDate
            );

            if (completedTrainings.length > 0) {
                completedBy.push(employee.name);
            }
        });
    
        trainingCompletions.trainings.push({
            name: trainingName,
            completedBy: completedBy.sort((a, b) => 
                a.split(' ')[1].localeCompare(b.split(' ')[1]) || 
                a.split(' ')[0].localeCompare(b.split(' ')[0])
            )
        });
    });

    const outputFilePath = path.join(__dirname, `../output/training_completions_fy_${fiscalYear}.json`);

    try {
        await fsp.writeFile(outputFilePath, JSON.stringify(trainingCompletions, null, 2), 'utf8');
    } catch (err) {
        console.error(`Error writing to the training_completions_fy_${fiscalYear} file:`, err);
    }

    return trainingCompletions;
}

/**
 * Identifies trainings that have expired or are expiring soon based on the provided date.
 * @param {Array} trainingData - The processed training data.
 * @param {string} inputDate - The reference date to check for expirations.
 * @returns {Object} - Expired/Expiring training data written to expired_trainigns file.
 */
async function findExpiredTrainings(trainingData, inputDate) {
    const checkDate = new Date(inputDate);
    const expiringSoonDate = new Date(checkDate);
    expiringSoonDate.setMonth(expiringSoonDate.getMonth() + 1);

    const expiredTrainings = {
        employees: []
    }

    trainingData.forEach(employee => {
        const expiringTrainings = employee.completions.filter(completion => {
            const expirationDate = completion.expires;
            if (expirationDate) {
                const expiration = new Date(expirationDate);
                return expiration < checkDate || 
                       (expiration >= checkDate && expiration <= expiringSoonDate);
            }
        });

        if (expiringTrainings.length > 0) {
            const trainingDetails = expiringTrainings.map(completion => {
                const expirationDate = new Date(completion.expires);
                return {
                    name: completion.name,
                    status: expirationDate < checkDate ? 'expired' : 'expires soon'
                };
            });

            expiredTrainings.employees.push({
                name: employee.name,
                trainings: trainingDetails
            });
        }
    });

    const outputFilePath = path.join(__dirname, '../output/expired_trainings.json');
    
    try {
        await fsp.writeFile(outputFilePath, JSON.stringify(expiredTrainings, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing to the expired_trainings file:', err);
    }

    return expiredTrainings;
}

/**
 * Main function for the training data application.
 * 1. Reads training data from trainings.txt file,
 * 2. Processes the training data to contain the most recent training completions
 * 3. Generates three files containing:
 *      - A count of how many people have completed that training.
 *      - A list all people that completed that training in the specified fiscal year.
 *      - A list of people with training completions that will expire or are expired based on the specified date. 
 */
async function main() {
    const fileName = path.join(__dirname, '../trainings.txt');
    const fiscalYear = 2024
    const trainings = ["Electrical Safety for Labs", "X-Ray Safety", "Laboratory Safety Training"];
    const checkExpirationDate = "2023-10-01";

    try {
        const trainingData = await readTrainingData(fileName);
        const processedTrainingData = await processTrainingData(trainingData);

        await completeledTrainingCount(processedTrainingData);
        await completedTrainingByFiscalYear(processedTrainingData, trainings, fiscalYear);
        await findExpiredTrainings(processedTrainingData, checkExpirationDate);

    } catch(err) {
        console.error(err)
    }
}

main();