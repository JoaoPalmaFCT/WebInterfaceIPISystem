package pt.unl.fct.webinterfaceipisystem.presentation.monitoringProfiles

import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import pt.unl.fct.webinterfaceipisystem.application.MonitoringProfilesApplication
import pt.unl.fct.webinterfaceipisystem.data.*

@RestController
class MonitoringProfilesController(val app: MonitoringProfilesApplication) : MonitoringProfilesAPI {
    override fun createGroup(@RequestBody profile: MonitoringProfileGroupDTO) {
        try {
            if(profile.group.isBlank() || profile.measurements.isBlank())
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid group data")

            val newGroup = MonitoringProfileGroupDAO(
                    monitoringGroup = profile.group, measurements = profile.measurements,
                    monitoringGroupId = profile.monitoringGroupId
            )

            app.registerGroup(newGroup)

        }catch(e: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid group data")
        }
    }

    override fun updateGroup(@RequestBody profile: MonitoringProfileGroupDTO) {
        try {
            if(profile.group.isBlank() || profile.measurements.isBlank())
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid group data")

            val existingGroup = app.getGroupByGroup(profile.group)
            val auxGroup = MonitoringProfileGroupDAO(
                    id = existingGroup.id, monitoringGroup = profile.group,
                    measurements = profile.measurements, monitoringGroupId = profile.monitoringGroupId
            )
            app.updateGroup(auxGroup)
        }catch(e: EmptyResultDataAccessException){
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "\"Group not found")
        }catch(e1: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid group data")
        }
    }

    override fun deleteGroup(@RequestBody profile: MonitoringProfileGroupDTO) {
        try {
            val existingGroup = app.getGroupByGroup(profile.group)
            app.deleteGroup(existingGroup)
        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found")
        }
    }

    override fun getAvailableProfilesGroups(): List<MonitoringProfileGroupDTO> {
        try {
            val groups = app.getAllGroups()
            val groupsListDTO = ArrayList<MonitoringProfileGroupDTO>()
            for(g in groups){
                val gDTO = MonitoringProfileGroupDTO(
                        group = g.monitoringGroup,
                        measurements = g.measurements,
                        monitoringGroupId = g.monitoringGroupId
                )
                groupsListDTO.add(gDTO)
            }
            return groupsListDTO

        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Groups not found")
        }
    }

    override fun create(@RequestBody profile: MonitoringProfileDTO) {
        try {
            if(profile.group.isBlank() || profile.name.isBlank() || profile.description.isBlank() || profile.type.isBlank()
                    || profile.inclinometers.isBlank())
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid profile data")

            var typeOfProfile = MonitoringProfDAO.PLAN
            if(profile.type.uppercase() === MonitoringProfDAO.CROSSSECTION.toString()){
                typeOfProfile = MonitoringProfDAO.CROSSSECTION
            }

            val newProfile = MonitoringProfileDAO(
                    code = profile.code, monitoringGroup = profile.group, name = profile.name, description = profile.description,
                    type = typeOfProfile, attachedImage = profile.attachedImage, inclinometers = profile.inclinometers,
                    monitoringGroupId = profile.monitoringGroupId
            )

            val newProfileReturn = app.registerProfile(newProfile)

            val incArray = profile.inclinometers.split("?")

            //val posListDAO = ArrayList<ProfilePositionAdjustmentDAO>()
            var counterInc = 0
            for ((counterCode, p) in incArray.withIndex()) {
                val pDAO = ProfilePositionAdjustmentDAO(
                        uniqueId = counterCode,
                        code = counterCode.toString(), measurement = incArray[counterInc+1], inc = incArray[counterInc],
                        type = typeOfProfile, positionAdjusted = false, monitoringProfileId = newProfileReturn.id
                )
                counterInc += 2
                //posListDAO.add(pDAO)
                app.registerPosAdjust(pDAO)
            }

        }catch(e: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid profile data")
        }
    }

    override fun update(@RequestBody profile: MonitoringProfileDTO) {
        try {
            if(profile.group.isBlank() || profile.name.isBlank() || profile.description.isBlank() || profile.type.isBlank()
                    || profile.inclinometers.isBlank())
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid profile data")

            var typeOfProfile = MonitoringProfDAO.PLAN
            if(profile.type.uppercase() === MonitoringProfDAO.CROSSSECTION.toString()) {
                typeOfProfile = MonitoringProfDAO.CROSSSECTION
            }

            val existingMP = app.getMonitoringProfileByCode(profile.code)
            val auxMP = MonitoringProfileDAO(
                    id = existingMP.id, code = existingMP.code, monitoringGroup = profile.group, name = profile.name,
                    description = profile.description, type = typeOfProfile, inclinometers = profile.inclinometers,
                    attachedImage = profile.attachedImage, monitoringGroupId = existingMP.monitoringGroupId
            )
            app.updateProfile(auxMP)
        }catch(e: EmptyResultDataAccessException){
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "\"Profile not found")
        }catch(e1: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid profile data")
        }
    }

    override fun delete(@RequestBody profile: MonitoringProfileDTO) {
        try {
            val existingMP = app.getMonitoringProfileByCode(profile.code)
            app.deleteProfile(existingMP)
        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found")
        }
    }

    override fun getAvailableProfiles() : List<MonitoringProfileDTO>{
        try {
            val profiles = app.getAllProfiles()
            val profilesListDTO = ArrayList<MonitoringProfileDTO>()
            for(p in profiles){
                val pDTO = MonitoringProfileDTO(
                        code = p.code, group = p.monitoringGroup, name = p.name, description = p.description,
                        type = p.type.toString(), attachedImage = p.attachedImage, inclinometers = p.inclinometers,
                        monitoringGroupId = p.monitoringGroupId
                )
                profilesListDTO.add(pDTO)
            }
            return profilesListDTO

        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Groups not found")
        }
    }

    override fun getProfileAdjustmentData(): List<ProfilePositionAdjustmentDTO> {
        try {
            val posAdjust = app.getAllPosAjust()
            val posListDTO = ArrayList<ProfilePositionAdjustmentDTO>()
            for(p in posAdjust){
                val pDTO = ProfilePositionAdjustmentDTO(
                        uniqueId = p.uniqueId,
                        code = p.code, measurement = p.measurement, inc = p.inc,
                        type = p.type, positionAdjusted = p.positionAdjusted,
                        monitoringProfileId = p.monitoringProfileId
                )
                posListDTO.add(pDTO)
            }
            return posListDTO

        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Groups not found")
        }
    }

    override fun getProfileAdjustmentDataForAProfile(@PathVariable  mpId: Int): List<ProfilePositionAdjustmentDTO> {
        try {
            val posAdjust = app.getPositionAdjustmentMPId(mpId)
            val posListDTO = ArrayList<ProfilePositionAdjustmentDTO>()
            for(p in posAdjust){
                val pDTO = ProfilePositionAdjustmentDTO(
                        uniqueId = p.uniqueId,
                        code = p.code, measurement = p.measurement, inc = p.inc,
                        type = p.type, positionAdjusted = p.positionAdjusted,
                        monitoringProfileId = p.monitoringProfileId
                )
                posListDTO.add(pDTO)
            }
            return posListDTO

        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Adjustment data not found")
        }
    }

    override fun createPoint(point: PointDTO) {
        try {
            val existingPoint: PointDAO? = app.getPointByProfilePositionAdjustmentId(point.profilePositionAdjustmentId)
            if(existingPoint === null){
                val newPoint = PointDAO(
                        positionX = point.positionX, positionY = point.positionY,
                        profilePositionAdjustmentId = point.profilePositionAdjustmentId
                )

                app.registerPoint(newPoint)
            }else{
                val updatedPoint = PointDAO(
                        id = existingPoint.id,
                        positionX = point.positionX, positionY = point.positionY,
                        profilePositionAdjustmentId = existingPoint.profilePositionAdjustmentId
                )
                app.updatePoint(updatedPoint)
            }

        }catch(e: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid point data")
        }
    }

    override fun getAvailablePoints(@PathVariable mpId:Int): List<PointDTO> {
        try {
            val pointsListDTO = ArrayList<PointDTO>()
            val adjustedPos = app.getPositionAdjustmentMPId(mpId)

            for(aP in adjustedPos){
                val point = app.getPointByProfilePositionAdjustmentId(aP.id)
                val pointDTO = point?.let {
                    PointDTO(
                            positionX = point.positionX,
                            positionY = point.positionY,
                            profilePositionAdjustmentId = point.profilePositionAdjustmentId
                    )

                }
                if (pointDTO != null) {
                    pointsListDTO.add(pointDTO)
                }
            }

            return pointsListDTO

        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Points not found")
        }
    }

    override fun createMarker(marker: MarkerDTO) {
        try {
            val existingMarker: MarkerDAO? = app.getMarkerByProfilePositionAdjustmentId(marker.profilePositionAdjustmentId)
            if(existingMarker === null){
                val newMarker = MarkerDAO(
                        lat = marker.lat, lng = marker.lng,
                        profilePositionAdjustmentId = marker.profilePositionAdjustmentId
                )

                app.registerMarker(newMarker)
            }else{
                val updatedMarker = MarkerDAO(
                        id = existingMarker.id,
                        lat = marker.lat, lng = marker.lng,
                        profilePositionAdjustmentId = existingMarker.profilePositionAdjustmentId
                )
                app.updateMarker(updatedMarker)
            }

        }catch(e: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid marker data")
        }
    }

    override fun getAvailableMarkers(@PathVariable mpId:Int): List<MarkerDTO> {
        try {
            val markersListDTO = ArrayList<MarkerDTO>()
            val adjustedPos = app.getPositionAdjustmentMPId(mpId)

            for(aP in adjustedPos){
                val marker = app.getMarkerByProfilePositionAdjustmentId(aP.id)
                val markerDTO = marker?.let {
                    MarkerDTO(
                            lat = marker.lat,
                            lng = marker.lng,
                            profilePositionAdjustmentId = marker.profilePositionAdjustmentId
                    )
                }
                if (markerDTO != null) {
                    markersListDTO.add(markerDTO)
                }
            }

            return markersListDTO

        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Markers not found")
        }
    }

    override fun createLine(line: LineCrossSectionDTO) {
        try {
            val existingLineCrossSection: LineCrossSectionDAO? = app.getLineCrossSectionByProfilePositionAdjustmentId(line.profilePositionAdjustmentId)
            if(existingLineCrossSection === null){
                val newLineCrossSection = LineCrossSectionDAO(
                        topX = line.topX, topY = line.topY,
                        bottomX = line.bottomX, bottomY = line.bottomY,
                        profilePositionAdjustmentId = line.profilePositionAdjustmentId
                )

                app.registerLineCrossSection(newLineCrossSection)
            }else{
                val updatedLineCrossSection = LineCrossSectionDAO(
                        id = existingLineCrossSection.id,
                        topX = line.topX, topY = line.topY,
                        bottomX = line.bottomX, bottomY = line.bottomY,
                        profilePositionAdjustmentId = existingLineCrossSection.profilePositionAdjustmentId
                )
                app.updateLineCrossSection(updatedLineCrossSection)
            }

        }catch(e: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid line data")
        }
    }

    override fun getAvailableLines(@PathVariable mpId:Int): List<LineCrossSectionDTO> {
        try {
            val linesListDTO = ArrayList<LineCrossSectionDTO>()
            val adjustedPos = app.getPositionAdjustmentMPId(mpId)

            for(aP in adjustedPos){
                val line = app.getLineCrossSectionByProfilePositionAdjustmentId(aP.id)
                val lineDTO = line?.let {
                    LineCrossSectionDTO(
                            topX = line.topX, topY = line.topY,
                            bottomX = line.bottomX, bottomY = line.bottomY,
                            profilePositionAdjustmentId = line.profilePositionAdjustmentId
                    )
                }
                if (lineDTO != null) {
                    linesListDTO.add(lineDTO)
                }
            }

            return linesListDTO

        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Lines not found")
        }
    }

}