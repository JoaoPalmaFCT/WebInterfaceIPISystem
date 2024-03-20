package pt.unl.fct.webinterfaceipisystem.presentation.users

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*
import pt.unl.fct.webinterfaceipisystem.data.*

@CrossOrigin
@RequestMapping("/api/user")
@Tag(name = "User", description = "Users API")
interface UsersAPI {

    @PostMapping("/")
    @Operation(summary = "Register user")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "User registered successfully"),
        ApiResponse(responseCode = "400", description = "Invalid user data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun register(@RequestBody user: UserDTO)

    @PostMapping("/login")
    @Operation(summary = "Login")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "User login successfully"),
        ApiResponse(responseCode = "400", description = "Invalid user data"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun login(@RequestBody user: LoginDTO): UserDTO

    @PutMapping("/")
    @Operation(summary = "Update user data")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "User updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid user data"),
        ApiResponse(responseCode = "404", description = "User not found"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun updateUserData(@RequestBody updatedUser: UpdatedUserDTO)

    @PutMapping("/password")
    @Operation(summary = "Update user password")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "User updated successfully"),
        ApiResponse(responseCode = "400", description = "Invalid user data"),
        ApiResponse(responseCode = "404", description = "User not found"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun updateUserPassword(@RequestBody updatedUserPassword: UpdatedUserPasswordDTO)


    @GetMapping("/{email}")
    @Operation(summary = "Find a user by its email")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "User found"),
        ApiResponse(responseCode = "404", description = "User not found"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun getUserByEmail(@PathVariable email: String): UserDTO

    @DeleteMapping("/{email}")
    @Operation(summary = "Delete a user")
    @ApiResponses(value = [
        ApiResponse(responseCode = "204", description = "User deleted successfully"),
        ApiResponse(responseCode = "404", description = "User not found"),
        ApiResponse(responseCode = "500", description = "Internal Server Error")
    ])
    fun delete(@PathVariable email: String)
}