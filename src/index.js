const fs = require('fs');

function readTrainingData(file) {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            console.error('Error reading training data:', err);
            return;
        }
        const trainingData = JSON.parse(data);
        console.log(trainingData)
    });
}

function main() {
    const fileName = '../trainings.txt';
    readTrainingData(fileName);
}

main();