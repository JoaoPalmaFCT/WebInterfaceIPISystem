package pt.unl.fct.webinterfaceipisystem.presentation.users

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*
import pt.unl.fct.webinterfaceipisystem.data.*

@CrossOrigin
@RequestMapping("/api/user")
@Tag(name = "Users", description = "Users API")
interface UsersAPI {

    @PostMapping("/")
    @Operation(summary = "Register user",
            description = "Adds a user to the system. The user data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "User registered successfully"),
        ApiResponse(responseCode = "400", description = "Invalid user data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun register(@RequestBody user: UserDTO)

    @PutMapping("/")
    @Operation(summary = "Update user data",
            description = "Updates an existing user in the system. The user data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "User updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid user data"),
        ApiResponse(responseCode = "404", description = "User not found"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun updateUserData(@RequestBody updatedUser: UpdatedUserDTO)

    @PutMapping("/password")
    @Operation(summary = "Update user password",
            description = "Updated password of an existing user in the system. The user data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "User updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid user data"),
        ApiResponse(responseCode = "404", description = "User not found"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun updateUserPassword(@RequestBody updatedUserPassword: UpdatedUserPasswordDTO)


    @GetMapping("/{email}")
    @Operation(summary = "Find a user by its email",
            description = "Retrieves a user from the system. The user data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "User found"),
        ApiResponse(responseCode = "404", description = "User not found"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getUserByEmail(@PathVariable email: String): UserDTO

    @DeleteMapping("/{email}")
    @Operation(summary = "Delete a user",
            description = "Deletes a user from the system. The user data must be valid and complete.")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "User deleted successfully"),
        ApiResponse(responseCode = "404", description = "User not found"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun delete(@PathVariable email: String)
}