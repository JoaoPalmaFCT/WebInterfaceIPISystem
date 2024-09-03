package pt.unl.fct.webinterfaceipisystem.presentation.inclinometers

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*
import pt.unl.fct.webinterfaceipisystem.data.*

@RequestMapping("/api/inclinometer")
@Tag(name = "Inclinometer", description = "Inclinometers API")
interface InclinometersAPI {

    @PostMapping("/")
    @Operation(summary = "Add an inclinometer",
            description = "Adds a new inclinometer to the system. The inclinometer data must be valid.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Inclinometer added successfully"),
        ApiResponse(responseCode = "400", description = "Invalid inclinometer data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun add(@RequestBody inclinometer: InclinometerDTO)

    @PutMapping("/")
    @Operation(summary = "Update an inclinometer",
            description = "Updates an existing inclinometer in the system. The inclinometer data must be valid.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Inclinometer updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid inclinometer data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun update(@RequestBody inclinometer: InclinometerDTO)


    @DeleteMapping("/")
    @Operation(summary = "Delete an inclinometer",
            description = "Deletes an existing inclinometer from the system. The inclinometer data must be valid.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Inclinometer deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid inclinometer data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun delete(@RequestBody inclinometer: InclinometerDTO)

    @PostMapping("/sensor")
    @Operation(summary = "Add sensor spacing between two sensors",
            description = "Adds the sensor spacing between two sensors of an inclinometer in the system. The inclinometer and sensors data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Sensor spacing added successfully"),
        ApiResponse(responseCode = "400", description = "Invalid sensor data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun addSensorSpacing(@RequestBody sensorSpacing: Int, sensorID1: Int, sensorID2: Int, inc:Int)

    @PutMapping("/sensor")
    @Operation(summary = "Update sensor spacing between two sensors",
            description = "Updates the sensor spacing between two sensors of an inclinometer in the system. The inclinometer and sensors data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Sensor spacing updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid sensor data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun updateSensorSpacing(@RequestBody sensorSpacing: Int, sensorID1: Int, sensorID2: Int, inc:Int)

    @PostMapping("/additionalInfo")
    @Operation(summary = "Add additional information to an inclinometer",
            description = "Adds additional information to an existing inclinometer from the system. The inclinometer data must be valid.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Additional information added successfully"),
        ApiResponse(responseCode = "400", description = "Invalid information data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun addSensorSpacing(@RequestBody additionalInfo: InclinometerDTO)

    @PutMapping("/additionalInfo")
    @Operation(summary = "Update additional information to an inclinometer",
            description = "Updates additional information to an existing inclinometer from the system. The inclinometer data must be valid.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Additional information updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid information data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun updateSensorSpacing(@RequestBody additionalInfo: InclinometerDTO)

    @PostMapping("/soilLayers")
    @Operation(summary = "Add soil layers to an inclinometer",
            description = "Adds soil layers to an existing inclinometer from the system. The inclinometer and soil layers data must be valid.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Soil Layers added successfully"),
        ApiResponse(responseCode = "400", description = "Invalid soil layers data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun addSoilLayers(@RequestBody soilLayers: SoilLayersDTO)

    @PutMapping("/soilLayers")
    @Operation(summary = "Update soil layers to an inclinometer",
            description = "Updates soil layers to an existing inclinometer from the system. The inclinometer and soil layers data must be valid.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Soil Layers updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid soil layers data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun updateSoilLayers(@RequestBody soilLayers: SoilLayersDTO)
}