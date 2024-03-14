package pt.unl.fct.webinterfaceipisystem.application

import pt.unl.fct.webinterfaceipisystem.data.InclinometerDAO
import pt.unl.fct.webinterfaceipisystem.data.InclinometerRepository

class InclinometersApplication (val inclinometers : InclinometerRepository) {

    fun addInclinometer(newInclinometer: InclinometerDAO): InclinometerDAO {
        return inclinometers.save(newInclinometer)
    }

    fun updateInclinometer(updatedInclinometer: InclinometerDAO): InclinometerDAO {
        return inclinometers.save(updatedInclinometer)
    }

    fun deleteInclinometer(userD: InclinometerDAO) {
        inclinometers.delete(userD)
    }

    /*fun getInclinometerById(id: Long): InclinometerDAO{
        return inclinometers.findById(id).orElse(null)
    }*/

    fun getInclinometerByName(name: String): InclinometerDAO {
        return inclinometers.findByName(name)
    }
}