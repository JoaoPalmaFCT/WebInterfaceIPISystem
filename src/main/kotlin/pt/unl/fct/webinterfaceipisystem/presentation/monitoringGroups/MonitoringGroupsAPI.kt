package pt.unl.fct.webinterfaceipisystem.presentation.monitoringGroups

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*
import pt.unl.fct.webinterfaceipisystem.data.*

@RequestMapping("/api/monitgroup")
@Tag(name = "Monitoring Groups", description = "Monitoring Groups API")
interface MonitoringGroupsAPI {

    @PostMapping("/")
    @Operation(summary = "Create a monitoring group",
            description = "Adds a monitoring group to the system. The monitoring group data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring Group created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun create(@RequestBody group: MonitoringGroupDTO)

    @PutMapping("/")
    @Operation(summary = "Update a monitoring group",
            description = "Updates an existing monitoring group in the system. The monitoring group data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring group updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun update(@RequestBody group: MonitoringGroupDTO)

    @DeleteMapping("/")
    @Operation(summary = "Delete a monitoring group",
            description = "Removes an existing monitoring group from the system. The monitoring group data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring group deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun delete(@RequestBody group: MonitoringGroupDTO)

    @GetMapping("/")
    @Operation(summary = "Get all monitoring groups",
            description = "Retrieves all existing monitoring groups from the system.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Monitoring groups successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getAvailableGroups()

    @PostMapping("/measurement")
    @Operation(summary = "Add a new measurement to a monitoring group",
            description = "Adds a measurement to a monitoring group in the system. The measurement data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Measurement added successfully"),
        ApiResponse(responseCode = "400", description = "Invalid measurement data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun addMeasurement(@RequestBody m: MeasurementsDTO, mg: MonitoringGroupDTO)

    @DeleteMapping("/measurement")
    @Operation(summary = "Remove measurement from monitoring group",
            description = "Removes an existing measurement from a monitoring group in the system. The measurement data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Measurement removed successfully"),
        ApiResponse(responseCode = "400", description = "Invalid measurement data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun removeMeasurement(@RequestBody m: MeasurementsDTO, mg: MonitoringGroupDTO)

}