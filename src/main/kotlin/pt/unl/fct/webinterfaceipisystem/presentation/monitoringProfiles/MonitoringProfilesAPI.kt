package pt.unl.fct.webinterfaceipisystem.presentation.monitoringProfiles

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*
import pt.unl.fct.webinterfaceipisystem.data.*

@RequestMapping("/api/monitprofiles")
@Tag(name = "Monitoring Profiles", description = "Monitoring Profiles API")
interface MonitoringProfilesAPI {

    @PostMapping("/group")
    @Operation(summary = "Create a monitoring profile group",
            description = "Adds a monitoring profile group to the system. The monitoring profile group data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring profile group created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun createGroup(@RequestBody profile: MonitoringProfileGroupDTO)

    @PutMapping("/group")
    @Operation(summary = "Update a monitoring profile group",
            description = "Updates a monitoring profile group in the system. The monitoring profile group data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring profile group updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun updateGroup(@RequestBody profile: MonitoringProfileGroupDTO)

    @DeleteMapping("/group")
    @Operation(summary = "Delete a monitoring group",
            description = "Removes a monitoring profile group from the system. The monitoring profile group data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring profile group deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun deleteGroup(@RequestBody profile: MonitoringProfileGroupDTO)

    @GetMapping("/group")
    @Operation(summary = "Get all monitoring profile groups",
            description = "Retrieves all monitoring profile groups from the system. The monitoring profile groups data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Monitoring profile groups successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile groups data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getAvailableProfilesGroups() : List<MonitoringProfileGroupDTO>

    @PostMapping("/")
    @Operation(summary = "Create a monitoring profile",
            description = "Adds a monitoring profile to the system. The monitoring profile data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring profile created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun create(@RequestBody profile: MonitoringProfileDTO)

    @PutMapping("/")
    @Operation(summary = "Update a monitoring profile",
            description = "Updates an existing monitoring profile in the system. The monitoring profile data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring profile updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun update(@RequestBody profile: MonitoringProfileDTO)

    @DeleteMapping("/")
    @Operation(summary = "Delete a monitoring profile",
            description = "Deletes an existing monitoring profile from the system. The monitoring profile data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring profile deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun delete(@RequestBody profile: MonitoringProfileDTO)

    @GetMapping("/")
    @Operation(summary = "Get all monitoring profiles",
            description = "Retrieves all monitoring profiles from the system. The monitoring profile data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Monitoring profiles successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getAvailableProfiles() : List<MonitoringProfileDTO>

    @GetMapping("/posAdjust")
    @Operation(summary = "Get all positions",
            description = "Retrieves all inclinometer positions from the system. The inclinometer positions data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Positions successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid position adjustment data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getProfileAdjustmentData() : List<ProfilePositionAdjustmentDTO>

    @GetMapping("/posAdjust/{mpId}")
    @Operation(summary = "Get all positions of a profile",
            description = "Retrieves all inclinometer positions of a profile from the system. The inclinometer positions of a profile data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Positions successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid position adjustment data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getProfileAdjustmentDataForAProfile(@PathVariable mpId:Int) : List<ProfilePositionAdjustmentDTO>

    @PostMapping("/point")
    @Operation(summary = "Create a point",
            description = "Adds an inclinometer position point to the system. The inclinometer position point data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Point created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid point data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun createPoint(@RequestBody point: PointDTO)

    @GetMapping("/point/{mpId}")
    @Operation(summary = "Get points",
            description = "Retrieves all inclinometer position points of a profile from the system. The inclinometer position points of a profile data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Points successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid points data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getAvailablePoints(@PathVariable mpId:Int) : List<PointDTO>

    @PostMapping("/marker")
    @Operation(summary = "Create a marker",
            description = "Adds an inclinometer position marker to the system. The inclinometer position marker data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Marker created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid marker data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun createMarker(@RequestBody marker: MarkerDTO)

    @GetMapping("/marker/{mpId}")
    @Operation(summary = "Get markers",
            description = "Retrieves all inclinometer position markers of a profile from the system. The inclinometer position markers of a profile data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Markers successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid markers data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getAvailableMarkers(@PathVariable mpId:Int) : List<MarkerDTO>

    @PostMapping("/line")
    @Operation(summary = "Create a Line",
            description = "Adds an inclinometer position line to the system. The inclinometer position line data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Line created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid line data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun createLine(@RequestBody line: LineCrossSectionDTO)

    @GetMapping("/line/{mpId}")
    @Operation(summary = "Get lines",
            description = "Retrieves all inclinometer position lines of a profile from the system. The inclinometer position lines of a profile data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Markers successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid markers data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getAvailableLines(@PathVariable mpId: Int) : List<LineCrossSectionDTO>

}