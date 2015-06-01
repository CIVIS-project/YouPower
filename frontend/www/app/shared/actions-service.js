
sharedServices.factory('Actions', function() {

	var comments1 = [
	{
		id: 447876543,
		name: "Yilin",
		description: "Turning off stanbys is easier with switch plugs or power strips.",
		date: "",
	},
	{
		id: 447876543,
		name: "Hanna", 
		description: "I heard we can save up to 500 kWh per year. It is equivalent to about 10% of our total use!"
	},
	{
		id: 447876543,
		name: "Martijn", 
		description: "I run a server at home 24/7. I will not turn it off. I can see that I do not have many standbys. I installed Smappee."
	}
	];

	var comments2 = [
	{
		id: 447876543,
		name: "Sanja", 
		description: "Hi all, I am based in Helsinki. Anyone could recommend me a company that does house improvment? I need to change my front door and three windows. Thanks."
	},
	{
		id: 447876543,
		name: "Christophe",
		description: "My parents' house is pretty old. I spent a lot of time in the past two months helping them renovate some parts and seal up the leaks. Can I get leafs for that?"
	},
	{
		id: 447876543,
		name: "Yilin", 
		description: "@Christophe: Why not? For the sake of time and efforts you spent ;)"
	},
	{
		id: 447876543,
		name: "Christophe", 
		description: "We have a well insulated house. The difference of heating cost to our prevous house is quite big. It is worth doing."
	}
	];

	var comments3 = [
	{
		id: 447876543,
		name: "Filip", 
		description: "Isn't this obvious? Who keep fridge doors open?"
	},
	{
		id: 447876543,
		name: "Martijn",
		description: "@Filip: my little niece is sometimes so exited to find ice cream from the fridge, she runs away with her treat without closing the fridge door."
	},
	{
		id: 447876543,
		name: "Rasmus", 
		description: "If this tip is not useful, we can also remove it. We can wait to see how  many people are following it."
	},
	];



	var actions = [
	{
		id: 00000,
		title: "Turn off and unplug standby power of TV, stereo, computer, etc.", 
		description: "Stop \"leaking energy\" in electronics. Many new TVs, chargers, computer peripherals and other electronics use electricity even when they are switched \"off.\" Although these \"standby losses\" are only a few watts each, they add up to more than 50 watts in a typical home that is consumed all the time. If possible, unplug electronic devices and chargers that have a block-shaped transformer on the plug when they are not in use. For computer scanners, printers and other devices that are plugged into a power strip, simply switch off the power strip after shutting down your computer. ",
		impact: 2,
		effort: 1,
		regular: true,  
		points: 30,
		date: new Date (2015, 5-1 , 23),
		participants: 34,
		like: 45,
		comments: [
		],
		share: 23,
	},
	{
		id: 0999,
		title: "Find and seal up leaks.", 
		description: "Do you have leaks at home? Look for places where you have pipes, vents or electrical conduits that go through the wall, ceiling or floor. Check the bathroom, underneath the kitchen sink, pipes inside a closet, etc. If you find a gap at the point where the pipe or vents goes through the wall, seal it up. It is one of the most cost-effective ways to save energy.",
		impact: 4,
		effort: 3,
		regular: false, 
		points: 70,
		date: new Date (2015, 6-1 ,29),
		participants: 52,
		like: 67,
		comments: comments2,
		share: 12
	}, 
	{
		id: 09009,
		title: "Keep the fridge doors closed as much as possible.", 
		description: "Refrigerators often account for as much as 15% of your home's total energy usage. Help your refrigerator and freezer operate efficiently and economically by keeping the fridge doors closed as much as possible so the cold air doesn't escape.",
		impact: 2,
		effort: 1,
		regular: true, 
		points: 30,
		date: new Date (2015, 6-1 ,10),
		participants: 25,
		like: 34,
		comments: comments3,
		share: 23
	}
	];

	var userActions = {
		userId: 90349034930,
		actions: actions,
	};

	return {
		userActions: userActions.actions,
		userId: userActions.userId, 
	}
}); 


