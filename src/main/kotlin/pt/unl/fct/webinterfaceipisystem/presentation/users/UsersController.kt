package pt.unl.fct.webinterfaceipisystem.presentation.users

import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import pt.unl.fct.webinterfaceipisystem.application.UsersApplication
import pt.unl.fct.webinterfaceipisystem.data.*
import org.springframework.security.crypto.password.PasswordEncoder


@RestController
class UsersController(private val encoder: PasswordEncoder, val app: UsersApplication) : UsersAPI {

    private fun transformStringToEnumRole(role: String): RolesDAO{
        return when (role) {
            "user" -> RolesDAO.USER
            "poweruser" -> RolesDAO.POWERUSER
            "admin" -> RolesDAO.ADMIN
            else -> throw IllegalArgumentException()
        }
    }

    private fun transformEnumToStringRole(user: UserDAO): String{
        return when (user.role) {
            RolesDAO.USER -> "user"
            RolesDAO.POWERUSER -> "poweruser"
            RolesDAO.ADMIN -> "admin"
            else -> throw IllegalArgumentException()
        }
    }

    override fun register(@RequestBody user: UserDTO){
        try {
            if(user.password.isBlank() || user.name.isBlank() ||
                    user.email.isBlank() || user.role.isBlank())
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid user data")

            val newUser = UserDAO(
                    email = user.email, password = encoder.encode(user.password),
                    name = user.name, phoneNumber = user.phoneNumber,
                    company = user.company, role = transformStringToEnumRole(user.role)
            )

            app.registerUser(newUser)

        }catch(e: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid user data")
        }
    }

    override fun login(@RequestBody user: LoginDTO): UserDTO {
        TODO("Not yet implemented")
    }

    override fun updateUserData(@RequestBody updatedUser: UpdatedUserDTO) {
        try {
            if(updatedUser.email.isBlank())
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid user data")

            val existingUser = app.getUserByEmail(updatedUser.email)
            val auxUser = UserDAO(
                    email = existingUser.email, password = existingUser.password,
                    name = updatedUser.name, phoneNumber = updatedUser.phoneNumber,
                    company = existingUser.company, role = transformStringToEnumRole(updatedUser.role)
            )
            app.updateUser(auxUser)
        }catch(e: EmptyResultDataAccessException){
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "\"User not found")
        }catch(e1: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid user data")
        }
    }

    override fun updateUserPassword(@RequestBody updatedUserPassword: UpdatedUserPasswordDTO) {
        try {
            if(updatedUserPassword.email.isBlank())
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid user data")

            val existingUser = app.getUserByEmail(updatedUserPassword.email)
            val auxUser = UserDAO(
                    email = existingUser.email, password = updatedUserPassword.password,
                    name = existingUser.name, phoneNumber = existingUser.phoneNumber,
                    company = existingUser.company, role = existingUser.role
            )
            app.updateUser(auxUser)
        }catch(e: EmptyResultDataAccessException){
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "\"User not found")
        }catch(e1: IllegalArgumentException){
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "\"Invalid user data")
        }
    }

    override fun getUserByEmail(@PathVariable email: String): UserDTO {
        try {
            val existingUser = app.getUserByEmail(email)
            return UserDTO(
                    email = existingUser.email, password = existingUser.password,
                    name = existingUser.name, phoneNumber = existingUser.phoneNumber,
                    company = existingUser.company, role = transformEnumToStringRole(existingUser)
            )
        }catch(e: Exception){
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "User with email $email not found")
        }
    }

    override fun delete(@PathVariable email: String) {
        try {
            val existingUser = app.getUserByEmail(email)
            val auxUser = UserDAO(
                    email = existingUser.email, password = existingUser.password,
                    name = existingUser.name, phoneNumber = existingUser.phoneNumber,
                    company = existingUser.company, role = existingUser.role
            )
            app.deleteUser(auxUser)
        } catch(e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "User with email $email not found")
        }
    }

}