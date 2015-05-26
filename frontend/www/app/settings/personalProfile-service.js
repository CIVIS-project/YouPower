
services.factory('personalProfile', function() {

	var personalData = {
		username: "jmayer@youpower.eu",
		pwdUpdatedOn: new Date (2014, 3-1 ,3),
		firstname: "Jone",
		//lastname: "Walson",
		nickname: "Jonny",
		gender: 0, 
		birthday: new Date (1985, 12-1 ,27),
		language: 0,
	}

	return {
		personalData: personalData, 
		getPwdDate: function() {
			var diff = Math.abs(new Date().getTime() - personalData.pwdUpdatedOn.getTime());
			diff = Math.ceil(diff / (1000 * 3600 * 24)); //diff in days
			if (diff < 31*1.7) { 
				return "Updated " + diff + " days ago";
			}else if (diff < 365*1.7){
				return "Updated about " + Math.round(diff/30) + " months ago";
			}else return "Updated about " + Math.round(diff/365) + " years ago"; 
		}, 
		getFullName: function() {
			var name = ""; 
			if (personalData.firstname) {name += personalData.firstname;}
			if (personalData.lastname) {name += " " + personalData.lastname;}
			if (personalData.nickname){
				if (name) {name += " (" + personalData.nickname + ")";}
				else {name = personalData.nickname;}
			}
			name = name.trim();
			if (name){
				if  (personalData.gender === 0){name += " \u2642";} //male
				else if (personalData.gender === 1){name += " \u2640";} //female
				return name;
			}
		},
	}
}); 


