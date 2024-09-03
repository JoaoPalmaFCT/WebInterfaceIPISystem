package pt.unl.fct.webinterfaceipisystem.presentation.monitoringGroups

import org.springframework.web.bind.annotation.RestController
import pt.unl.fct.webinterfaceipisystem.data.MeasurementsDTO
import pt.unl.fct.webinterfaceipisystem.data.MonitoringGroupDTO
import pt.unl.fct.webinterfaceipisystem.presentation.monitoringProfiles.MonitoringProfilesAPI

@RestController
class MonitoringGroupsController  : MonitoringGroupsAPI {
    override fun create(group: MonitoringGroupDTO) {
        TODO("Not yet implemented")
    }

    override fun update(group: MonitoringGroupDTO) {
        TODO("Not yet implemented")
    }

    override fun delete(group: MonitoringGroupDTO) {
        TODO("Not yet implemented")
    }

    override fun getAvailableGroups() {
        TODO("Not yet implemented")
    }

    override fun addMeasurement(m: MeasurementsDTO, mg: MonitoringGroupDTO) {
        TODO("Not yet implemented")
    }

    override fun removeMeasurement(m: MeasurementsDTO, mg: MonitoringGroupDTO) {
        TODO("Not yet implemented")
    }

}