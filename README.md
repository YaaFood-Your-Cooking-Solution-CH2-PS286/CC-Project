# YaaFood Cloud Computing

### How to run
- Duplicate the code by cloning the repository or downloading it as a zip file.
- Establish a connection to your database and execute the migration file.
- Execute "npm install" to install the necessary dependencies.
- Run "npm run start" to run the app

## API Endpoints
The comprehensive API documentation for the recipe recommendation feature, posting articles, comments, logging in, registering, logging out, and editing profiles has been recorded using the Postman Documenter. This documentation offers in-depth details about every endpoint, covering functionalities, request parameters, response structures, as well as examples of requests and responses.

To access the API documentation, visit [[Yaafood API Documentation](https://documenter.getpostman.com/view/31550908/2s9Ykq8Lu9)].


ML MODEL : https://drive.google.com/file/d/1GP-qSMlr0uVRcfAPc5Qj0g7cwAwsha26/view?usp=sharing

# Make RESTfull API with Flask and Cloud Run
1. Set up a predictive model in "h.5" format, with files stored in the "ML-Backend" directory.
2. Develop the main.py script based on the machine learning testing model; save files in the "ML-Backend" folder.
3. Generate a "requirements.txt" file listing the necessary libraries for running the code.
4. Create a "Dockerfile" for running the system within our container.
5. Establish a ".dockerignore" file to instruct the system to ignore specific files.
6. Establish a "static/uploads" folder to store photos for the prediction process.
6. Initiate a new project on the Google Cloud Platform.
7. Activate both the Cloud Run API and Cloud Build API.
8. Install and initialize the Google Cloud SDK using this link: https://cloud.google.com/sdk/docs/install.
9. Utilize Cloud Build to import our code into our cloud services (execute: gcloud builds submit --tag gcr.io/<project_id>/<function_name>).
10. Deploy our API using Cloud Run (execute: gcloud run deploy --image gcr.io/<project_id>/<function_name> --platform managed).
