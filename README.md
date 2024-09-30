# Application Developer Submission: Training Data Application by Sabrina Estrada

Hi there!👋

Thank you for considering my application for the Application Developer position at the University of Illinois Urbana-Champaign. I am excited to share my project submission for the programming exercise. This application processes training data from a provided JSON file and generates three JSON outputs: training completion counts, participant lists for specified trainings based on the fiscal year, and information on trainings that have expired or will expire soon.

## 🗂️ Project Structure

- **src/**: This folder contains the source code for the application.
  - **index.js**: The main file that handles reading and processing the training data and generating the output JSON files.

- **output/**: This folder includes the generated JSON files containing the results of the analyses based on the training data.
  - **completed_training_count.json**: Contains a count of how many employees have completed each training.
  - **expired_trainings.json**: Lists trainings that have expired or are about to expire.
  - **training_completions_fy_2024.json**: Details participants for specified trainings within the fiscal year 2024.

## ✨ Features

- **Training Completion Count**: Provides a summary of each completed training along with the number of completions.
  
- **Fiscal Year Training Completions**: For a given list of trainings (e.g., "Electrical Safety for Labs," "X-Ray Safety," "Laboratory Safety Training") and a specified year (e.g. 2024), it lists all individuals who completed the trainings within the fiscal year.

- **Training Expirations**: Based on the specified date (e.g. Oct 1st, 2023), it identifies employees who have completed trainings that are either expired or will expire within one month, with an additional field whether they are "expired" or "expires soon."

## 🛠️ Getting Started

1. Clone the Repository:

   ```
   git clone https://github.com/sabrinaest/ApplicationDeveloper_UIUC_SabrinaEstrada.git
   ```

2. Navigate to the Directory:

   ```
   cd ApplicationDeveloper_UIUC_SabrinaEstrada 
   ```

3. Install the Dependencies:

   ```
   npm install
   ```

4. Run the application:

   ```
   npm start
   ```

## 😊 Thanks for stopping by! 

Thank you for reviewing my submission! I genuinely appreciate your time and consideration, I look forward to hearing from you! Please feel free to reach out if you have any questions or need additional information.

Have a wonderful day! 

Sabrina Estrada

[🌐 Connect on LinkedIn](https://www.linkedin.com/in/sabrinaestrada)
