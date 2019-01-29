
# BirthdayReminder 🎉 🎂

Efficient, lightweight Single Page Application(SPA) to automate birthday reminders for users’ contacts. Users can utilize an interactive calendar to keep track of all of their connections' birthdays along with notes, relationships and phone numbers. Users can also send SMS text messages with birthday messages and a gif attached via Twilio API.

User Stories:
 - A user signs in and is brought to their account.
 - A user can view each month.
 - A user can add, edit, delete a birthday.
 - A user can receive notifications for birthdays via text. *In progress*
 - A user can send birthday text messages via Twilio


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

**Once you have this backend Rails API server up and running, you will need to fork and locally clone the React frontend from this repository:** [BirthdayReminder Frontend](https://github.com/bblair31/birthday_reminder_front_end)

* You will need [PostgreSQL](https://www.postgresql.org/download/) running on your local environment.

### Installing

1. Install all required gems
 
```
bundle install
```
  * *NOTE*: If you get an error message about needing to install Bundler, from the command line run `gem install bundler`
  
2. Created new PostgreSQL development database

```
rails db:create
```

3. Run all database migrations and establish schema

```
rails db:migrate
```
4. Seed the database with given seed data from seeds.rb

```
rails db:seed
```

5. Start the Rails Server

```
rails start
```
6. Check to see if browser can communicate with the database

  * Open your default browser and navigate to localhost:3000 (or whatever address is listed in the command line at 'Listening on tcp:'


__Ctrl + c will stop the server when you are done testing

## Built With

* [Ruby on Rails](https://rubyonrails.org/) - Full stack framework
* [PostgreSQL](https://www.postgresql.org/docs/) - Open source object-relational database system
* [Twilio API](https://www.twilio.com/docs/sms) - External API for sending SMS messages on behalf of users
* [Faker Gem](https://github.com/stympy/faker) - Factory for generating seed data


## Contributors

* [Shelby Scalia](https://github.com/srscalia)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


