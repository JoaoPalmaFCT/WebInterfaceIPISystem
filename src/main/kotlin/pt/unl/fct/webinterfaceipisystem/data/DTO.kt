package pt.unl.fct.webinterfaceipisystem.data

import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id

data class LoginDTO(
        val email: String,
        val password: String
)

data class UserDTO(
        val email:String,
        val name:String,
        val password:String,
        val phoneNumber:String,
        val company:Int,
        val role:String
)

data class UpdatedUserDTO(
        val email:String,
        val name:String,
        val phoneNumber:String,
        val role:String
)

data class UpdatedUserPasswordDTO(
        val email:String,
        val password:String
)

data class InclinometerDTO(
        val name:String,
        val length:Long,
        val currentFrequency:String,
        val azimuth:Long,
        val latitude:Long,
        val longitude:Long,
        val heightTopSensor:Long,
        val casingAngleToHorizontal:Long
)

data class MonitoringGroupDTO(
        val name:String,
        val description:String
)

data class MonitoringProfileDTO(
        val name:String,
        val code:String,
        val description:String,
        val type:String,
        val monitoringGroupId:Int
)