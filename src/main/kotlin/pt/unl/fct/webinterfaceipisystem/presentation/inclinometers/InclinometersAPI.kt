package pt.unl.fct.webinterfaceipisystem.presentation.inclinometers

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*
import pt.unl.fct.webinterfaceipisystem.data.*

@RequestMapping("/inclinometer")
@Tag(name = "Inclinometer", description = "Inclinometers API")
interface InclinometersAPI {

    @PostMapping("/")
    @Operation(summary = "Add an inclinometer")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Inclinometer added successfully"),
        ApiResponse(responseCode = "400", description = "Invalid inclinometer data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun add(@RequestBody inclinometer: InclinometerDTO)

    @PutMapping("/")
    @Operation(summary = "Update an inclinometer")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Inclinometer updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid inclinometer data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun update(@RequestBody inclinometer: InclinometerDTO)


    @DeleteMapping("/")
    @Operation(summary = "Delete an inclinometer")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Inclinometer deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid inclinometer data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun delete(@RequestBody inclinometer: InclinometerDTO)
}