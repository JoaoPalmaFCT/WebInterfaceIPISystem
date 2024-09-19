package pt.unl.fct.webinterfaceipisystem.data

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.CrudRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<UserDAO, Long> {

    fun findByEmail(email : String): UserDAO
}

interface CompanyRepository : JpaRepository<CompanyDAO, Long> {

    fun findById(id : Int): CompanyDAO
}


@Repository
interface InclinometerRepository : JpaRepository<InclinometerDAO, Int> {

    fun findByName(name : String): InclinometerDAO
}

@Repository
interface MonitoringGroupRepository : JpaRepository<MonitoringGroupDAO, Int> {

    //fun findById(id : Int): MonitoringGroupDAO

    fun findByName(name : String): MonitoringGroupDAO
}

@Repository
interface MonitoringProfileGroupRepository : JpaRepository<MonitoringProfileGroupDAO, Int> {

    fun findByMonitoringGroup(group : String): MonitoringProfileGroupDAO
}

@Repository
interface MonitoringProfileRepository : JpaRepository<MonitoringProfileDAO, Int> {

    fun findByCode(code : String): MonitoringProfileDAO
}

@Repository
interface ProfilePositionAdjustmentRepository : JpaRepository<ProfilePositionAdjustmentDAO, Int> {

    fun findByCode(code : String): ProfilePositionAdjustmentDAO

    fun findByMonitoringProfileId(monitoringProfileId:Int):List<ProfilePositionAdjustmentDAO>
}

@Repository
interface PointRepository : JpaRepository<PointDAO, Int> {

    fun findByProfilePositionAdjustmentId(id:Int): PointDAO?

}
@Repository
interface MarkerRepository : JpaRepository<MarkerDAO, Int> {

    fun findByProfilePositionAdjustmentId(id:Int): MarkerDAO?
}
@Repository
interface LineCrossSectionRepository : JpaRepository<LineCrossSectionDAO, Int> {

    fun findByProfilePositionAdjustmentId(id:Int): LineCrossSectionDAO?
}

@Repository
interface MeasurementsRepository : JpaRepository<MeasurementsDAO, Int> {


}

@Repository
interface ConnectionsRepository : JpaRepository<InfluxDBDAO, Int> {

    fun findByBucketAndUrl(bucket:String, url:String) : InfluxDBDAO

    fun findByBucket(bucket:String) : List<InfluxDBDAO>
}