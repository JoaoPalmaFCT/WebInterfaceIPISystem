package pt.unl.fct.webinterfaceipisystem.presentation.monitoringProfiles

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*
import pt.unl.fct.webinterfaceipisystem.data.*

@RequestMapping("/monitprofiles")
@Tag(name = "MonitoringGProfiles", description = "Monitoring Profiles API")
interface MonitoringProfilesAPI {

    @PostMapping("/")
    @Operation(summary = "Create a monitoring profile")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring profile created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun create(@RequestBody profile: MonitoringProfileDTO)

    @PutMapping("/")
    @Operation(summary = "Update a monitoring profile")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring profile updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun update(@RequestBody profile: MonitoringProfileDTO)

    @DeleteMapping("/")
    @Operation(summary = "Delete a monitoring group")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Monitoring profile deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun delete(@RequestBody profile: MonitoringProfileDTO)

    @GetMapping("/")
    @Operation(summary = "Get all monitoring profiles")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Monitoring profiles successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid monitoring profile data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getAvailableProfiles()
}