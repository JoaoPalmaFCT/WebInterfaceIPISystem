package pt.unl.fct.webinterfaceipisystem.service

import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Service
import pt.unl.fct.webinterfaceipisystem.auth.AuthenticationRequest
import pt.unl.fct.webinterfaceipisystem.auth.AuthenticationResponse
import pt.unl.fct.webinterfaceipisystem.config.JwtProperties
import pt.unl.fct.webinterfaceipisystem.data.RefreshTokenRep
import java.util.*

@Service
class AuthenticationService(private val authManager: AuthenticationManager,
                            private val userDetailsService: CustomUserDetailsService,
                            private val tokenService: TokenService,
                            private val jwtProperties: JwtProperties,
                            private val refreshTokenRep: RefreshTokenRep) {

    fun authentication(authRequest: AuthenticationRequest): AuthenticationResponse {
        authManager.authenticate(UsernamePasswordAuthenticationToken(authRequest.email,authRequest.password))

        val user = userDetailsService.loadUserByUsername(authRequest.email)
        val accessToken = tokenService.generate(
                userDetails = user,
                expirationDate = Date(System.currentTimeMillis() + jwtProperties.accessTokenExpiration)
        )

        val refreshToken = tokenService.generate(
                userDetails = user,
                expirationDate = Date(System.currentTimeMillis() + jwtProperties.refreshTokenExpiration)
        )

        refreshTokenRep.save(refreshToken, user)
        return AuthenticationResponse(accessToken = accessToken, refreshToken = refreshToken)
    }

    fun refreshAccessToken(token: String): String? {
        val extractedEmail = tokenService.extractEmail(token)

        return extractedEmail?.let{ email ->
            val currentUserDetails = userDetailsService.loadUserByUsername(email)
            val refreshTokenUserDetails = refreshTokenRep.findUserDetailsByToken(token)

            if(!tokenService.isExpired(token) && currentUserDetails.username == refreshTokenUserDetails?.username) {
                tokenService.generate(
                        userDetails = currentUserDetails,
                        expirationDate = Date(System.currentTimeMillis() + jwtProperties.accessTokenExpiration)
                )
            }else {
                null
            }
        }
    }

}
