# CC-Project


ML MODEL : https://drive.google.com/file/d/1GP-qSMlr0uVRcfAPc5Qj0g7cwAwsha26/view?usp=sharing

# Make RESTfull API with Flask and Cloud Run
1. Prepare prediction model in "<b>h.5</b>" format, file are stored in "ML-Backend" folder 
2. Write <b>main.py</b> base on machine learning testing model, files are saved in the "ML-Backend" folder
3. Create file named "<b>requirement.txt</b>" for library you need for running our code
4. Create file named "<b>Dockerfile</b>" for run system in our container
5. Create file named "<b>.dockerignore</b>" for ignore system to ignore spesific file.
6. Create folder static/uploads to save photos for prediction progress.
7. Create new Project in <b>Google Cloud Platform</b>
8. Active <b>Cloud Run API</b> and <b>Cloud Build API</b>
9. Install and init Google Cloud SDK (Use this link : <b>https://cloud.google.com/sdk/docs/install</b>)
10. Use Cloud Build to import our code to our cloud services (<b> gcloud builds submit --tag gcr.io/<project_id>/<function_name></b>)
11. Use Cloud Run to deploy our API (<b> gcloud run deploy --image gcr.io/<project_id>/<function_name> --platform managed </b>)
