package pt.unl.fct.webinterfaceipisystem.application

import org.springframework.stereotype.Service
import pt.unl.fct.webinterfaceipisystem.data.ConnectionsRepository
import pt.unl.fct.webinterfaceipisystem.data.InfluxDBDAO

@Service
class SettingsApplication (val connections: ConnectionsRepository) {

    fun registerConnection(newCon: InfluxDBDAO) : InfluxDBDAO {
        return connections.save(newCon)
    }

    fun updateConnection(con: InfluxDBDAO) : InfluxDBDAO {
        return connections.save(con)
    }

    fun deleteConnection(con: InfluxDBDAO){
        return connections.delete(con)
    }

    fun getConnectionByUserAndUrl(user:String, url:String) : InfluxDBDAO{
        return connections.findByUserAndUrl(user, url)
    }

    fun getConnectionsByUser(user:String) : List<InfluxDBDAO>{
        return connections.findByUser(user)
    }

    fun getAllConnections() : List<InfluxDBDAO>{
        return connections.findAll()
    }
}