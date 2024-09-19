package pt.unl.fct.webinterfaceipisystem.data

import jakarta.persistence.*

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

data class MeasurementsDTO(
        val measurement:String,
        val host:String,
        val inclinometers:String
)

data class MonitoringGroupDTO(
        val name:String,
        val description:String,
        val inclinometers:String
)

data class MonitoringProfileGroupDTO(
        val group:String,
        val measurements: String,
        val monitoringGroupId:Int
)

data class MonitoringProfileDTO(
        val code:String,
        val group:String,
        val name:String,
        val description:String,
        val type:String,
        val attachedImage:String,
        val inclinometers: String,
        val monitoringGroupId:Int
)

data class ProfilePositionAdjustmentDTO(
        val uniqueId:Int,
        val code:String,
        val measurement:String,
        val inc:String,
        val type:MonitoringProfDAO,
        val positionAdjusted:Boolean,
        val monitoringProfileId:Int,
)

data class PointDTO(
        val positionX:Double,
        val positionY:Double,
        val profilePositionAdjustmentId:Int
)

data class MarkerDTO(
        val lat:Double,
        val lng:Double,
        val profilePositionAdjustmentId:Int
)

data class LineCrossSectionDTO(
        val topX:Double,
        val topY:Double,
        val bottomX:Double,
        val bottomY:Double,
        val profilePositionAdjustmentId:Int
)

data class ConnectionDTO(
        val url:String,
        val token:String,
        val org:String,
        val bucket:String
)

data class SoilLayersDTO(
        val position:Int,
        val symbol:String,
        val color:String,
        val description:String,
        val thickness:Int,
        val topLevel:Int
)