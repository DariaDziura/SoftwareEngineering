MediaSwap: The Community Book & Record Exchange
==============================================

Programme:
BSc Computer Science / BEng Software Engineering

Module:
Software Engineering (CMP-N204-0)

Group:
JUST GROUP

Group Members:
Katarzyna Lacek
Daria Dziura
Emmanuel Boateng


PROJECT OVERVIEW
----------------
MediaSwap is a full-stack, dynamic, database-driven web application developed as part of the
Software Engineering module at the University of Roehampton.

The application follows the theme of “sharing, exchange, and building community”.
It provides a digital platform where users can exchange physical books and vinyl records
co-operatively, without financial transactions.

The main aim of the project is to support a circular economy by allowing community members
to gift media items they no longer need and discover new items through mutual exchange.


TECHNOLOGIES USED
-----------------
The project uses the mandated technology stack for this module:

Frontend:
- HTML
- CSS
- JavaScript
- PUG templating system

Backend:
- Node.js
- Express.js

Database:
- MySQL
- Database name: softwareeng

DevOps and CI/CD:
- Docker
- Git
- GitHub Actions

Project Management:
- GitHub Projects (Kanban board)


GETTING STARTED
---------------
The application is fully containerised using Docker to ensure a consistent development
environment for all team members.


PREREQUISITES
-------------
- Docker Desktop installed
- Node.js installed locally (for linting and local testing)


INSTALLATION AND SETUP
----------------------

1. Clone the repository:

   git clone [Your-GitHub-Repo-Link]

2. Configure environment variables:

   - Locate the file named env-sample
   - Create a new file called .env in the root directory
   - Copy the contents of env-sample into the .env file
   - Ensure the following variable is set:

     MYSQL_DATABASE=softwareeng

   Note:
   The .env file is ignored by Git for security reasons.

3. Launch the application using Docker:

   docker-compose up --build


ACCESSING THE SERVICES
----------------------
Once the containers are running, the services can be accessed at:

- Web Application:
  http://localhost:3000

- phpMyAdmin:
  http://localhost:8081


SPRINT 1 STATUS
---------------
For the Sprint 1 review (Week 4), the following features have been completed:

- Fully dockerised development environment, including:
  - Web application container
  - MySQL database container
  - phpMyAdmin container

- Initial database schema created for the softwareeng database

- Basic Express application structure and MySQL connectivity

- Group-agreed Code of Conduct

- Initial user personas defined by the group


COLLABORATION AND METHODOLOGY
-----------------------------
The team follows the Scrum project management methodology.

Development is carried out iteratively using sprints, with progress reviewed during
weekly stand-up meetings.

Tasks, user stories, and sprint progress are tracked using a GitHub Kanban board.


LICENSE
-------
This project is licensed under the Apache License 2.0.

The Apache 2.0 License allows the software to be used, modified, and distributed, provided
that proper credit is given and the licence terms are followed.

This project is developed for educational purposes only and forms part of the
University of Roehampton London Software Engineering module assessment.
