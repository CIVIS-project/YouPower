'use strict';
var mongoose = require('mongoose');
var newId = mongoose.Types.ObjectId;
// default data that can be used to get started from an empty db


exports.actions = [
  {
    category: 'refrigerator', 
    name: 'Allow food to cool down first before placing it in the refrigerator.', 
    description: "It wiil be energy intensive to cool down warm food into frige tempreture.", 
    nameSe: 'Låt varm mat svalna innan du ställer in den i kylen eller frysen.', 
    descriptionSe: "Det tar mycket energi att kyla varm mat till kyl- eller frystemperatur.",
    nameIt: "It Allow food to cool down first before placing it in the refrigerator.",
    descriptionIt: "It It wiil be energy intensive to cool down warm food into frige tempreture.",
    type: "routine",
    impact: 2, 
    effort: 1 
  },
  {
    category: 'refrigerator', 
    name: 'Keep the fridge doors closed as much as possible.', 
    description: "Refrigerators often account for as much as 15% of your home's total energy usage. Help your refrigerator and freezer operate efficiently and economically by keeping the fridge doors closed as much as possible so the cold air doesn't escape. Moreover, leaving the frige door open for a longer period of time while you take out the items you need is more efficient than opening and closing it several times.", 
    nameSe: 'Håll dörrarna till kyl och frys stängda så mycket som möjligt.', 
    descriptionSe: "Hjälp din kyl och frys and vara mer energieffektiv genom att hålla dörrarna stängda så mycket som möjligt så att inte kylan försvinner ut i onödan. Men om du ska plocka ut eller in många saker är det bättre att hålla dörrarna öppna under hela tiden istället för att öppna och stänga flera gånger.",
    nameIt: "It Keep the fridge doors closed as much as possible.",
    descriptionIt: "It Refrigerators often account for as much as 15% of your home's total energy usage. Help your refrigerator and freezer operate efficiently and economically by keeping the fridge doors closed as much as possible so the cold air doesn't escape. Moreover, leaving the frige door open for a longer period of time while you take out the items you need is more efficient than opening and closing it several times.",
    type: "common",
    impact: 2, 
    effort: 1
  }
];
