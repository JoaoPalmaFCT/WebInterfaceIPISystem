package pt.unl.fct.webinterfaceipisystem.presentation.settings

import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import pt.unl.fct.webinterfaceipisystem.application.SettingsApplication
import pt.unl.fct.webinterfaceipisystem.data.MeasurementsDAO
import pt.unl.fct.webinterfaceipisystem.data.MeasurementsDTO


@RestController
class SettingsController (val app: SettingsApplication) : SettingsAPI{
    override fun addMeasurement(measurement: MeasurementsDTO) {
        try {
            if(measurement.measurement.isBlank() || measurement.inclinometers.isBlank())
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid measurement data")

            val newM = MeasurementsDAO(
                    measurement = measurement.measurement, host = measurement.host,
                    inclinometers = measurement.inclinometers
            )

            app.registerMeasurement(newM)

        }catch(e: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid measurement data")
        }
    }

    override fun getAvailableMeasurements(): List<MeasurementsDTO> {
        try {
            val measurements = app.getAllMeasurements()
            val measurementsListDTO = ArrayList<MeasurementsDTO>()
            for(m in measurements){
                val mDTO = MeasurementsDTO(
                        measurement = m.measurement, host = m.host,
                        inclinometers = m.inclinometers
                )
                measurementsListDTO.add(mDTO)
            }
            return measurementsListDTO

        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Measurements not found")
        }
    }
}