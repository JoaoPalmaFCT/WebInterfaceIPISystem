package pt.unl.fct.webinterfaceipisystem.presentation.monitoringGroups

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*
import pt.unl.fct.webinterfaceipisystem.data.*

@RequestMapping("/monitgroup")
@Tag(name = "MonitoringGroup", description = "Monitoring Groups API")
interface MonitoringGroupsAPI {

    @PostMapping("/")
    @Operation(summary = "Create a monitoring group")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring Group created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun create(@RequestBody group: MonitoringGroupDTO)

    @PutMapping("/")
    @Operation(summary = "Update a monitoring group")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring group updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun update(@RequestBody group: MonitoringGroupDTO)

    @DeleteMapping("/")
    @Operation(summary = "Delete a monitoring group")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring group deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun delete(@RequestBody group: MonitoringGroupDTO)

    @GetMapping("/")
    @Operation(summary = "Get all monitoring groups")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Monitoring groups successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getAvailableGroups()

}