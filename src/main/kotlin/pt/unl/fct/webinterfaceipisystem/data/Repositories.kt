package pt.unl.fct.webinterfaceipisystem.data

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.CrudRepository

interface UserRepository : JpaRepository<UserDAO, Long> {

    fun findByEmail(email : String): UserDAO
}

interface InclinometerRepository : JpaRepository<InclinometerDAO, Long> {

    fun findByName(name : String): InclinometerDAO
}

interface MonitoringGroupRepository : JpaRepository<MonitoringGroupDAO, Long> {

    fun findByName(name : String): MonitoringGroupDAO
}

interface MonitoringProfileRepository : JpaRepository<MonitoringProfileDAO, Long> {

    fun findByName(name : String): MonitoringProfileDAO
}
