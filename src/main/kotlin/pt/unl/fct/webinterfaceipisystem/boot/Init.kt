package pt.unl.fct.webinterfaceipisystem.boot

import jakarta.transaction.Transactional
import org.springframework.boot.CommandLineRunner
import org.springframework.core.annotation.Order
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import pt.unl.fct.webinterfaceipisystem.data.*


@Component
@Order(1)
class Init1(val userRepository: UserRepository,
            val monitoringProfileGroupRepository: MonitoringProfileGroupRepository,
            val measurementsRepository: MeasurementsRepository,
            val markerRepository: MarkerRepository,
            val profilePositionAdjustmentRepository: ProfilePositionAdjustmentRepository,
            val monitoringProfileRepository: MonitoringProfileRepository,
            private val encoder: PasswordEncoder) : CommandLineRunner {
    @Transactional
    override fun run(vararg args: String?) {

        val listOfUsers = mutableListOf<UserDAO>()
        listOfUsers.add(UserDAO("joao@gmail.com", "João", encoder.encode("1234"), "1234", 1, RolesDAO.ADMIN))
        userRepository.saveAll(listOfUsers)

        val listOfMPGroups = mutableListOf<MonitoringProfileGroupDAO>()
        listOfMPGroups.add(MonitoringProfileGroupDAO(1, "Profiles1", "PK150_200?PK250_300", 1))
        listOfMPGroups.add(MonitoringProfileGroupDAO(2, "Profiles2", "PK250_300", 2))
        monitoringProfileGroupRepository.saveAll(listOfMPGroups)

        val listOfMeasurements = mutableListOf<MeasurementsDAO>()
        listOfMeasurements.add(MeasurementsDAO(1, "PK150_200", "de41c92c9186", "I1?I2?I3?I4?I5?I6?I8?I9?I10"))
        listOfMeasurements.add(MeasurementsDAO(2, "PK250_300", "90f3ec78d23f", "I1"))
        measurementsRepository.saveAll(listOfMeasurements)

        val listOfMonitoringProfiles = mutableListOf<MonitoringProfileDAO>()
        listOfMonitoringProfiles.add(MonitoringProfileDAO(1, "1", "Profiles1", "All",
                "All inclinometers in the dam (Plan)", MonitoringProfDAO.PLAN,
                "https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FimagePlan3.png?alt=media&token=06e79ca3-a159-47b7-9522-66de489f4c3f",
                "I1?I2?I3?I4?I5?I6?I8?I9?I10", 1))
        listOfMonitoringProfiles.add(MonitoringProfileDAO(2, "2", "Profiles1", "Crest",
                "All inclinometers in the dam (Plan)", MonitoringProfDAO.CROSSSECTION, "",
                "I1?I3?I6?I9", 1))
        listOfMonitoringProfiles.add(MonitoringProfileDAO(3, "3", "Profiles1", "P5",
                "All inclinometers in the dam (Plan)", MonitoringProfDAO.CROSSSECTION,
                "https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FInclinometers_perfil5_v3.svg?alt=media&token=940d3b7e-e8bf-4458-a2bc-05f6cc4a4bd3",
                "I1?I2", 1))
        listOfMonitoringProfiles.add(MonitoringProfileDAO(4, "4", "Profiles2", "P7",
                "All inclinometers in the dam (Plan)", MonitoringProfDAO.CROSSSECTION, "",
                "I3?I4?I5", 2))
        monitoringProfileRepository.saveAll(listOfMonitoringProfiles)

        val listOfProfilePosAjusted = mutableListOf<ProfilePositionAdjustmentDAO>()
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(1, "1", "PK150_200", "I1", MonitoringProfDAO.CROSSSECTION, false, 3))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(2, "2", "PK150_200", "I2", MonitoringProfDAO.CROSSSECTION, false, 3))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(3, "1", "PK150_200", "I1", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(4, "2", "PK150_200", "I2", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(5, "3", "PK150_200", "I3", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(6, "4", "PK150_200", "I4", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(7, "5", "PK150_200", "I5", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(8, "6", "PK150_200", "I6", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(9, "7", "PK150_200", "I8", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(10, "8", "PK150_200", "I9", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(11, "9", "PK150_200", "I10", MonitoringProfDAO.PLAN, false, 1))
        profilePositionAdjustmentRepository.saveAll(listOfProfilePosAjusted)

        val listOfMarkers = mutableListOf<MarkerDAO>()
        listOfMarkers.add(MarkerDAO(1, 41.55680, -6.89017,1))
        listOfMarkers.add(MarkerDAO(2, 41.55648, -6.89018,2))
        listOfMarkers.add(MarkerDAO(3, 41.55680, -6.89017,3))
        listOfMarkers.add(MarkerDAO(4, 41.55648, -6.89018,4))
        listOfMarkers.add(MarkerDAO(5, 41.55679, -6.88922,5))
        listOfMarkers.add(MarkerDAO(6, 41.55648, -6.88924,6))
        listOfMarkers.add(MarkerDAO(7, 41.55614, -6.88925,7))
        listOfMarkers.add(MarkerDAO(8, 41.55676, -6.88857,8))
        listOfMarkers.add(MarkerDAO(9, 41.55614, -6.88856,9))
        listOfMarkers.add(MarkerDAO(10, 41.55675, -6.88767,10))
        listOfMarkers.add(MarkerDAO(11, 41.55644, -6.88767,11))
        markerRepository.saveAll(listOfMarkers)
    }

}