angular.module('civis.youpower.translations',[]).config(['$translateProvider', function ($translateProvider) {
  $translateProvider.translations('en', {
    Cancel: "Cancel",
    Save: "Save",
    CHANGE: "CHANGE",
    Get_started: "Get started",
    Settings: "Settings",
    About_You: "About You",
    Personal_Profile: "Personal Profile",
    Username: "Username",
    Name: "Name",
    Gender: "Gender",
    Male: "Male",
    Female: "Female",
    Birthday: "Birthday",
    Language: "Language",
    English: "English",
    Italian: "Italian"
  });
  $translateProvider.translations('it', {
    Cancel: "Annullare",
    Save: "Salvare",
    CHANGE: "CAMBIAMENTO",
    Get_started: "Iniziare",
    Settings: "Impostazioni",
    About_You: "Su Di Te",
    Personal_Profile: "Profilo Personale",
    Name: "Nome",
    Gender: "Genere",
    Male: "Maschio",
    Female: "Femminile",
    Username: "Nome Utente",
    Birthday: "Compleanno",
    Language: "Lingua",
    English: "Inglese",
    Italian: "Italiano"
  });

  $translateProvider.preferredLanguage('en')
    .fallbackLanguage('en');
}]);
