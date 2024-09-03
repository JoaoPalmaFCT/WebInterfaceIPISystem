package pt.unl.fct.webinterfaceipisystem.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.License
import io.swagger.v3.oas.models.servers.Server
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration


@Configuration
class SwaggerConfig {

    @Value("\${openapi.dev-url}")
    private val devUrl: String? = null

    @Value("\${openapi.prod-url}")
    private val prodUrl: String? = null

    @Bean
    fun myOpenAPI(): OpenAPI {
        val devServer = Server()
        devServer.setUrl(devUrl)
        devServer.setDescription("Server URL in Development environment")
        val contact = Contact()
        contact.setName("Git Repository\n")
        contact.setUrl("https://github.com/JoaoPalmaFCT/WebInterfaceIPISystem")
        val mitLicense: License = License().name("MIT License").url("https://choosealicense.com/licenses/mit/")
        val info: Info = Info()
                .title("Web Interface For An Inclinometer Monitoring System API")
                .version("1")
                .contact(contact)
                .description("API of a web interface for an IPI system." +
                        " Project made by: João Palma")
                .license(mitLicense)
        return OpenAPI().info(info).servers(listOf(devServer))
    }
}