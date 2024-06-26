package pt.unl.fct.webinterfaceipisystem.data

import io.micrometer.core.instrument.Measurement
import jakarta.persistence.*
import java.util.Date

enum class MonitoringProfDAO {
       PLAN, CROSSSECTION
}

enum class RolesDAO {
    USER, POWERUSER, ADMIN
}

@Entity
@Table(name = "Users")
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
        val azimuth:Long? = 0,
        val latitude:Long? = null,
        val longitude:Long? = null,
        val heightTopSensor:Long,
        val casingAngleToHorizontal:Long? = 0
)

@Entity
@Table(name = "MonitoringGroup")
data class MonitoringGroupDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val name:String,
        val region:String,
        val description:String,
        val measurements:String,
        val inclinometers:String
)

@Entity
@Table(name = "Measurements")
data class MeasurementsDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val measurement:String,
        val host:String,
        val inclinometers:String
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
@Table(name = "MonitoringProfileGroup")
data class MonitoringProfileGroupDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val monitoringGroup:String,
        val measurements: String,
        val monitoringGroupId:Int
)

@Entity
@Table(name = "MonitoringProfile")
data class MonitoringProfileDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val code:String,
        val monitoringGroup:String,
        val name:String,
        val description:String,
        val type:MonitoringProfDAO,
        val attachedImage:String,
        val inclinometers: String,
        val monitoringGroupId:Int
)

@Entity
@Table(name = "ProfilePositionAdjustment")
data class ProfilePositionAdjustmentDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val code:String,
        val measurement:String,
        val inc:String,
        val type:MonitoringProfDAO,
        val positionAdjusted:Boolean,
        val monitoringProfileId:Int
)

@Entity
@Table(name = "Point")
data class PointDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val positionX:Double,
        val positionY:Double,
        val profilePositionAdjustmentId:Int
)

@Entity
@Table(name = "Marker")
data class MarkerDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val lat:Double,
        val lng:Double,
        val profilePositionAdjustmentId:Int
)

@Entity
@Table(name = "LineCrossSection")
data class LineCrossSectionDAO(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id:Int = 0,
        val topX:Double,
        val topY:Double,
        val bottomX:Double,
        val bottomY:Double,
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
