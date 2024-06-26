package pt.unl.fct.webinterfaceipisystem.presentation.settings

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*
import pt.unl.fct.webinterfaceipisystem.data.*

@RequestMapping("/api/settings")
@Tag(name = "Settings", description = "Settings API")
interface SettingsAPI {

    @PostMapping("/measurement")
    @Operation(summary = "Create a new measurement")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Measurement created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid measurement group data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun addMeasurement(@RequestBody measurement: MeasurementsDTO)

    @GetMapping("/measurement")
    @Operation(summary = "Get all measurements")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Measurements successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid measurement data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getAvailableMeasurements() : List<MeasurementsDTO>

}