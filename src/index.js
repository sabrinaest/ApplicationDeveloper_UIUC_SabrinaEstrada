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
        console.error('Error writing to the completed_training_count file:', err);
    }

    return outputData;

}

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