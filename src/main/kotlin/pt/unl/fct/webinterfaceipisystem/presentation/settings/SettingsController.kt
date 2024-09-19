package pt.unl.fct.webinterfaceipisystem.presentation.settings

import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import pt.unl.fct.webinterfaceipisystem.application.SettingsApplication
import pt.unl.fct.webinterfaceipisystem.data.ConnectionDTO
import pt.unl.fct.webinterfaceipisystem.data.InfluxDBDAO


@RestController
class SettingsController (val app: SettingsApplication) : SettingsAPI{

    override fun addConnection(connection: ConnectionDTO) {
        try {
            if (connection.url.isBlank() || connection.token.isBlank() || connection.org.isBlank() || connection.bucket.isBlank()) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid connection data")
            }

            val newConnection = InfluxDBDAO(
                    bucket = connection.bucket,
                    url = connection.url,
                    token = connection.token,
                    organization = connection.org
            )

            app.registerConnection(newConnection)

        } catch (e: IllegalArgumentException) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid connection data")
        }
    }

    override fun updateConnection(connection: ConnectionDTO) {
        try {
            if (connection.url.isBlank() || connection.token.isBlank() || connection.org.isBlank() || connection.bucket.isBlank()) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid connection data")
            }

            val existingConnection = app.getConnectionByBucketAndUrl(connection.bucket, connection.url)
                    ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found")

            val updatedConnection = InfluxDBDAO(
                    url = connection.url,
                    token = connection.token,
                    organization = connection.org,
                    bucket = existingConnection.bucket
            )

            app.updateConnection(updatedConnection)
        } catch (e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found")
        } catch (e1: IllegalArgumentException) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid connection data")
        }
    }

    override fun deleteConnection(connection: ConnectionDTO) {
        try {
            val existingConnection = app.getConnectionByBucketAndUrl(connection.bucket, connection.url)
                    ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found")

            app.deleteConnection(existingConnection)

        } catch (e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found")
        }
    }

    override fun getConnections(bucket: String): List<ConnectionDTO> {
        try {
            val connections = app.getConnectionsByBucket(bucket)
            return connections.map {
                ConnectionDTO(
                        url = it.url,
                        token = it.token,
                        org = it.organization,
                        bucket = it.bucket
                )
            }

        } catch (e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Connections not found")
        }
    }

    override fun getConnectionsFromMonitGroup(mg: String): List<ConnectionDTO> {
        try {
            val connections = app.getAllConnections()
            return connections.map {
                ConnectionDTO(
                        url = it.url,
                        token = it.token,
                        org = it.organization,
                        bucket = it.bucket
                )
            }

        } catch (e: EmptyResultDataAccessException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Connections not found")
        }
    }
}