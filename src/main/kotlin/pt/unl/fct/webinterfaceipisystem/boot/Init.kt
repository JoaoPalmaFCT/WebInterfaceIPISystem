package pt.unl.fct.webinterfaceipisystem.boot

import jakarta.transaction.Transactional
import org.springframework.boot.CommandLineRunner
import org.springframework.core.annotation.Order
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import pt.unl.fct.webinterfaceipisystem.data.RolesDAO
import pt.unl.fct.webinterfaceipisystem.data.UserDAO
import pt.unl.fct.webinterfaceipisystem.data.UserRepository


@Component
@Order(1)
class Init1(val userRepository: UserRepository, private val encoder: PasswordEncoder) : CommandLineRunner {
    @Transactional
    override fun run(vararg args: String?) {

        val listOfUsers = mutableListOf<UserDAO>()
        listOfUsers.add(UserDAO("joao@gmail.com", "João", encoder.encode("1234"), "1234", 1, RolesDAO.ADMIN))
        userRepository.saveAll(listOfUsers)

    }

}