package pt.unl.fct.webinterfaceipisystem.application

import org.springframework.stereotype.Service
import pt.unl.fct.webinterfaceipisystem.data.MeasurementsDAO
import pt.unl.fct.webinterfaceipisystem.data.MeasurementsRepository

@Service
class SettingsApplication (val measurements: MeasurementsRepository) {

    //Measurements

    fun registerMeasurement(newM: MeasurementsDAO) : MeasurementsDAO {
        return measurements.save(newM)
    }

    fun getAllMeasurements() : MutableIterable<MeasurementsDAO> {
        return measurements.findAll()
    }
}