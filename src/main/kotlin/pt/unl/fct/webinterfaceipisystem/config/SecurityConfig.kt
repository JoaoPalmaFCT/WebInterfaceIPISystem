package pt.unl.fct.webinterfaceipisystem.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.DefaultSecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(private val authenticationProvider: AuthenticationProvider){

    @Bean
    fun securityFilterChain(http: HttpSecurity, jwtAuthenticationFilter: JwtAuthenticationFilter): DefaultSecurityFilterChain =
            http
                    .csrf {it.disable()}
                    .cors { cors ->
                        cors.configurationSource(corsConfigurationSource())
                    }
                    .authorizeHttpRequests{
                        it
                                .requestMatchers("/api/auth", "/api/auth/refresh", "/error","/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui/index.html")
                                .permitAll()
                                .requestMatchers(HttpMethod.POST,"/api/user")
                                .permitAll()
                                .requestMatchers("/api/user**")
                                .hasRole("ADMIN")
                                .anyRequest()
                                .fullyAuthenticated()
                    }
                    .sessionManagement{
                        it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    }
                    .authenticationProvider(authenticationProvider)
                    .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
                    .build()

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = listOf("http://localhost:3000", "http://localhost:8080/")
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE")
        configuration.allowCredentials = true
        configuration.allowedHeaders = listOf("Authorization", "Cache-Control", "Content-Type")

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)

        return source
    }

    /*@Service
    class MyUserDetailsService(val users: UserService) : UserDetailsService {
        override fun loadUserByUsername(username: String?): UserDetails? =
                users.findUserById(username).map {
                    User.withDefaultPasswordEncoder()
                            .username(it.username)
                            .password(it.password)
                            .roles(it.roles)
                            .build()
                }.orElse(null)

    }*/
}