var user = "";
var userName = "";

let successBox = document.getElementById("successBox");
let loadingBox = document.getElementById("loadingBox");
let errorBox = document.getElementById("errorBox");

const app = Sammy("#main", function() {
	this.use("Handlebars", "hbs");
	//Index
	this.get("#/index", function (context) {
		context
			.loadPartials({
				header: "./views/header.hbs",
				footer: "./views/footer.hbs",
			})
			.then(function () {
				this.partial("./views/index.hbs", function () {
					console.log("went to index!");
				});
			});
	});
	//Register
	this.get("#/register", function (context) {
		//get the register page
		context
			.loadPartials({
				header: "./views/header.hbs",
				footer: "./views/footer.hbs",
			})
			.then(function () {
				this.partial("./views/register.hbs", function (details) {
					console.log("went to register page");
				});
			});
	});
	this.post("#/register", function (context) {
		//pulls in the register post information
		//then validates if the user can create an account or not
		//if successful redirect to the home page || loginpage
		let username = this.params.username;
		let password = this.params.password;
		let repeatPassword = this.params.rePassword;
		let userRegex = /\S{3,}/gm;
		let passRegex = /\S{6,}/gm;
		if (userRegex.test(username)) {
		 	if (passRegex.test(password)) {
		 		if (repeatPassword == password) {
					fetch("https://unievent-b9dfd-default-rtdb.firebaseio.com/user.json")
						.then(response => {
							console.log(response);
							return response.json();
						})
						.then(users => {
							console.log(users);
							let userArray = Object.entries(users);
							console.log(users);
							let hasUser = userArray.find((user) => {
								let [userID, userObj] = user;
								return userObj.username == username;
							});
							if (hasUser == undefined) {
								//add the new user
								let url =
									"https://unievent-b9dfd-default-rtdb.firebaseio.com/user.json";
								let headers = {
									method: "POST", // *GET, POST, PUT, DELETE, etc.
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										username,
										password,
									}),
								};
								fetch(url, headers).then((response) => {
									if (response.status == 200) {
										successBox.innerText = "User registration successful.";
										successBox.style.display = "block";
										loadingBox.style.display = "block";
										setTimeout(function(){
											loadingBox.style.display = "none";
										},500);
										setTimeout(function(){
											successBox.style.display = "none";
										}, 5000);
										successBox.addEventListener('click', function(){
											successBox.style.display = "none";
										});
										context.redirect("#/login");
									}
								});
							} else {
								//send error to the front end
								document
									.getElementById("username")
									.classList.add("is-invalid");
							}
						})
						.catch((err) => {
							console.log(err);
							errorBox.innerText = err;
							errorBox.style.display = "block";
							errorBox.addEventListener('click', function(){
								errorBox.style.display = "none";
								context.redirect("#/register");
							});
						});
				} else {
					errorBox.innerText =
						"Passwords do not match. Click here to try again.";
					errorBox.style.display = "none";
					errorBox.addEventListener("click", function () {
						errorBox.style.display = "none";
						context.redirect("#/register");
					});
				}
			} else {
				errorBox.innerText =
					"Password must be 6 characters. Click here to try again.";
				errorBox.style.display = "none";
				errorBox.addEventListener("click", function () {
					errorBox.style.display = "none";
					context.redirect("#/register");
				});
			}
		} else {
			errorBox.innerText =
				"Username must be 3 characters. Click here to try again.";
			errorBox.style.display = "none";
			errorBox.addEventListener("click", function () {
				errorBox.style.display = "none";
				context.redirect("#/register");
			});
		}
	});
	//User homepage
	this.get("#/homepage", function (context) {
		fetch("https://unievent-b9dfd-default-rtdb.firebaseio.com/events.json")
			.then(function (response) {
				return response.json();
			})
			.then((data) => {
				context.userName = userName;
				let eventsArray = Object.entries(data);
				eventsArray = eventsArray.map(function (innerArray) {
					let [eventID, eventObj] = innerArray;
					eventObj.id = eventID;
					return eventObj;
				});
				console.log(eventsArray);
				context.event = eventsArray;
				//console.log(context.event);
				context
					.loadPartials({
						header: "./views/headerLoggedIn.hbs",
						footer: "./views/footer.hbs",
					})
					.then(function () {
						this.partial(
							"./views/homepage.hbs",
							function (details) {
								console.log("Went to homepage!");
							}
						);
						console.log(user);
						console.log(userName);
					});
			})
			.catch((err) => {
				console.log(err);
				context
					.loadPartials({
						header: "./views/headerLoggedIn.hbs",
						footer: "./views/footer.hbs",
					})
					.then(function () {
						this.partial("./views/four04.hbs", function () {
							console.log("Went to 404!");
						});
					});
			});
	});
	//Login
	this.get("#/login", function (context) {
		context
			.loadPartials({
				header: "../views/header.hbs",
				footer: "../views/footer.hbs",
			})
			.then(function () {
				this.partial("./views/login.hbs", function (details) {
					console.log("got log in form!");
				});
			});
	});
	this.post("#/login", function (context) {
		let username = this.params.username;
		let password = this.params.password;
		fetch("https://unievent-b9dfd-default-rtdb.firebaseio.com/user.json")
			.then((response) => {
				loadingBox.style.display = "block";
				setTimeout(function(){
					loadingBox.style.display = "none";
				}, 500);
				return response.json();
			})
			.then((users) => {
				let userArray = Object.entries(users);
				//console.log(users);
				let hasUser = userArray.find((user) => {
					let [userID, userObj] = user;
					userObj.userID = userID;
					userObj.creator = username;
					return userObj.username == username;
				});
				if (hasUser != undefined) {
					//document.getElementById('username').classList.remove('is-invalid');
					if (hasUser[1].password == password) {
						//logged in!
						user = hasUser[1].userID;
						userName = username;
						//Notify logged in
						successBox.innerHTML = "Login successful.";
						successBox.style.display = "block";
						
						context.redirect("#/homepage");
						setTimeout(function () {
							successBox.style.display = "none";
						}, 5000);
						successBox.addEventListener("click", function () {
							successBox.style.display = "none";
						});
					} else {
						//document.getElementById('password').classList.add("is-invalid");
					}
				} else {
					//send error to the front end
					//document.getElementById('username').classList.add("is-invalid");
				}
			});
	});
	//Logout
	this.get("#/logout", function (context) {
		user = "";
		userName = "";
		context.redirect("#/index");
		successBox.innerText = "Logout successful.";
		successBox.style.display = "block";
		setTimeout(function(){
			successBox.style.display = "none";
		}, 5000);
		successBox.addEventListener('click', function(){
			successBox.style.display = "none";
		});
	});
	//Details
	this.get("#/details/:id", function (context) {
		let eventID = this.params.id;
		context.userName = userName;
		fetch(`https://unievent-b9dfd-default-rtdb.firebaseio.com/events/${eventID}.json`)
			.then((response) => {
				//console.log(response);
				return response.json();
			})
			.then(data => {
				console.log(data);
				let events = data;

				let joinBtn = document.getElementById('joinBtn');
				let deleteBtn = document.getElementById('deleteBtn');
				let editBtn = document.getElementById('editBtn');

				context.name = events.name;
				context.dateTime = events.dateTime;
				context.description = events.description;
				context.imageURL = events.imageURL;
				context.creator = events.creator;
				context.peopleInterstedIn = events.peopleInterstedIn;

				if (context.creator == context.userName){
					context
					.loadPartials({
						header: "./views/headerLoggedIn.hbs",
						footer: "./views/footer.hbs",
					})
					.then(function () {
						this.partial("./views/eventDetailsCreator.hbs", function (details) {
								console.log("Went to details!");
							}
						);
					});
				} else {
					context
					.loadPartials({
						header: "./views/headerLoggedIn.hbs",
						footer: "./views/footer.hbs",
					})
					.then(function () {
						this.partial("./views/eventDetails.hbs", function (details) {
								console.log("Went to details!");
							}
						);
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});

	});
	// //Profile
	this.get("#/profile", function (context) {
		
		fetch("https://unievent-b9dfd-default-rtdb.firebaseio.com/events.json")
			.then(function (response) {
				console.log(response);
				return response.json();
			})
			.then(function (data) {
				// get the template as a handlebars string
				console.log(data);
				//take data and turn it into an array of objects
				let eventsArray = Object.entries(data);
				console.log(eventsArray);
				eventsArray = eventsArray
					.map(function (innerArray) {
						let [eventID, eventObj] = innerArray;
						eventObj.id = eventID;
						console.log(eventObj);
						return eventObj;
					})
					.filter(function (object) {
						return user == object.userID;
					});
				console.log(eventsArray);
				context.events = eventsArray;
				context
					.loadPartials({
						header: "./views/headerLoggedIn.hbs",
						footer: "./views/footer.hbs",
					})
					.then(function () {
						this.partial("./views/profile.hbs", function (details) {
							console.log("went to profile!");
						});
					});
			})
			.catch((err) => {
				console.log(err);
				//change html to show an error has occured
			});
	});
	this.post("#/delete/:id", function (context) {
		let eventID = this.params.id;
		let url = `https://unievent-b9dfd-default-rtdb.firebaseio.com/events/${eventID}.json`;
		let headers = {
			method: "DELETE,",
		};
		fetch(url, headers)
			.then((response) => {
				if (response.status == 200) {
					successBox.innerText = "Event closed successfully.";
					successBox.style.display = "block";
					context.redirect("#/profile");
				}
			})
			.catch((err) => {
				console.log(err);
			});
	});
	this.get("#/edit/:id", function (context) {
		let eventID = this.params.id;
		context.userName = userName;
		fetch(`https://unievent-b9dfd-default-rtdb.firebaseio.com/events/${eventID}.json`)
			.then((response) => {
				return response.json();
			})
			.then(function () {
				context
					.loadPartials({
						header: "./views/headerLoggedIn.hbs",
						footer: "./views/footer.hbs",
					})
					.then(function () {
						this.partial(
							"./views/editEvents.hbs",
							function (details) {
								console.log("Went to Edit Event!");
							}
						);
					});
			});
	});
	this.post("#/edit/:id", function (context) {
		let eventID = this.params.id;
		context.userName = userName;
		fetch(`https://unievent-b9dfd-default-rtdb.firebaseio.com/events/${eventID}.json`)
			.then((response) => {
				return response.json();
			})
			.then(data=>{
				console.log(data);
				let event = data;
				context.name = event.name;
				context.dateTime = event.dateTime;
				context.description = event.description;
				context.imageURL = event.imageURL;
			});
	});
	// //Organize Event
	this.get("#/organize", function (context) {
		context.userName = userName;
		context
			.loadPartials({
				header: "./views/headerLoggedIn.hbs",
				footer: "./views/footer.hbs",
			})
			.then(function () {
				this.partial("./views/organize.hbs", function (details) {
					console.log("Went to organize event page");
				});
			});
	});
	this.post("#/organize", function (context) {
		console.log("Organize event form submitted");
		console.log(this);

		let nameRegex = /\S{6,}/gm;
		let dateTimeRegex = /(?<day>\d{1,2}) (?<month>\w{3,9}) ?-? ?(\d{1,2})?\:?(\d{2})? ?[AP]?[M]?/gm;
		let descriptionRegex = /\S{10,}/gm;
		let imageRegex = /^(https:\/\/)||^(http:\/\/)/gm;			
				
		if (nameRegex.test(this.params.name)){
			if(dateTimeRegex.test(this.params.dateTime)){
				if (descriptionRegex.test(this.params.description)){
					if(imageRegex.test(this.params.imageURL)){
						let data = {
							name: this.params.name,
							dateTime: this.params.dateTime,
							description: this.params.description,
							imageURL: this.params.imageURL,
							creator: userName,
							userID: user,
							peopleInterstedIn: 0,
						};

						let url =
							"https://unievent-b9dfd-default-rtdb.firebaseio.com/events.json";
						let headers = {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(data),
						};
						fetch(url, headers).then((response) => {
							if (response.status == 200) {
								console.log("Added Event!");
								successBox.innerText = "Event created successfully.";
								successBox.style.display = "block";
								setTimeout(function () {
									successBox.style.display = "none";
								}, 5000);

								context.redirect("#/homepage");
							}
						});
					} else {
						errorBox.innerText = "Image URL should start with http://... or https://... Click here to try again";
						errorBox.style.display = "block";
						errorBox.addEventListener('click', function(){
							errorBox.style.display = "none";
							context.redirect("/register");
						});
					}
				} else {
					errorBox.innerText = "The event description should be at least 10 characters. Click here to try again";
					errorBox.style.display = "block";
					errorBox.addEventListener('click', function(){
						errorBox.style.display = "none";
						context.redirect("/register");
					});
				}
			} else {
				errorBox.innerText = "The event date and time should be valid(24 May; 24 September - 12:00 PM). Click here to try again";
				errorBox.style.display = "block";
				errorBox.addEventListener('click', function(){
					errorBox.style.display = "none";
					context.redirect("/register");
				});
			}
		} else {
			errorBox.innerText = "The name of the event must be at least 6 english letters. Click here to try again";
			errorBox.style.display = "block";
			errorBox.addEventListener('click', function(){
				errorBox.style.display = "none";
				context.redirect("/register");
			});
		}
	});
});

(() => {
	app.run("#/index");
})();
