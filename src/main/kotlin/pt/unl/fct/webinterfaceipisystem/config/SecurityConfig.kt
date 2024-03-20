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

@Configuration
@EnableWebSecurity
class SecurityConfig(private val authenticationProvider: AuthenticationProvider){

    @Bean
    fun securityFilterChain(http: HttpSecurity, jwtAuthenticationFilter: JwtAuthenticationFilter): DefaultSecurityFilterChain =
            http
                    .csrf {it.disable()}
                    .authorizeHttpRequests{
                        it
                                .requestMatchers("/api/auth", "/api/auth/refresh", "/error")
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