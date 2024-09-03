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

    @PostMapping("/connection")
    @Operation(summary = "Create a new connection",
            description = "Adds an connection to the system. The connection data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Connection created successfully"),
        ApiResponse(responseCode = "400", description = "Invalid connection data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun addConnection(@RequestBody connection: ConnectionDTO)

    @PutMapping("/connection")
    @Operation(summary = "Update a new connection",
            description = "Updates an existing connection to the system. The connection data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Connection updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid connection data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun updateConnection(@RequestBody connection: ConnectionDTO)

    @DeleteMapping("/connection")
    @Operation(summary = "Delete a connection",
            description = "Deletes an existing connection to the system. The connection data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "Connection deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid connection data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun deleteConnection(@RequestBody connection: ConnectionDTO)

    @GetMapping("/connection/{user}")
    @Operation(summary = "Get all connections",
            description = "Retrieves all connections of a user from the system. The connection data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Connections successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid connection data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getConnections(@PathVariable user:String) : List<ConnectionDTO>

    @GetMapping("/connectionMP/{mg}")
    @Operation(summary = "Get all Monitoring Group connections",
            description = "Retrieves all connections of a monitoring group from the system. The connection data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Monitoring group connections successfully listed"),
        ApiResponse(responseCode = "400", description = "Invalid connection data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getConnectionsFromMonitGroup(@PathVariable mg:String) : List<ConnectionDTO>

}