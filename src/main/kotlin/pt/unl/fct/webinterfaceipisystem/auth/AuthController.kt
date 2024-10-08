package pt.unl.fct.webinterfaceipisystem.auth

import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import pt.unl.fct.webinterfaceipisystem.service.AuthenticationService

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication API")
class AuthController(private val authenticationService: AuthenticationService) {

    @PostMapping
    fun authenticate(@RequestBody authRequest: AuthenticationRequest) : AuthenticationResponse =
            authenticationService.authentication(authRequest)

    @PostMapping("/refresh")
    fun refreshAccessToken(@RequestBody request: RefreshTokenRequest): TokenResponse =
            authenticationService.refreshAccessToken(request.token)
                    ?.mapToTokenResponse()
                ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid refresh token!")

    private fun String.mapToTokenResponse(): TokenResponse =
            TokenResponse(token = this)
}