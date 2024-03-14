package pt.unl.fct.webinterfaceipisystem.presentation.inclinometers

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import pt.unl.fct.webinterfaceipisystem.application.InclinometersApplication
import pt.unl.fct.webinterfaceipisystem.data.*
import pt.unl.fct.webinterfaceipisystem.presentation.inclinometers.InclinometersAPI

class InclinometersController(val app: InclinometersApplication) : InclinometersAPI {

    override fun add(inclinometer: InclinometerDTO) {
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

    override fun update(inclinometer: InclinometerDTO) {
        TODO("Not yet implemented")
    }

    override fun delete(inclinometer: InclinometerDTO) {
        TODO("Not yet implemented")
    }
}