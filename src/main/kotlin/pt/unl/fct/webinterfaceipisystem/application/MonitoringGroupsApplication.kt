package pt.unl.fct.webinterfaceipisystem.application

import org.springframework.stereotype.Service
import pt.unl.fct.webinterfaceipisystem.data.MonitoringGroupDAO
import pt.unl.fct.webinterfaceipisystem.data.MonitoringGroupRepository

@Service
class MonitoringGroupsApplication (val groups : MonitoringGroupRepository) {

    fun registerGroup(newGroup: MonitoringGroupDAO) : MonitoringGroupDAO {
        return groups.save(newGroup)
    }

    fun updateGroup(group: MonitoringGroupDAO) : MonitoringGroupDAO {
        return groups.save(group)
    }

    fun deleteGroup(group: MonitoringGroupDAO){
        return groups.delete(group)
    }

    fun getGroupById(id: Int) : MonitoringGroupDAO? {
        return groups.findById(id).orElse(null)
    }
}