package pt.unl.fct.webinterfaceipisystem

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication
import pt.unl.fct.webinterfaceipisystem.config.JwtProperties


@SpringBootApplication
class WebInterfaceIpiSystemApplication

fun main(args: Array<String>) {
    runApplication<WebInterfaceIpiSystemApplication>(*args)
}
