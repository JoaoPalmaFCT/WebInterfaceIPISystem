package pt.unl.fct.webinterfaceipisystem.application

import org.springframework.stereotype.Service
import pt.unl.fct.webinterfaceipisystem.data.*

@Service
class UsersApplication (val users : UserRepository) {

    fun registerUser(newUser: UserDAO): UserDAO{
        return users.save(newUser)
    }

    fun updateUser(updatedUser: UserDAO): UserDAO{
        return users.save(updatedUser)
    }

    fun deleteUser(userD: UserDAO) {
        users.delete(userD)
    }

    /*fun getUserById(id: Long): UserDAO{
        return users.findById(id).orElse(null)
    }*/

    fun getUserByEmail(email: String): UserDAO {
        return users.findByEmail(email)
    }
}