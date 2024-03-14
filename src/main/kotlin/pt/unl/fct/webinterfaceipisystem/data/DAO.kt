package pt.unl.fct.webinterfaceipisystem.data

import jakarta.persistence.*
import java.util.Date

enum class MonitoringProfDAO {
       PLAN, CROSSSECTION
}

enum class RolesDAO {
    USER, POWERUSER, ADMIN
}

@Entity
@Table(name = "User")
data class UserDAO(
        @Id
        val email:String,
        val name:String,
        val password:String,
        val phoneNumber:String,
        val company:Int,
        val role:RolesDAO
)

@Entity
@Table(name = "Company")
data class CompanyDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val name:String
)

@Entity
@Table(name = "Region")
data class RegionDAO(
        @Id
        val name:String
)

@Entity
@Table(name = "Inclinometer")
data class InclinometerDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val name:String,
        val length:Long,
        val currentFrequency:String,
        val azimuth:Long,
        val latitude:Long,
        val longitude:Long,
        val heightTopSensor:Long,
        val casingAngleToHorizontal:Long
)

@Entity
@Table(name = "MonitoringGroup")
data class MonitoringGroupDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val name:String,
        val description:String
)

@Entity
@Table(name = "Sensor")
data class SensorDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val hasFixedPoint:Boolean,
        val inclinometerId:Int
)

@Entity
@Table(name = "InclinometerFrequencyHistory")
data class InclinometerFrequencyHistoryDAO(
        @Id
        val logDate:Date,
        val frequency:Long,
        val inclinometerId:Int
)

@Entity
@Table(name = "SoilAndWaterLayers")
data class SoilAndWaterLayersDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val layer:Int,
        val waterLevel:Long,
        val surfaceLevel:Long,
        val inclinometerId:Int
)

@Entity
@Table(name = "Layer")
data class LayerDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val symbol:String,
        val description:String,
        val color:String,
        val layerThickness:Long,
        val inclinometerId:Int
)

@Entity
@Table(name = "MonitoringProfile")
data class MonitoringProfileDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val name:String,
        val code:String,
        val description:String,
        val type:MonitoringProfDAO,
        val monitoringGroupId:Int
)

@Entity
@Table(name = "ProfilePositionAdjustment")
data class ProfilePositionAdjustmentDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val type:MonitoringProfDAO,
        val imageURLPath:String,
        val monitoringProfileId:Int
)

@Entity
@Table(name = "Point")
data class PointDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val positionX:Long,
        val positionY:Long,
        val profilePositionAdjustmentId:Int
)

@Entity
@Table(name = "InfluxDB")
data class InfluxDBDAO(
        @Id
        val id:String,
        val url:String,
        val token:String,
        val port:Int,
        val organization:String,
        val bucket:String
)

@Entity
@Table(name = "MQTT")
data class MQTTDAO(
        @Id
        val id:String,
        val clientId:String,
        val server:String,
        val port:Int,
        val username:String,
        val password:String
)

