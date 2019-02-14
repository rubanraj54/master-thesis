module.exports = {

    generateObservationName(sensorName) {
        let names = sensorName.split('_');

        let observationName = names.map(function (name) {
            return name.charAt(0).toUpperCase() + name.slice(1)
        }).join("");

        return observationName + "Observation";
    } ,
    generateObservationFileName(sensorName) {
        let names = sensorName.split('_');

        let observationFileName = names.map(function (name) {
            return name.toLowerCase()
        }).join("-");

        return observationFileName;
    } ,

}