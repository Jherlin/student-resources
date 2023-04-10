# Student Resources Web App and Search

## This is a fully functional web app where students can search or submit CS related resources
Live Website --> https://student-resources.herokuapp.com/

This project began because I needed a place to store all the CS resources I was using in order to build fullstack applications or study for technical interviews. I found myself with more than 100 tabs packed into folders on my browser. Whenever I went back to develop an application with a different language, it was difficult to pinpoint the resources I had used before. I also wanted a way to provide all the resources needed to get started with programming for people who were new to coding.

## Functionality
* Developed an Express REST API to handle requests and search queries such as searching through a resource table index, ranking results by relevance, and limiting to 25 results per request.
* Implemented account creation and login by persisting sessions through a MySQL session store; User information was stored securely by hashing and salting sensitive data.
* Designed an admin role with the ability to accept/decline submittal of resources - authorization was checked both on the client and the server.
* Created a discussion board for each resource allowing logged in users to comment or ask for help beneath each resource page.

## Search for resources and leave a comment
![Search](https://user-images.githubusercontent.com/57121028/230943571-0e5c363a-caf5-46d8-b032-52430e1e7156.gif)


## Search by category
![Categories](https://user-images.githubusercontent.com/57121028/230943603-e1bdfad1-81d0-4b84-8279-102376087abf.gif)

## Submit a resource
![Submittals](https://user-images.githubusercontent.com/57121028/230943911-c91c5c79-20d9-4180-90e8-98fb537a9ac1.gif)

## Find a bug?
If you found an issue or would like to submit an improvement to this project, please submit an issue using the issues tab above.
