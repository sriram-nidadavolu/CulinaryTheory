# Culinary Theory
The application is currently accessible at http://ec2-54-196-0-68.compute-1.amazonaws.com:9000/home. 

Class project for ECE 567/452. There are two options to run the server. 
1. Running Locally. 
2. Using Docker

# Running Locally
## Set Up
Install Node JS v18.12.1 https://nodejs.org/en/blog/release/v18.12.0/. 
  
  
Please refer to the email sent by us for variables required. Copy and paste the content in the email to a file named `.env` inside `src` folder. 
  
  
To install the dependencies. 
```
npm install
```

## Starting the server
To start the server. 
```
npm start
```
The application should be accessible on port 9000. To access the homepage paste the following url in browser.
```
localhost:9000/home
```

# Using Docker
## Set Up
Install docker https://docs.docker.com/engine/install/. <br>
Install docker compose https://docs.docker.com/compose/install/. 

Add a `.env` file inside `src` folder with the credentials for mongo db
```
MONGO_INITDB_ROOT_USERNAME=superadmin
MONGO_INITDB_ROOT_PASSWORD=<any password>
MONGO_INITDB_DATABASE=<any database name>
MONGO_INITDB_USER=<any username>
MONGO_INITDB_PWD=<any password>
db_user=<same as MONGO_INITDB_USER>
db_pwd=<same as MONGO_INITDB_PWD>
db_name=<same as MONGO_INITDB_DATABASE>
db_host=mongodb
```
Do not commit this `.env` file.  
**Note: The application will need more environment variables - aws credentials, paypal credentials, email credentials for image upload, subscribe to premium and image upload to work. Credentials we have used are not shared here as it is not safe to do so.**

## Starting the server
To start the server
```
sudo docker-compose up --build -d
```

The application should be accessible on port 9000. To access the homepage paste the following url in browser.
```
localhost:9000/home
```

To stop the server
```
sudo docker-compose down
```
