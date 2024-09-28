const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function readTrainingData(file) {
    try {

        const data = await fsp.readFile(file, 'utf8', null);
        return JSON.parse(data);

    } catch(err) {

        console.error('Error reading training data:', err);
    }
}

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
        console.error('Error writing the completed_training_count file:', err);
    }

    return outputData;

}

async function main() {
    const fileName = path.join(__dirname, '../trainings.txt');

    try {
        const trainingData = await readTrainingData(fileName);
        const processedTrainingData = await processTrainingData(trainingData);

        await completeledTrainingCount(processedTrainingData);

    } catch(err) {
        console.error(err)
    }
}

main();