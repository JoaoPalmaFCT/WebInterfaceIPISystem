package pt.unl.fct.webinterfaceipisystem.presentation.inclinometers


import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import pt.unl.fct.webinterfaceipisystem.application.InclinometersApplication
import pt.unl.fct.webinterfaceipisystem.data.*
@RestController
class InclinometersController(val app: InclinometersApplication) : InclinometersAPI {

    override fun add(@RequestBody inclinometer: InclinometerDTO) {
        try {
            if(inclinometer.name.isBlank() || inclinometer.currentFrequency.isBlank())
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid inclinometer data")

            val newInclinometer = InclinometerDAO(
                    name = inclinometer.name, length = inclinometer.length,
                    currentFrequency = inclinometer.currentFrequency, azimuth = inclinometer.azimuth,
                    latitude = inclinometer.latitude, longitude = inclinometer.longitude,
                    heightTopSensor = inclinometer.heightTopSensor, casingAngleToHorizontal = inclinometer.casingAngleToHorizontal,
            )

            app.addInclinometer(newInclinometer)

        }catch(e: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid inclinometer data")
        }
    }

    override fun update(@RequestBody inclinometer: InclinometerDTO) {
        TODO("Not yet implemented")
    }

    override fun delete(@RequestBody inclinometer: InclinometerDTO) {
        /*try {
            val existingInclinometer = app.getInclinometerByName(inclinometer.name)
            val auxInclinometer = InclinometerDAO(

            )
            app.deleteInclinometer(auxInclinometer)
        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Inclinometer not found")
        }*/
    }

    override fun addSensorSpacing(sensorSpacing: Int, sensorID1: Int, sensorID2: Int, inc: Int) {
        TODO("Not yet implemented")
    }

    override fun addSensorSpacing(additionalInfo: InclinometerDTO) {
        TODO("Not yet implemented")
    }

    override fun updateSensorSpacing(sensorSpacing: Int, sensorID1: Int, sensorID2: Int, inc: Int) {
        TODO("Not yet implemented")
    }

    override fun updateSensorSpacing(additionalInfo: InclinometerDTO) {
        TODO("Not yet implemented")
    }

    override fun addSoilLayers(soilLayers: SoilLayersDTO) {
        TODO("Not yet implemented")
    }

    override fun updateSoilLayers(soilLayers: SoilLayersDTO) {
        TODO("Not yet implemented")
    }
}