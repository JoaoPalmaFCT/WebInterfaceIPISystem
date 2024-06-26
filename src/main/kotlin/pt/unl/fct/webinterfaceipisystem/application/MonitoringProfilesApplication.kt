package pt.unl.fct.webinterfaceipisystem.application

import org.springframework.stereotype.Service
import pt.unl.fct.webinterfaceipisystem.data.*
import java.util.*

@Service
class MonitoringProfilesApplication (val groups : MonitoringProfileGroupRepository,
                                     val profiles : MonitoringProfileRepository,
                                     val posAdjust : ProfilePositionAdjustmentRepository,
                                     val points : PointRepository,
                                     val markers : MarkerRepository,
                                     val lines : LineCrossSectionRepository) {

    //Monitoring Profile Groups

    fun registerGroup(newGroup: MonitoringProfileGroupDAO) : MonitoringProfileGroupDAO{
        return groups.save(newGroup)
    }

    fun updateGroup(group: MonitoringProfileGroupDAO) : MonitoringProfileGroupDAO{
        return groups.save(group)
    }

    fun deleteGroup(group: MonitoringProfileGroupDAO){
        return groups.delete(group)
    }

    fun getGroupByGroup(group: String) : MonitoringProfileGroupDAO {
        return groups.findByMonitoringGroup(group)
    }

    fun getGroupById(id: Int) : MonitoringProfileGroupDAO? {
        return groups.findById(id).orElse(null)
    }

    fun getAllGroups() : MutableIterable<MonitoringProfileGroupDAO> {
        return groups.findAll()
    }

    //Monitoring Profiles

    fun registerProfile(profile: MonitoringProfileDAO) : MonitoringProfileDAO{
        return profiles.save(profile)
    }

    fun updateProfile(profile: MonitoringProfileDAO) : MonitoringProfileDAO{
        return profiles.save(profile)
    }

    fun deleteProfile(profile: MonitoringProfileDAO){
        return profiles.delete(profile)
    }

    fun getGroupByProfile(code: String) : MonitoringProfileDAO {
        return profiles.findByCode(code)
    }

    fun getAllProfiles() : MutableIterable<MonitoringProfileDAO> {
        return profiles.findAll()
    }

    //Monitoring Profile Position Adjustments

    fun registerPosAdjust(newPosAdjust: ProfilePositionAdjustmentDAO) : ProfilePositionAdjustmentDAO{
        return posAdjust.save(newPosAdjust)
    }

    fun updatePosAdjust(existPosAdjust: ProfilePositionAdjustmentDAO) : ProfilePositionAdjustmentDAO{
        return posAdjust.save(existPosAdjust)
    }

    fun deletePosAdjust(posAdjustToDelete: ProfilePositionAdjustmentDAO){
        return posAdjust.delete(posAdjustToDelete)
    }

    fun getMonitoringProfileByCode(code: String) : MonitoringProfileDAO {
        return profiles.findByCode(code)
    }

    fun getPositionAdjustmentMPId(mpId:Int) : List<ProfilePositionAdjustmentDAO>{
        return posAdjust.findByMonitoringProfileId(mpId)
    }

    fun getAllPosAjust() : MutableIterable<ProfilePositionAdjustmentDAO> {
        return posAdjust.findAll()
    }

    //Points

    fun registerPoint(newPoint: PointDAO) : PointDAO{
        return points.save(newPoint)
    }

    fun updatePoint(point: PointDAO) : PointDAO{
        return points.save(point)
    }

    fun deletePoint(point: PointDAO){
        return points.delete(point)
    }

    fun getPointByProfilePositionAdjustmentId(id:Int) : PointDAO? {
        return points.findByProfilePositionAdjustmentId(id)
    }

    fun getAllPoints() : MutableIterable<PointDAO> {
        return points.findAll()
    }

    //Markers

    fun registerMarker(newMarker: MarkerDAO) : MarkerDAO{
        return markers.save(newMarker)
    }

    fun updateMarker(marker: MarkerDAO) : MarkerDAO{
        return markers.save(marker)
    }

    fun deleteMarker(marker: MarkerDAO){
        return markers.delete(marker)
    }

    fun getMarkerByProfilePositionAdjustmentId(id:Int) : MarkerDAO? {
        return markers.findByProfilePositionAdjustmentId(id)
    }

    fun getAllMarkers() : MutableIterable<MarkerDAO> {
        return markers.findAll()
    }

    //Lines

    fun registerLineCrossSection(newLineCrossSection: LineCrossSectionDAO) : LineCrossSectionDAO{
        return lines.save(newLineCrossSection)
    }

    fun updateLineCrossSection(line: LineCrossSectionDAO) : LineCrossSectionDAO{
        return lines.save(line)
    }

    fun deleteLineCrossSection(line: LineCrossSectionDAO){
        return lines.delete(line)
    }

    fun getLineCrossSectionByProfilePositionAdjustmentId(id:Int) : LineCrossSectionDAO? {
        return lines.findByProfilePositionAdjustmentId(id)
    }

    fun getAllLines() : MutableIterable<LineCrossSectionDAO> {
        return lines.findAll()
    }
}