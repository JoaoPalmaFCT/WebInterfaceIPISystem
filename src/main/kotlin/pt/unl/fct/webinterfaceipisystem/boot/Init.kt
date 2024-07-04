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
            val pointRepository: PointRepository,
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
        listOfMPGroups.add(MonitoringProfileGroupDAO(1, "Barragem do Azibo", "Barragem do Azibo", 1))
        listOfMPGroups.add(MonitoringProfileGroupDAO(2, "Lab Test", "Lab Test", 2))
        monitoringProfileGroupRepository.saveAll(listOfMPGroups)

        val listOfMeasurements = mutableListOf<MeasurementsDAO>()
        listOfMeasurements.add(MeasurementsDAO(1, "Barragem do Azibo", "de41c92c9186", "I1?I2?I3?I4?I5?I6?I8?I9?I10"))
        listOfMeasurements.add(MeasurementsDAO(2, "Lab Test", "90f3ec78d23f", "I1"))
        measurementsRepository.saveAll(listOfMeasurements)

        val listOfMonitoringProfiles = mutableListOf<MonitoringProfileDAO>()
        listOfMonitoringProfiles.add(MonitoringProfileDAO(1, "1", "Barragem do Azibo", "All",
                "All inclinometers in the dam", MonitoringProfDAO.PLAN,
                "https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FimagePlan3.png?alt=media&token=06e79ca3-a159-47b7-9522-66de489f4c3f",
                "I1?I2?I3?I4?I5?I6?I8?I9?I10", 1))
        listOfMonitoringProfiles.add(MonitoringProfileDAO(2, "2", "Barragem do Azibo", "P5",
                "Profile with inclinometers 1 and 2", MonitoringProfDAO.CROSSSECTION,
                //"",
                "https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FInclinometers_perfil5_v3.svg?alt=media&token=940d3b7e-e8bf-4458-a2bc-05f6cc4a4bd3",
                "I1?I2", 1))
        listOfMonitoringProfiles.add(MonitoringProfileDAO(3, "3", "Barragem do Azibo", "P7",
                "Profile with inclinometers 3,4 and 5", MonitoringProfDAO.CROSSSECTION,
                "https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FInclinometers_perfil7_v3.svg?alt=media&token=f81bdab2-c71d-4346-b6ea-a14de53ffbe7",
                "I3?I4?I5", 1))

        listOfMonitoringProfiles.add(MonitoringProfileDAO(4, "4", "Barragem do Azibo", "P9",
                "Profile with inclinometers 6 and 8", MonitoringProfDAO.CROSSSECTION,
                "https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FInclinometers_perfil9_v3.svg?alt=media&token=ce7a67e5-4c81-495a-950a-34fcb9e1eaa9",
                "I6?I8", 1))
        listOfMonitoringProfiles.add(MonitoringProfileDAO(5, "5", "Barragem do Azibo", "P13",
                "Profile with inclinometers 9 and 10", MonitoringProfDAO.CROSSSECTION,
                "https://firebasestorage.googleapis.com/v0/b/webipisystemimagestorage.appspot.com/o/profiles%2FInclinometers_perfil13_v3.svg?alt=media&token=2ea254be-3916-4aa3-94a5-bcc0cebbdf63",
                "I9?I10", 1))
        listOfMonitoringProfiles.add(MonitoringProfileDAO(6, "6", "Lab Test", "P1",
                "Test Profile", MonitoringProfDAO.PLAN, "",
                "I1", 2))
        monitoringProfileRepository.saveAll(listOfMonitoringProfiles)

        val listOfProfilePosAjusted = mutableListOf<ProfilePositionAdjustmentDAO>()
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(1, 1,"1", "Barragem do Azibo", "I1", MonitoringProfDAO.CROSSSECTION, false, 2))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(2, 2,"2", "Barragem do Azibo", "I2", MonitoringProfDAO.CROSSSECTION, false, 2))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(3, 3,"1", "Barragem do Azibo", "I1", MonitoringProfDAO.PLAN, true, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(4, 4,"2", "Barragem do Azibo", "I2", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(5, 5,"3", "Barragem do Azibo", "I3", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(6, 6,"4", "Barragem do Azibo", "I4", MonitoringProfDAO.PLAN, true, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(7, 7,"5", "Barragem do Azibo", "I5", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(8, 8,"6", "Barragem do Azibo", "I6", MonitoringProfDAO.PLAN, false, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(9, 9,"7", "Barragem do Azibo", "I8", MonitoringProfDAO.PLAN, true, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(10, 10,"8", "Barragem do Azibo", "I9", MonitoringProfDAO.PLAN, true, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(11, 11,"9", "Barragem do Azibo", "I10", MonitoringProfDAO.PLAN, true, 1))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(12, 12,"1", "Barragem do Azibo", "I3", MonitoringProfDAO.CROSSSECTION, false, 3))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(13, 13,"2", "Barragem do Azibo", "I4", MonitoringProfDAO.CROSSSECTION, false, 3))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(14, 14,"3", "Barragem do Azibo", "I5", MonitoringProfDAO.CROSSSECTION, false, 3))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(15, 15,"1", "Barragem do Azibo", "I6", MonitoringProfDAO.CROSSSECTION, false, 4))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(16, 16,"2", "Barragem do Azibo", "I8", MonitoringProfDAO.CROSSSECTION, false, 4))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(17, 17,"1", "Barragem do Azibo", "I9", MonitoringProfDAO.CROSSSECTION, false, 5))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(18, 18,"2", "Barragem do Azibo", "I10", MonitoringProfDAO.CROSSSECTION, false, 5))
        listOfProfilePosAjusted.add(ProfilePositionAdjustmentDAO(19, 19,"1", "Lab Test", "I1", MonitoringProfDAO.PLAN, false, 6))
        profilePositionAdjustmentRepository.saveAll(listOfProfilePosAjusted)

        val listOfPoints = mutableListOf<PointDAO>()
        listOfPoints.add(PointDAO(1,294.01108323444424,139.10776712689537,3))
        listOfPoints.add(PointDAO(2,397.35154340739814,153.8640976749052,6))
        listOfPoints.add(PointDAO(3, 458.45008626873556,180.97439203371496,9))
        listOfPoints.add(PointDAO(4,498.5978897167452,87.39472608913066,10))
        listOfPoints.add(PointDAO(5,511.84842899971324,125.25530200538584,11))
        listOfPoints.add(PointDAO(6,295.5633751136337,137.65655559103905,1))
        listOfPoints.add(PointDAO(7,397.35154340739814,153.8640976749052,2))
        listOfPoints.add(PointDAO(8,458.45008626873556,180.97439203371496,12))
        listOfPoints.add(PointDAO(9,498.5978897167452,87.39472608913066,13))
        listOfPoints.add(PointDAO(10,511.84842899971324,125.25530200538584,14))
        listOfPoints.add(PointDAO(11,306.17495596283703,177.2595144688909,15))
        listOfPoints.add(PointDAO(12,387.58514765619776,114.03467213258864,16))
        listOfPoints.add(PointDAO(13,438.33092871343433,102.5079334398357,17))
        listOfPoints.add(PointDAO(14,402.49511630666495,192.8616525063293,18))
        pointRepository.saveAll(listOfPoints)

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
        listOfMarkers.add(MarkerDAO(12, 41.55679, -6.88922,12))
        listOfMarkers.add(MarkerDAO(13, 41.55648, -6.88924,13))
        listOfMarkers.add(MarkerDAO(14, 41.55614, -6.88925,14))
        listOfMarkers.add(MarkerDAO(15, 41.55676, -6.88857,15))
        listOfMarkers.add(MarkerDAO(16, 41.55614, -6.88856,16))
        listOfMarkers.add(MarkerDAO(17, 41.55675, -6.88767,17))
        listOfMarkers.add(MarkerDAO(18, 41.55644, -6.88767,18))
        markerRepository.saveAll(listOfMarkers)
    }
}